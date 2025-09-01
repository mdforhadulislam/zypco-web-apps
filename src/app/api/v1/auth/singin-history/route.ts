import { NextRequest, NextResponse } from "next/server"; 
import { errorResponse, successResponse } from "@/server/common/response";
import { verifyToken } from "@/lib/auth";
import { User } from "@/server/models/User.model";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import connectDB from "@/config/db";

export async function GET(request: NextRequest) {
  try {    await connectDB();
    // Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Unauthorized",
        req: request
      });
    }

    // Check if user is moderator or admin
    const user = await User.findById(authResult.userId);
    if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
      return errorResponse({
        status: 403,
        message: "Access denied. Admin or Moderator privileges required.",
        req: request
      });
    }

    // Fetch sign-in history
    const signInHistory = await LoginHistory.find({ user: authResult.userId })
      .sort({ timestamp: -1 }); // Most recent first

    return successResponse({
      status: 200,
      message: "Sign-in history retrieved successfully",
      data: { signInHistory },
      req: request
    });

  } catch (error: unknown) {
    console.error("Sign-in History Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request
    });
  }
}