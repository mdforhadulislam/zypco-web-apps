import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { User } from "@/server/models/User.model";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const getIp = () =>
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const getAgent = () => req.headers.get("user-agent") || "unknown";

  try {
    await connectDB();

    // Get token from Authorization header
    const authHeader =
      req.headers.get("authorization") || req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse({
        status: 400,
        message: "Authorization header missing or malformed",
        req,
      });
    }

    const token = authHeader.split(" ")[1].trim();
    if (!token) {
      return errorResponse({
        status: 400,
        message: "Token not provided",
        req,
      });
    }

    // Ensure JWT secret available
    if (!process.env.JWT_SECRET) {
      return errorResponse({
        status: 500,
        message: "JWT secret not configured on server",
        req,
      });
    }
    const secret: Secret = process.env.JWT_SECRET as Secret;

    // Verify token
    let verified: string | JwtPayload;
    try {
      verified = jwt.verify(token, secret) as string | JwtPayload;
    } catch (error) {
      await LoginHistory.create({
        phone: "unknown",
        ipAddress: getIp(),
        userAgent: getAgent(),
        success: false,
        failureReason: "Invalid or expired token on signout",
        timestamp: new Date(),
      })

      return errorResponse({
        status: 401,
        message: "Invalid or expired token",
        req,
      });
    }

    // Extract user id from payload
    if (typeof verified === "string") {
      return errorResponse({
        status: 400,
        message: "Invalid token payload",
        req,
      });
    }
    const userId = verified?.id ? String(verified.id) : undefined;
    if (!userId) {
      return errorResponse({
        status: 400,
        message: "Token does not contain user id",
        req,
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      await LoginHistory.create({
        user: null,
        phone: "unknown",
        ipAddress: getIp(),
        userAgent: getAgent(),
        success: false,
        failureReason: "User not found during signout",
        timestamp: new Date(),
      }).catch(() => undefined);

      return errorResponse({
        status: 404,
        message: "User not found",
        req,
      });
    }

    // Remove token from user's active tokens (safe & tolerant)
    try {
      const tokensField = (user as unknown as { tokens?: unknown }).tokens;
      if (tokensField && Array.isArray(tokensField)) {
        // Try pulling object-form tokens: { token: <token> }
        await User.updateOne(
          { _id: user._id },
          { $pull: { tokens: { token } } }
        ).catch(() => undefined);

        // Also try pulling primitive token strings (tokens: string[])
        await User.updateOne(
          { _id: user._id },
          { $pull: { tokens: token } }
        ).catch(() => undefined);
      }
    } catch (err) {
      console.error("Token removal during signout failed (ignored):", err);
    }

    // Log logout into LoginHistory
    await LoginHistory.create({
      user: user._id,
      phone: user.phone || "unknown",
      ipAddress: getIp(),
      userAgent: getAgent(),
      success: true,
      action: "logout",
      timestamp: new Date(),
    }).catch(() => undefined);

    // Return successful response
    return successResponse({
      status: 200,
      message: "Signed out successfully",
      data: { userId: user._id, phone: user.phone || null },
      req,
    });
  } catch (error: unknown) {
    console.error("Signout API Error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong";

    await LoginHistory.create({
      phone: getIp(),
      ipAddress: getIp(),
      userAgent: req.headers.get("user-agent") || "unknown",
      success: false,
      failureReason: message,
      timestamp: new Date(),
    });

    return errorResponse({
      status: 500,
      message,
      error,
      req,
    });
  }
}
