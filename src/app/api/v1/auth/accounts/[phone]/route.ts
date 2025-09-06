import { NextRequest, NextResponse } from "next/server";
import { User } from "@/server/models/User.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler, sanitizeUser } from "@/lib/utils/apiHelpers";
import { AuthMiddleware } from "@/lib/middleware/auth";
import { userSchemas } from "@/lib/middleware/validation";

// Get user account details
export const GET = createApiHandler({
  auth: { required: true },
  rateLimit: 'general'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const phone = params?.phone;
    
    if (!phone) {
      return errorResponse({
        req,
        status: 400,
        message: "Phone number is required"
      });
    }

    // Validate phone access
    const phoneAccess = await AuthMiddleware.validatePhoneAccess(req, phone);
    if (!phoneAccess.success && phoneAccess.response) {
      return phoneAccess.response;
    }

    // Find user
    const user = await User.findOne({ phone });
    
    if (!user) {
      return errorResponse({
        req,
        status: 404,
        message: "User not found",
        error: `No user found with phone number: ${phone}`
      });
    }

    const sanitizedUser = sanitizeUser(user);

    return successResponse({
      req,
      status: 200,
      message: "User account retrieved successfully",
      data: { user: sanitizedUser }
    });

  } catch (error) {
    console.error('Get user account error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to retrieve user account",
      error: "An error occurred while fetching user details"
    });
  }
});

// Update user account
export const PUT = createApiHandler({
  auth: { required: true },
  validation: { body: userSchemas.updateProfile },
  rateLimit: 'general'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const phone = params?.phone;
    const updateData = req.validatedData!.body;
    
    if (!phone) {
      return errorResponse({
        req,
        status: 400,
        message: "Phone number is required"
      });
    }

    // Validate phone access
    const phoneAccess = await AuthMiddleware.validatePhoneAccess(req, phone);
    if (!phoneAccess.success && phoneAccess.response) {
      return phoneAccess.response;
    }

    // Find user
    const user = await User.findOne({ phone });
    
    if (!user) {
      return errorResponse({
        req,
        status: 404,
        message: "User not found"
      });
    }

    // Check if email is being changed and if it's unique
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findOne({ email: updateData.email });
      if (existingUser) {
        return errorResponse({
          req,
          status: 409,
          message: "Email already exists",
          error: "A user with this email already exists"
        });
      }
      
      // If email changes, mark as unverified
      user.isVerified = false;
      user.emailVerification = {
        code: generateSecureCode(6),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        attempts: 0
      };
    }

    // Update allowed fields
    const updatedFields: string[] = [];
    
    if (updateData.name !== undefined) {
      user.name = updateData.name;
      updatedFields.push('name');
    }
    
    if (updateData.email !== undefined) {
      user.email = updateData.email;
      updatedFields.push('email');
    }
    
    if (updateData.preferences !== undefined) {
      user.preferences = {
        ...user.preferences,
        ...updateData.preferences
      };
      updatedFields.push('preferences');
    }

    user.updatedAt = new Date();
    await user.save();

    // Send verification email if email was changed
    if (updatedFields.includes('email') && user.emailVerification?.code) {
      const { emailService } = await import("@/services/emailService");
      await emailService.sendVerificationEmail({
        email: user.email,
        name: user.name,
        code: user.emailVerification.code
      });
    }

    const sanitizedUser = sanitizeUser(user);

    return successResponse({
      req,
      status: 200,
      message: "User account updated successfully",
      data: {
        user: sanitizedUser,
        updatedFields,
        emailVerificationRequired: updatedFields.includes('email')
      }
    });

  } catch (error) {
    console.error('Update user account error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to update user account",
      error: "An error occurred while updating user details"
    });
  }
});

// Helper function for generating secure codes
function generateSecureCode(length: number = 6): string {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  
  return result;
}

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}