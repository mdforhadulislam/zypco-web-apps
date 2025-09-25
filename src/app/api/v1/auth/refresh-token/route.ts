import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import { NextRequest } from "next/server";

interface RefreshTokenPayload extends JwtPayload {
  id: string;
  role: string;
  type?: string;
}

// Use different secrets for access and refresh tokens in production
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET as Secret;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET as Secret;
const ACCESS_TOKEN_EXPIRES = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRES = "7d"; // 7 days

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { refreshToken } = await req.json();

    if (!refreshToken) {
      return errorResponse({
        status: 400,
        message: "Refresh token is required",
        req,
      });
    }

    // Verify refresh token
    let decoded: RefreshTokenPayload;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    } catch (error) {
      return errorResponse({
        status: 401,
        message: "Invalid or expired refresh token",
        req,
      });
    }

    // Validate token payload
    if (!decoded.id || !decoded.role) {
      return errorResponse({
        status: 401,
        message: "Invalid token payload",
        req,
      });
    }

    // Find user and verify they still exist and are active
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return errorResponse({
        status: 404,
        message: "User not found",
        req,
      });
    }

    // Check if user is still active and verified
    if (!user.isActive) {
      return errorResponse({
        status: 403,
        message: "Account is deactivated",
        req,
      });
    }

    if (!user.isVerified) {
      return errorResponse({
        status: 403,
        message: "Account is not verified",
        req,
      });
    }

    // Check if refresh token exists in user's active tokens (if you store them)
    // This is optional but recommended for better security
    const hasValidRefreshToken = user.refreshTokens?.some((token: any) => {
      try {
        const tokenPayload = jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
        return tokenPayload.id === user._id.toString();
      } catch {
        return false;
      }
    });

    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        id: user._id.toString(), 
        role: user.role,
        type: "access"
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    // Optionally rotate refresh token for better security
    const newRefreshToken = jwt.sign(
      { 
        id: user._id.toString(), 
        role: user.role,
        type: "refresh"
      },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES }
    );

    // Update user's refresh tokens if you store them
    try {
      // Remove old refresh token and add new one
      await User.findByIdAndUpdate(user._id, {
        $pull: { refreshTokens: refreshToken },
        $push: { refreshTokens: newRefreshToken }
      });
    } catch (error) {
      // Don't fail the request if token storage update fails
      console.error("Failed to update refresh tokens:", error);
    }

    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar || null,
      isVerified: user.isVerified,
      isActive: user.isActive,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRES,
    };

    return successResponse({
      status: 200,
      message: "Tokens refreshed successfully",
      data: responseData,
      req,
    });

  } catch (error: unknown) {
    console.error("Refresh token API error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Server error";
    
    return errorResponse({
      status: 500,
      message: "Internal server error",
      req,
    });
  }
}