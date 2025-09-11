/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";
import { User } from "@/server/models/User.model";
import { Notification } from "@/server/models/Notification.model";
import { successResponse, errorResponse } from "@/server/common/response";

// GET - fetch notifications for a user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const notifications = await Notification.find({ user: user._id }).sort({ createdAt: -1 });

    return successResponse({
      status: 200,
      message: "Notifications fetched",
      data: notifications,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch notifications";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// PUT - mark a notification as read/unread or update
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const body: { notificationId: string; read?: boolean; title?: string; message?: string } = await req.json();
    if (!body.notificationId) return errorResponse({ status: 400, message: "Notification ID required", req });

    const updateData: any = {};
    if (body.read !== undefined) updateData.read = body.read;
    if (body.title) updateData.title = body.title;
    if (body.message) updateData.message = body.message;

    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: body.notificationId, user: user._id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedNotification) return errorResponse({ status: 404, message: "Notification not found", req });

    return successResponse({ status: 200, message: "Notification updated", data: updatedNotification, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update notification";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// DELETE - remove a notification
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const body: { notificationId: string } = await req.json();
    if (!body.notificationId) return errorResponse({ status: 400, message: "Notification ID required", req });

    const deletedNotification = await Notification.findOneAndDelete({ _id: body.notificationId, user: user._id });
    if (!deletedNotification) return errorResponse({ status: 404, message: "Notification not found", req });

    return successResponse({ status: 200, message: "Notification deleted", data: deletedNotification, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete notification";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}