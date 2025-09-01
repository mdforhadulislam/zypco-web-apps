import connectDB from "@/config/db";
import { verifyToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

const isAdminOrModerator = (user: unknown): boolean => {
  return (
    (typeof user === "object" &&
      user !== null &&
      "role" in user &&
      (user as { role?: string }).role === "admin") ||
    (user as { role?: string }).role === "moderator"
  );
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    // Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Authentication failed.",
        req: request,
      });
    }

    // Check if user is admin or moderator
    const currentUser = await User.findById(authResult.userId);
    if (!isAdminOrModerator(currentUser)) {
      return errorResponse({
        status: 403,
        message: "Access denied. Admin or Moderator privileges required.",
        req: request,
      });
    }

    // Get all users (only for admin/moderator)
    const users = await User.find({})
      .select("-password") // Exclude password from results
      .sort({ createdAt: -1 }); // Most recent first

    return successResponse({
      status: 200,
      message: "Users retrieved successfully",
      data: { users },
      req: request,
    });
  } catch (error: unknown) {
    console.error("Users List Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request,
    });
  }
}
