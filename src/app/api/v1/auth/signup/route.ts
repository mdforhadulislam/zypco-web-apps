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
  // International phone number format validation
  const phoneRegex = /^\+?[1-9]\d{7,14}$/;
  return phoneRegex.test(phone);
}

function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push("Password must contain at least one special character (@$!%*?&)");
  }
  
  // Check for common weak passwords
  const commonPasswords = ['password', '12345678', 'qwerty123', 'admin123'];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push("Password is too common, please choose a stronger password");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function validateName(name: string): boolean {
  // Name should be 2-50 characters, letters, spaces, and common punctuation only
  const nameRegex = /^[a-zA-Z\s\-.']{2,50}$/;
  return nameRegex.test(name.trim());
}

function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

function isRateLimited(ipAddress: string): boolean {
  const now = Date.now();
  const attempts = signupAttempts.get(ipAddress) || 0;
  
  // Clean up old entries
  signupAttempts.forEach((timestamp, ip) => {
    if (now - timestamp > RATE_LIMIT_WINDOW) {
      signupAttempts.delete(ip);
    }
  });
  
  return attempts >= SIGNUP_RATE_LIMIT;
}

function recordSignupAttempt(ipAddress: string): void {
  const current = signupAttempts.get(ipAddress) || 0;
  signupAttempts.set(ipAddress, current + 1);
}

<<<<<<< HEAD
/**
 * POST /api/v1/auth/signup
 * Register new user with comprehensive validation and security measures
 */
export async function POST(req: NextRequest) {
  const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                   req.headers.get("x-real-ip") || 
                   req?.ip || 
                   "unknown";
=======
export const POST = createRateLimitedHandler(
  async ({ req }) => {
    const headers = req.headers as any;
    const ipAddress = headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     headers.get("x-real-ip") || 
                     "unknown";
>>>>>>> 089c2160029c35f7edd4bf3f478385d7cb688f7d

    try {
      await connectDB();

      // Rate limiting check
      if (isRateLimited(ipAddress)) {
        return errorResponse({
          status: 429,
          message: "Too many signup attempts. Please try again later.",
          req,
        });
      }

      const body = await req.json() as SignupBody;
      let { name, phone, email, password, agreeToTerms } = body;

      // Validate required fields
      if (!name || !phone || !email || !password) {
        return errorResponse({
          status: 400,
          message: "Name, phone, email, and password are required",
          req,
        });
      }

      // Check terms agreement
      if (!agreeToTerms) {
        return errorResponse({
          status: 400,
          message: "You must agree to the terms and conditions",
          req,
        });
      }

      // Sanitize inputs
      name = sanitizeInput(name);
      email = sanitizeInput(email.toLowerCase());
      phone = sanitizeInput(phone);

      // Validate name
      if (!validateName(name)) {
        return errorResponse({
          status: 400,
          message: "Name must be 2-50 characters and contain only letters, spaces, hyphens, periods, and apostrophes",
          req,
        });
      }

      // Validate email
      if (!validateEmail(email)) {
        return errorResponse({
          status: 400,
          message: "Please provide a valid email address",
          req,
        });
      }

      // Validate phone
      if (!validatePhone(phone)) {
        return errorResponse({
          status: 400,
          message: "Please provide a valid phone number in international format",
          req,
        });
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return errorResponse({
          status: 400,
          message: "Password requirements not met",
          details: passwordValidation.errors,
          req,
        });
      }

      // Check for existing users
      const existingUser = await User.findOne({
        $or: [
          { email: email },
          { phone: phone }
        ]
      }).select("email phone isActive");

      if (existingUser) {
        // Don't specify which field already exists to prevent enumeration
        recordSignupAttempt(ipAddress);
        
        return errorResponse({
          status: 409,
          message: "An account with this email or phone number already exists",
          req,
        });
      }

      // Create new user
      const newUser = new User({
        name,
        phone,
        email,
        password, // Will be hashed by the model's pre-save middleware
        role: "user", // Default role
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
        registrationIP: ipAddress,
      });

      // Generate verification code
      const verificationCode = newUser.generateVerificationCode();
      
      // Save user
      await newUser.save();

      // Send verification email (non-blocking)
      const emailPromise = emailService.sendVerificationEmail({
        email: newUser.email,
        name: newUser.name,
        code: verificationCode,
      });

      // Send welcome notification (non-blocking)
      const notificationPromise = notificationService.sendAuthNotification(
        {
          phone: newUser.phone,
          email: newUser.email,
          name: newUser.name,
        },
        "welcome"
      );

      // Record successful signup attempt
      recordSignupAttempt(ipAddress);

      // Wait for email to be sent or timeout after 5 seconds
      const emailTimeout = new Promise(resolve => setTimeout(resolve, 5000));
      const emailResult = await Promise.race([emailPromise, emailTimeout]);

      // Wait for notification (don't block on this)
      notificationPromise.catch(err => {
        console.error("Failed to send welcome notification:", err);
      });

      // Prepare response (exclude sensitive data)
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

      // Record failed attempt
      recordSignupAttempt(ipAddress);

      // Check for specific MongoDB errors
      if (error instanceof Error) {
        // Handle duplicate key error (shouldn't happen with our pre-check, but just in case)
        if (error.message.includes('E11000') || error.message.includes('duplicate key')) {
          return errorResponse({
            status: 409,
            message: "An account with this email or phone number already exists",
            req,
          });
        }

        // Handle validation errors
        if (error.message.includes('validation')) {
          return errorResponse({
            status: 400,
            message: "Invalid input data provided",
            req,
          });
        }
      }

      // Generic server error response
      return errorResponse({
        status: 500,
        message: "An error occurred during registration. Please try again.",
        req,
      });
    }
  },
  { max: 5, windowMs: 60000 } // 5 requests per minute per IP
);