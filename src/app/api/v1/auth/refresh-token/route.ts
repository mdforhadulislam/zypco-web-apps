import { NextRequest, NextResponse } from "next/server";
import { User } from "@/server/models/User.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler } from "@/lib/utils/apiHelpers";
import { AuthMiddleware } from "@/lib/middleware/auth";
import { z } from "zod";

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required")
});

export const POST = createApiHandler({
  auth: { required: false },
  validation: { body: refreshTokenSchema },
  rateLimit: 'auth'
})(async (req) => {
  try {
    await connectDB();
    
    const { refreshToken } = req.validatedData!.body;

    // Verify refresh token
    const userId = await AuthMiddleware.verifyRefreshToken(refreshToken);
    
    if (!userId) {
      return errorResponse({
        req,
        status: 401,
        message: "Invalid refresh token",
        error: "Refresh token is invalid or expired"
      });
    }

    // Get user details
    const user = await User.findById(userId);
    
    if (!user || !user.isActive) {
      return errorResponse({
        req,
        status: 401,
        message: "User not found or inactive",
        error: "Unable to refresh token"
      });
    }

    // Generate new tokens
    const tokens = AuthMiddleware.generateTokens(userId);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return successResponse({
      req,
      status: 200,
      message: "Tokens refreshed successfully",
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || "15m"
        }
      }
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Token refresh failed",
      error: "An error occurred while refreshing the token"
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