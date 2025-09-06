import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/server/models/User.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler } from "@/lib/utils/apiHelpers";
import { userSchemas } from "@/lib/middleware/validation";
import { AuthMiddleware } from "@/lib/middleware/auth";
import { notificationService } from "@/services/notificationService";
import { emailService } from "@/services/emailService";
import { generateSecureCode } from "@/lib/utils/apiHelpers";

export const POST = createApiHandler({
  auth: { required: false },
  validation: { body: userSchemas.register },
  rateLimit: 'auth'
})(async (req) => {
  try {
    await connectDB();
    
    const { name, phone, email, password } = req.validatedData!.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'phone';
      return errorResponse({
        req,
        status: 409,
        message: "User already exists",
        error: `A user with this ${field} already exists`
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification code
    const verificationCode = generateSecureCode(6);
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user
    const user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      role: 'user',
      isActive: true,
      isVerified: false,
      emailVerification: {
        code: verificationCode,
        expiresAt: verificationExpiry,
        attempts: 0
      },
      preferences: {
        notifications: {
          email: true,
          sms: true
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await user.save();

    // Generate JWT tokens
    const tokens = AuthMiddleware.generateTokens(user._id.toString());

    // Send welcome email with verification code
    await emailService.sendWelcomeEmail({
      email: user.email,
      name: user.name,
      verificationCode: verificationCode
    });

    // Send notification
    await notificationService.sendAuthNotification(
      { phone, email, name },
      'welcome'
    );

    // Log successful registration
    console.log(`New user registered: ${email} (${phone})`);

    return successResponse({
      req,
      status: 201,
      message: "User registered successfully. Please verify your email.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          preferences: user.preferences,
          createdAt: user.createdAt
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || "15m"
        }
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Registration failed",
      error: "An error occurred during user registration"
    });
  }
});

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}