import connectDB from "@/config/db";
import { verifyToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {    await connectDB();
    // Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Unauthorized",
        req: request,
      });
    }

    // Get user ID from identifier
    let targetUserId;
    
    // Check if identifier is email format
    if (params.identifier.includes("@")) {
      targetUserId = await User.findOne({ email: params.identifier }, '_id');
    } 
    // Check if identifier is numeric (phone number)
    else if (/^\d+$/.test(params.identifier)) {
      targetUserId = await User.findOne({ phone: params.identifier }, '_id');
    } 
    // Otherwise treat as username
    else {
      targetUserId = await User.findOne({ name: params.identifier }, '_id');
    }

    if (!targetUserId) {
      return errorResponse({
        status: 404,
        message: "User not found",
        req: request,
      });
    }

    // Fetch sign-in history for the target user
    const signInHistory = await LoginHistory.find({ user: targetUserId })
      .sort({ timestamp: -1 }) // Most recent first
      .lean(); // Use lean() for better performance

    return successResponse({
      status: 200,
      message: "Sign-in history retrieved successfully",
      data: { signInHistory },
      req: request,
    });

  } catch (error: unknown) {
    console.error("Sign-in History Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request,
    });
  }
}