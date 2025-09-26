import connectDB from "@/config/db";
import { createRateLimitedHandler } from "@/server/common/apiWrapper";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import { emailService } from "@/services/emailService";
import { notificationService } from "@/services/notificationService";

interface SignupBody {
  name: string;
  phone: string;
  email: string;
  password: string;
  agreeToTerms?: boolean;
}

// Rate limiting for signup attempts
const signupAttempts = new Map<string, number>();
const SIGNUP_RATE_LIMIT = 3; // Max 3 signups per IP per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  return phoneRegex.test(phone);
}

function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) errors.push("Password must be at least 8 characters long");
  if (password.length > 128) errors.push("Password must not exceed 128 characters");
  if (!/(?=.*[a-z])/.test(password)) errors.push("Password must contain at least one lowercase letter");
  if (!/(?=.*[A-Z])/.test(password)) errors.push("Password must contain at least one uppercase letter");
  if (!/(?=.*\d)/.test(password)) errors.push("Password must contain at least one number");
  if (!/(?=.*[@$!%*?&])/.test(password)) errors.push("Password must contain at least one special character (@$!%*?&)");
  
  const commonPasswords = ["password", "12345678", "qwerty123", "admin123"];
  if (commonPasswords.some(p => password.toLowerCase().includes(p))) errors.push("Password is too common, please choose a stronger password");

  return { isValid: errors.length === 0, errors };
}

function validateName(name: string): boolean {
  const nameRegex = /^[a-zA-Z\s\-.']{2,50}$/;
  return nameRegex.test(name.trim());
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

function isRateLimited(ipAddress: string): boolean {
  const now = Date.now();
  const attempts = signupAttempts.get(ipAddress) || 0;

  // Clean up old entries
  signupAttempts.forEach((timestamp, ip) => {
    if (now - timestamp > RATE_LIMIT_WINDOW) signupAttempts.delete(ip);
  });

  return attempts >= SIGNUP_RATE_LIMIT;
}

function recordSignupAttempt(ipAddress: string): void {
  const current = signupAttempts.get(ipAddress) || 0;
  signupAttempts.set(ipAddress, current + 1);
}

export const POST = createRateLimitedHandler(
  async ({ req }) => {
    const headers = req.headers as any;
    const ipAddress =
      headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      headers.get("x-real-ip") ||
      "unknown";

    try {
      await connectDB();

      if (isRateLimited(ipAddress)) {
        return errorResponse({
          status: 429,
          message: "Too many signup attempts. Please try again later.",
          req,
        });
      }

      const body = (await req.json()) as SignupBody;
      let { name, phone, email, password, agreeToTerms } = body;

      if (!name || !phone || !email || !password) {
        return errorResponse({
          status: 400,
          message: "Name, phone, email, and password are required",
          req,
        });
      }

      if (!agreeToTerms) {
        return errorResponse({
          status: 400,
          message: "You must agree to the terms and conditions",
          req,
        });
      }

      // Sanitize
      name = sanitizeInput(name);
      email = sanitizeInput(email.toLowerCase());
      phone = sanitizeInput(phone);

      if (!validateName(name)) {
        return errorResponse({
          status: 400,
          message: "Name must be 2-50 characters and contain only letters, spaces, hyphens, periods, and apostrophes",
          req,
        });
      }

      if (!validateEmail(email)) {
        return errorResponse({ status: 400, message: "Please provide a valid email address", req });
      }

      if (!validatePhone(phone)) {
        return errorResponse({ status: 400, message: "Please provide a valid phone number in international format", req });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return errorResponse({
          status: 400,
          message: "Password requirements not met",
          error: passwordValidation.errors,
          req,
        });
      }

      const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
      }).select("email phone isActive");

      if (existingUser) {
        recordSignupAttempt(ipAddress);
        return errorResponse({
          status: 409,
          message: "An account with this email or phone number already exists",
          req,
        });
      }

      const newUser = new User({
        name,
        phone,
        email,
        password, // hashed in pre-save middleware
        role: "user",
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        registrationIP: ipAddress,
      });

      const verificationCode = newUser.generateVerificationCode();
      await newUser.save();

      // Send email & notification asynchronously
      emailService.sendVerificationEmail({
        email: newUser.email,
        name: newUser.name,
        code: verificationCode,
      }).catch(err => console.error("Email send error:", err));

      notificationService.sendAuthNotification(
        { phone: newUser.phone, email: newUser.email, name: newUser.name },
        "welcome"
      ).catch(err => console.error("Notification send error:", err));

      recordSignupAttempt(ipAddress);

      const responseData = {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          isVerified: newUser.isVerified,
          role: newUser.role,
        },
        message: "Account created successfully",
        nextStep: "Please check your email for verification instructions",
        verificationRequired: true,
      };

      return successResponse({
        status: 201,
        message: "Signup successful! Please verify your email address.",
        data: responseData,
        req,
      });

    } catch (error: unknown) {
      console.error("Signup API Error:", error);
      recordSignupAttempt(ipAddress);

      return errorResponse({
        status: 500,
        message: "An error occurred during registration. Please try again.",
        req,
      });
    }
  },
  { max: 5, windowMs: 60000 } // 5 requests per minute per IP
);
