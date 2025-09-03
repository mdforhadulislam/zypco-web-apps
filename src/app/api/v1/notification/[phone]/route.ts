// app/api/v1/notification/[phone]/route.ts
import connectDB from "@/config/db";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { Notification } from "@/server/models/Notification.model";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
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

    // Find user by phone
    const targetUser = await User.findOne({ phone: params.phone });
    if (!targetUser) {
      return errorResponse({
        status: 404,
        message: "User not found",
        error: "NotFound",
      });
    }

    // Check permission (own account or admin)
    if (user.role !== "admin" || user.phone !== targetUser.phone) {
      return errorResponse({
        status: 403,
        message: "Forbidden",
        error: "PermissionDenied",
      });
    }

    // Fetch all notifications for the user
    const notifications = await Notification.find({
      user: targetUser._id,
    }).sort({ sentAt: -1 });

    return successResponse({
      status: 200,
      message: "Notifications fetched successfully",
      data: { notifications },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}
