import { NextRequest, NextResponse } from "next/server";
import { User } from "@/server/models/User.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler } from "@/lib/utils/apiHelpers";
import { userSchemas } from "@/lib/middleware/validation";
import { notificationService } from "@/services/notificationService";
import { emailService } from "@/services/emailService";
import { generateSecureCode } from "@/lib/utils/apiHelpers";

const MAX_VERIFICATION_ATTEMPTS = 5;

export const POST = createApiHandler({
  auth: { required: true },
  validation: { body: userSchemas.verifyEmail },
  rateLimit: 'auth'
})(async (req) => {
  try {
    await connectDB();
    
    const { code } = req.validatedData!.body;
    const userId = req.user!.id;

    // Find user with email verification details
    const user = await User.findById(userId).select('+emailVerification');
    
    if (!user) {
      return errorResponse({
        req,
        status: 404,
        message: "User not found",
        error: "User account not found"
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return successResponse({
        req,
        status: 200,
        message: "Email already verified",
        data: {
          user: {
            id: user._id,
            isVerified: true,
            verifiedAt: user.emailVerification?.verifiedAt
          }
        }
      });
    }

    // Check if verification code exists
    if (!user.emailVerification || !user.emailVerification.code) {
      return errorResponse({
        req,
        status: 400,
        message: "No verification code found",
        error: "Please request a new verification code"
      });
    }

    // Check if code is expired
    if (user.emailVerification.expiresAt < new Date()) {
      return errorResponse({
        req,
        status: 410,
        message: "Verification code expired",
        error: "Please request a new verification code"
      });
    }

    // Check attempt limit
    if (user.emailVerification.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      return errorResponse({
        req,
        status: 429,
        message: "Too many verification attempts",
        error: "Please request a new verification code"
      });
    }

    // Verify code
    if (user.emailVerification.code !== code.toUpperCase()) {
      // Increment attempts
      user.emailVerification.attempts += 1;
      await user.save();

      return errorResponse({
        req,
        status: 400,
        message: "Invalid verification code",
        error: "Please check the code and try again"
      });
    }

    // Mark as verified
    user.isVerified = true;
    user.emailVerification = {
      ...user.emailVerification,
      verifiedAt: new Date(),
      code: undefined, // Clear the code
      expiresAt: undefined,
      attempts: 0
    };

    await user.save();

    // Send welcome notification
    await notificationService.sendNotification({
      userId: user._id.toString(),
      title: "Email Verified Successfully",
      message: "Your email address has been verified. You now have full access to all Zypco services!",
      type: "success",
      category: "account",
      actionUrl: "/dashboard",
      actionText: "Explore Dashboard",
      channels: ["inapp"]
    });

    // Log verification success
    console.log(`Email verified for user: ${user.email}`);

    return successResponse({
      req,
      status: 200,
      message: "Email verified successfully",
      data: {
        user: {
          id: user._id,
          isVerified: true,
          verifiedAt: user.emailVerification.verifiedAt
        }
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Verification failed",
      error: "An error occurred during email verification"
    });
  }
});

// Resend verification code
export const PUT = createApiHandler({
  auth: { required: true },
  rateLimit: 'auth'
})(async (req) => {
  try {
    await connectDB();
    
    const userId = req.user!.id;

    const user = await User.findById(userId).select('+emailVerification');
    
    if (!user) {
      return errorResponse({
        req,
        status: 404,
        message: "User not found"
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return errorResponse({
        req,
        status: 400,
        message: "Email already verified"
      });
    }

    // Check rate limiting for resend (max 3 per hour)
    const lastSent = user.emailVerification?.lastSentAt;
    if (lastSent && (Date.now() - lastSent.getTime()) < 5 * 60 * 1000) { // 5 minutes
      return errorResponse({
        req,
        status: 429,
        message: "Please wait before requesting another code",
        error: "You can request a new code every 5 minutes"
      });
    }

    // Generate new verification code
    const verificationCode = generateSecureCode(6);
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new code
    user.emailVerification = {
      code: verificationCode,
      expiresAt: verificationExpiry,
      attempts: 0,
      lastSentAt: new Date()
    };

    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail({
      email: user.email,
      name: user.name,
      code: verificationCode
    });

    return successResponse({
      req,
      status: 200,
      message: "New verification code sent to your email",
      data: {
        expiresAt: verificationExpiry,
        lastSentAt: new Date()
      }
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to resend verification code",
      error: "An error occurred while sending the verification code"
    });
  }
});

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}