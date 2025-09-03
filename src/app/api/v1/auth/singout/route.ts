// app/api/v1/auth/signout/route.ts
import connectDB from "@/config/db";
import { getAuthUser } from "@/lib/auth"; // Create this function
import { errorResponse, successResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated",
      });
    }

    // Update last logout timestamp in login history
    await LoginHistory.findOneAndUpdate({
      user: user._id,
      success: true,
      reason: "User initiated logout",
    });

    // Clear session (if using JWT)
    // For cookie-based auth, you'd clear the cookie here

    return successResponse({
      status: 200,
      message: "Logged out successfully",
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}
