import connectDB from "@/config/db";
import { createRateLimitedHandler } from "@/server/common/apiWrapper";
import { errorResponse, successResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { User } from "@/server/models/User.model";
import { notificationService } from "@/services/notificationService";
import jwt, { Secret } from "jsonwebtoken";
import { Types } from "mongoose";

interface SigninBody {
  phone: string;
  password: string;
}

interface LoginAttempt {
  phone: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Rate limiting: Track failed attempts per IP and phone
const failedAttempts = new Map<string, LoginAttempt[]>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS_PER_IP = 10;

function getClientInfo(req: Request) {
  const headers = req.headers as any;
  const ipAddress = headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                   headers.get("x-real-ip") || 
                   "unknown";
  const userAgent = headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

function isRateLimited(key: string): boolean {
  const attempts = failedAttempts.get(key) || [];
  const now = new Date();
  const recentAttempts = attempts.filter(
    attempt => now.getTime() - attempt.timestamp.getTime() < RATE_LIMIT_WINDOW
  );
  
  // Update the attempts array
  failedAttempts.set(key, recentAttempts);
  
  return recentAttempts.length >= MAX_ATTEMPTS_PER_IP;
}

function addFailedAttempt(key: string, attempt: LoginAttempt): void {
  const attempts = failedAttempts.get(key) || [];
  attempts.push(attempt);
  failedAttempts.set(key, attempts);
}

async function logLoginAttempt(
  user: any | null,
  phone: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  failureReason?: string,
  action: string = success ? "login" : "failed_login"
): Promise<void> {
  try {
    await LoginHistory.create({
      user: user?._id || null,
      phone,
      ipAddress,
      userAgent,
      success,
      failureReason,
      action,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to log login attempt:", error);
  }
}

export const POST = createRateLimitedHandler(
  async ({ req }) => {
    const { ipAddress, userAgent } = getClientInfo(req);
    let phone = "";

    try {
      await connectDB();

      // Check rate limiting by IP
      if (isRateLimited(ipAddress)) {
        return errorResponse({
          status: 429,
          message: "Too many requests. Please try again later.",
          req,
        });
      }

      const body = await req.json() as SigninBody;
      phone = body.phone;
      const { password } = body;

      // Validate input
      if (!phone || !password) {
        await logLoginAttempt(
          null,
          phone || "",
          ipAddress,
          userAgent,
          false,
          "Missing phone or password"
        );

        return errorResponse({
          status: 400,
          message: "Phone and password are required",
          req,
        });
      }

      // Validate phone format (basic validation)
      if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
        await logLoginAttempt(
          null,
          phone,
          ipAddress,
          userAgent,
          false,
          "Invalid phone format"
        );

        return errorResponse({
          status: 400,
          message: "Invalid phone number format",
          req,
        });
      }

      // Check rate limiting by phone
      if (isRateLimited(phone)) {
        return errorResponse({
          status: 429,
          message: "Too many failed attempts. Please try again later.",
          req,
        });
      }

      // Find user
      const user = await User.findOne({ phone }).select("+password +loginAttempts +lockUntil");
      if (!user) {
        // Add failed attempt for IP and phone
        addFailedAttempt(ipAddress, { phone, ipAddress, userAgent, timestamp: new Date() });
        addFailedAttempt(phone, { phone, ipAddress, userAgent, timestamp: new Date() });

        await logLoginAttempt(
          null,
          phone,
          ipAddress,
          userAgent,
          false,
          "User not found"
        );

        // Return generic message to prevent user enumeration
        return errorResponse({
          status: 401,
          message: "Invalid phone number or password",
          req,
        });
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        await logLoginAttempt(
          user,
          phone,
          ipAddress,
          userAgent,
          false,
          "Account temporarily locked"
        );

        const lockRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
        return errorResponse({
          status: 423,
          message: `Account is temporarily locked. Try again in ${lockRemaining} minutes.`,
          req,
        });
      }

      // Check if account is active
      if (!user.isActive) {
        await logLoginAttempt(
          user,
          phone,
          ipAddress,
          userAgent,
          false,
          "Account deactivated"
        );

        return errorResponse({
          status: 403,
          message: "Account has been deactivated. Please contact support.",
          req,
        });
      }

      // Check if email is verified
      if (!user.isVerified) {
        await logLoginAttempt(
          user,
          phone,
          ipAddress,
          userAgent,
          false,
          "Email not verified"
        );

        return errorResponse({
          status: 403,
          message: "Please verify your email address before signing in.",
          req,
        });
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        // Increment failed attempts
        user.loginAttempts = (user.loginAttempts || 0) + 1;

        // Lock account after max failed attempts
        if (user.loginAttempts >= MAX_FAILED_ATTEMPTS) {
          user.lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
        }

        await user.save();

        // Add failed attempt for tracking
        addFailedAttempt(ipAddress, { phone, ipAddress, userAgent, timestamp: new Date() });
        addFailedAttempt(phone, { phone, ipAddress, userAgent, timestamp: new Date() });

        await logLoginAttempt(
          user,
          phone,
          ipAddress,
          userAgent,
          false,
          "Invalid password"
        );

        return errorResponse({
          status: 401,
          message: "Invalid phone number or password",
          req,
        });
      }

      // Reset failed attempts on successful login
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = new Date();
      await user.save();

      // Check JWT secret
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not configured");
      }

      // Generate tokens
      const userId = user._id as Types.ObjectId;
      const accessToken = jwt.sign(
        { 
          id: userId.toString(), 
          role: user.role,
          type: "access"
        },
        process.env.JWT_SECRET as Secret,
        { expiresIn: "15m" } // Short-lived access token
      );

      const refreshToken = jwt.sign(
        { 
          id: userId.toString(), 
          role: user.role,
          type: "refresh"
        },
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET as Secret,
        { expiresIn: "7d" } // Longer-lived refresh token
      );

      // Store refresh token (optional but recommended)
      try {
        user.refreshTokens = user.refreshTokens || [];
        user.refreshTokens.push(refreshToken);
        
        // Keep only last 5 refresh tokens per user
        if (user.refreshTokens.length > 5) {
          user.refreshTokens = user.refreshTokens.slice(-5);
        }
        
        await user.save();
      } catch (error) {
        console.error("Failed to save refresh token:", error);
        // Continue with login even if refresh token storage fails
      }

      // Log successful login
      await logLoginAttempt(
        user,
        phone,
        ipAddress,
        userAgent,
        true,
        undefined,
        "login"
      );

      // Send login notification (non-blocking)
      notificationService
        .sendAuthNotification(
          { 
            phone: user.phone, 
            email: user.email, 
            name: user.name 
          },
          "login_alert"
        )
        .catch((err) => console.error("Failed to send login alert:", err));

      // Prepare secure response data
      const responseData = {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar || null,
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
        accessToken,
        refreshToken,
        expiresIn: "15m",
      };

      return successResponse({
        status: 200,
        message: "Sign in successful",
        data: responseData,
        req,
      });

    } catch (error: unknown) {
      console.error("Signin API Error:", error);

      // Log failed attempt due to server error
      await logLoginAttempt(
        null,
        phone,
        ipAddress,
        userAgent,
        false,
        "Server error"
      ).catch(() => {}); // Ignore logging errors

      return errorResponse({
        status: 500,
        message: "An error occurred during sign in. Please try again.",
        req,
      });
    }
  },
  { max: 10, windowMs: 60000 } // 10 requests per minute per IP
);