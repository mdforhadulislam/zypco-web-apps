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

// ==================== CONFIG ====================
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_ATTEMPTS_PER_IP = 10;

// In-memory storage for rate limiting (use Redis for production)
const failedAttempts = new Map<string, LoginAttempt[]>();

// ==================== HELPERS ====================
function getClientInfo(req: Request) {
  const headers = req.headers as any;
  const ipAddress =
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown";
  const userAgent = headers.get("user-agent") || "unknown";
  return { ipAddress, userAgent };
}

function isRateLimited(key: string): boolean {
  const attempts = failedAttempts.get(key) || [];
  const now = Date.now();
  const recent = attempts.filter((a) => now - a.timestamp.getTime() < RATE_LIMIT_WINDOW);
  failedAttempts.set(key, recent);
  return recent.length >= MAX_ATTEMPTS_PER_IP;
}

function addFailedAttempt(key: string, attempt: LoginAttempt) {
  const attempts = failedAttempts.get(key) || [];
  attempts.push(attempt);
  failedAttempts.set(key, attempts);
}

async function logLoginAttempt(
  user: User | null,
  phone: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  failureReason?: string,
  action: string = success ? "login" : "failed_login"
) {
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
  } catch (err) {
    console.error("Failed to log login attempt:", err);
  }
}

// ==================== LOGIN HANDLER ====================
export const POST = createRateLimitedHandler(
  async ({ req }) => {
    const { ipAddress, userAgent } = getClientInfo(req);
    let phone = "";

    try {
      await connectDB();

      // Rate limit by IP
      if (isRateLimited(ipAddress)) {
        return errorResponse({ status: 429, message: "Too many requests. Try again later.", req });
      }

      const body = (await req.json()) as SigninBody;
      phone = body.phone;
      const { password } = body;

      // Validate input
      if (!phone || !password) {
        await logLoginAttempt(null, phone || "", ipAddress, userAgent, false, "Missing phone or password");
        return errorResponse({ status: 400, message: "Phone and password are required", req });
      }

      // Validate phone format
      if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
        await logLoginAttempt(null, phone, ipAddress, userAgent, false, "Invalid phone format");
        return errorResponse({ status: 400, message: "Invalid phone number format", req });
      }

      // Rate limit by phone
      if (isRateLimited(phone)) {
        return errorResponse({ status: 429, message: "Too many failed attempts. Try again later.", req });
      }

      // Find user
      const user = await User.findOne({ phone }).select("+password +loginAttempts +lockUntil");
      if (!user) {
        addFailedAttempt(ipAddress, { phone, ipAddress, userAgent, timestamp: new Date() });
        addFailedAttempt(phone, { phone, ipAddress, userAgent, timestamp: new Date() });
        await logLoginAttempt(null, phone, ipAddress, userAgent, false, "User not found");
        return errorResponse({ status: 401, message: "Invalid phone number or password", req });
      }

      // Check lock
      if (user.lockUntil && user.lockUntil > new Date()) {
        const remaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
        await logLoginAttempt(user, phone, ipAddress, userAgent, false, "Account locked");
        return errorResponse({ status: 423, message: `Account temporarily locked. Try again in ${remaining} minutes.`, req });
      }

      // Check active & verified
      if (!user.isActive) {
        await logLoginAttempt(user, phone, ipAddress, userAgent, false, "Account deactivated");
        return errorResponse({ status: 403, message: "Account deactivated. Contact support.", req });
      }

      if (!user.isVerified) {
        await logLoginAttempt(user, phone, ipAddress, userAgent, false, "Email not verified");
        return errorResponse({ status: 403, message: "Please verify your email first.", req });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        if (user.loginAttempts >= MAX_FAILED_ATTEMPTS) user.lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
        await user.save();

        addFailedAttempt(ipAddress, { phone, ipAddress, userAgent, timestamp: new Date() });
        addFailedAttempt(phone, { phone, ipAddress, userAgent, timestamp: new Date() });
        await logLoginAttempt(user, phone, ipAddress, userAgent, false, "Invalid password");

        return errorResponse({ status: 401, message: "Invalid phone number or password", req });
      }

      // Successful login
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLogin = new Date();
      await user.save();

      if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET not configured");

      const userId = user._id as Types.ObjectId;
      const accessToken = jwt.sign({ id: userId.toString(), role: user.role, type: "access" }, process.env.JWT_SECRET as Secret, { expiresIn: "15m" });
      const refreshToken = jwt.sign({ id: userId.toString(), role: user.role, type: "refresh" }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET as Secret, { expiresIn: "7d" });

      // Store refresh token (last 5)
      try {
        user.refreshTokens = user.refreshTokens || [];
        user.refreshTokens.push(refreshToken);
        if (user.refreshTokens.length > 5) user.refreshTokens = user.refreshTokens.slice(-5);
        await user.save();
      } catch (err) {
        console.error("Failed to store refresh token:", err);
      }

      await logLoginAttempt(user, phone, ipAddress, userAgent, true, undefined, "login");

      // Send login notification
      notificationService.sendAuthNotification({ phone: user.phone, email: user.email, name: user.name }, "login_alert").catch(console.error);

      return successResponse({
        status: 200,
        message: "Sign in successful",
        data: {
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
        },
        req,
      });

    } catch (err: unknown) {
      console.error("Signin API Error:", err);
      await logLoginAttempt(null, phone, ipAddress, userAgent, false, "Server error").catch(() => {});
      return errorResponse({ status: 500, message: "Error during sign in. Try again.", req });
    }
  },
  { max: 10, windowMs: 60000 }
);
