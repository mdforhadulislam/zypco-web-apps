// app/api/v1/notification/[phone]/[id]/route.ts
import connectDB from "@/config/db";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { Notification } from "@/server/models/Notification.model";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string; id: string } }
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

    // Fetch single notification
    const notification = await Notification.findById(params.id);

    if (!notification) {
      return errorResponse({
        status: 404,
        message: "Notification not found",
        error: "NotFound",
      });
    }

    return successResponse({
      status: 200,
      message: "Notification fetched successfully",
      data: { notification },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { phone: string; id: string } }
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

    const body = await req.json();
    const { title, message, type, read } = body;

    // Find and update notification
    const updatedNotification = await Notification.findByIdAndUpdate(
      params.id,
      { title, message, type, read },
      { new: true }
    );

    if (!updatedNotification) {
      return errorResponse({
        status: 404,
        message: "Notification not found",
        error: "NotFound",
      });
    }

    return successResponse({
      status: 200,
      message: "Notification updated successfully",
      data: { notification: updatedNotification },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { phone: string; id: string } }
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

    // Soft delete (deactivate) notification
    const deletedNotification = await Notification.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!deletedNotification) {
      return errorResponse({
        status: 404,
        message: "Notification not found",
        error: "NotFound",
      });
    }

    return successResponse({
      status: 200,
      message: "Notification deactivated successfully",
      data: { notification: deletedNotification },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}
