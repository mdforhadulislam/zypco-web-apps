import connectDB from "@/config/db";
import { verifyToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
        await connectDB();
    // Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Authentication failed",
        req: request,
      });
    }

    // Get user from database
    const user = await User.findById(authResult.userId);
    if (!user) {
      return errorResponse({
        status: 404,
        message: "User not found",
        req: request,
      });
    }

    // Log sign-out event
    await LoginHistory.create({
      user: user._id,
      timestamp: new Date(),
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      success: true,
      reason: "user_signed_out",
    });

    // Invalidate token (client-side responsibility)
    return successResponse({
      status: 200,
      message: "Successfully signed out",
      data: {},
      req: request,
    });
  } catch (error: unknown) {
    console.error("Signout Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request,
    });
  }
}
