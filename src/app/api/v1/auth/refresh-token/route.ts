import connectDB from "@/config/db";
import { createRateLimitedHandler } from "@/server/common/apiWrapper";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import jwt, { Secret } from "jsonwebtoken";
import { Types } from "mongoose";

interface RefreshTokenBody {
  refreshToken: string;
}

export const POST = createRateLimitedHandler(
  async ({ req }) => {
    try {
      await connectDB();

      const body = await req.json() as RefreshTokenBody;
      const { refreshToken } = body;

      // Validate input
      if (!refreshToken) {
        return errorResponse({
          status: 400,
          message: "Refresh token is required",
          req,
        });
      }

      // Check JWT secret
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET environment variable is not configured");
      }

      const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

      // Verify refresh token
      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, refreshSecret as Secret);
      } catch (jwtError) {
        return errorResponse({
          status: 401,
          message: "Invalid or expired refresh token",
          req,
        });
      }

      // Check token type
      if (decoded.type !== "refresh") {
        return errorResponse({
          status: 401,
          message: "Invalid token type",
          req,
        });
      }

      // Find user
      const user = await User.findById(decoded.id).select("+refreshTokens");
      if (!user) {
        return errorResponse({
          status: 401,
          message: "User not found",
          req,
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return errorResponse({
          status: 403,
          message: "Account has been deactivated",
          req,
        });
      }

      // Verify refresh token exists in user's token array
      if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
        return errorResponse({
          status: 401,
          message: "Refresh token not found or has been revoked",
          req,
        });
      }

      // Generate new access token
      const userId = user._id as Types.ObjectId;
      const newAccessToken = jwt.sign(
        { 
          id: userId.toString(), 
          role: user.role,
          type: "access"
        },
        process.env.JWT_SECRET as Secret,
        { expiresIn: "15m" } // Short-lived access token
      );

      // Optionally generate new refresh token (token rotation)
      let newRefreshToken = refreshToken; // Keep existing by default
      
      // Implement refresh token rotation for enhanced security
      const shouldRotateToken = true; // Can be made configurable
      
      if (shouldRotateToken) {
        newRefreshToken = jwt.sign(
          { 
            id: userId.toString(), 
            role: user.role,
            type: "refresh"
          },
          refreshSecret as Secret,
          { expiresIn: "7d" }
        );

        // Update user's refresh tokens
        try {
          // Remove the old refresh token and add the new one
          user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
          user.refreshTokens.push(newRefreshToken);
          
          // Keep only last 5 refresh tokens per user
          if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5);
          }
          
          await user.save();
        } catch (error) {
          console.error("Failed to update refresh tokens:", error);
          // Continue with old refresh token if update fails
          newRefreshToken = refreshToken;
        }
      }

      // Update last login time
      user.lastLogin = new Date();
      await user.save().catch(() => {}); // Don't fail if this update fails

      // Prepare response data
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
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: "15m",
        tokenRotated: shouldRotateToken,
      };

      return successResponse({
        status: 200,
        message: "Token refreshed successfully",
        data: responseData,
        req,
      });

    } catch (error: unknown) {
      console.error("Refresh Token API Error:", error);

      // Handle specific JWT errors
      if (error instanceof Error) {
        if (error.name === 'JsonWebTokenError') {
          return errorResponse({
            status: 401,
            message: "Invalid refresh token format",
            req,
          });
        }
        
        if (error.name === 'TokenExpiredError') {
          return errorResponse({
            status: 401,
            message: "Refresh token has expired",
            req,
          });
        }
      }

      return errorResponse({
        status: 500,
        message: "An error occurred while refreshing token. Please sign in again.",
        req,
      });
    }
  },
  { max: 20, windowMs: 60000 } // 20 requests per minute per IP
);