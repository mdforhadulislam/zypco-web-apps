import connectDB from "@/config/db";
import { createRateLimitedHandler } from "@/server/common/apiWrapper";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import jwt, { Secret } from "jsonwebtoken";

interface RefreshTokenBody {
  refreshToken: string;
}

export const POST = createRateLimitedHandler(
  async ({ req }) => {
    try {
      await connectDB();

      const body = (await req.json()) as RefreshTokenBody;
      const { refreshToken } = body;

      if (!refreshToken) {
        return errorResponse({
          status: 400,
          message: "Refresh token is required",
          req,
        });
      }

      const refreshSecret =
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
      if (!refreshSecret) {
        throw new Error("JWT_SECRET or REFRESH_TOKEN_SECRET not configured");
      }

      const decodedRaw = jwt.verify(refreshToken, refreshSecret as Secret);
      if (typeof decodedRaw === "string") {
        return errorResponse({
          status: 401,
          message: "Invalid refresh token format",
          req,
        });
      }
      const decoded = decodedRaw as { id: string; type: string; role?: string };

      // Ensure token type
      if (decoded.type !== "refresh") {
        return errorResponse({
          status: 401,
          message: "Invalid token type",
          req,
        });
      }

      // Fetch user with refresh tokens
      const user = await User.findById(decoded.id).select("+refreshTokens");
      if (!user) {
        return errorResponse({
          status: 401,
          message: "User not found",
          req,
        });
      }

      if (!user.isActive) {
        return errorResponse({
          status: 403,
          message: "Account deactivated",
          req,
        });
      }

      // Check if refresh token is still valid (exists in user's array)
      if (!user.refreshTokens.includes(refreshToken)) {
        return errorResponse({
          status: 401,
          message: "Refresh token revoked",
          req,
        });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { id: user._id.toString(), role: user.role, type: "access" },
        process.env.JWT_SECRET as Secret,
        { expiresIn: "15m" }
      );

      // Rotate refresh token for enhanced security
      const newRefreshToken = jwt.sign(
        { id: user._id.toString(), role: user.role, type: "refresh" },
        refreshSecret as Secret,
        { expiresIn: "7d" }
      );

      // Update user's refresh tokens array
      user.refreshTokens = user.refreshTokens.filter((t:string) => t !== refreshToken);
      user.refreshTokens.push(newRefreshToken);
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5); // keep last 5 tokens
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Respond with new tokens and user info
      return successResponse({
        status: 200,
        message: "Token refreshed successfully",
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
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: "15m",
        },
        req,
      });
    } catch (error: unknown) {
      console.error("Refresh Token API Error:", error);

      if (error instanceof Error) {
        if (error.name === "JsonWebTokenError") {
          return errorResponse({
            status: 401,
            message: "Invalid refresh token format",
            req,
          });
        }
        if (error.name === "TokenExpiredError") {
          return errorResponse({
            status: 401,
            message: "Refresh token expired",
            req,
          });
        }
      }

      return errorResponse({
        status: 500,
        message: "Server error. Please sign in again.",
        req,
      });
    }
  },
  {
    max: 20, // max 20 requests per minute per IP
    windowMs: 60_000,
  }
);
