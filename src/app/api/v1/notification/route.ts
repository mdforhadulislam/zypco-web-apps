// app/api/v1/notification/route.ts
import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { getAuthUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/server/models/Notification.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated"
      });
    }

    // Fetch all notifications for the user
    const notifications = await Notification.find().sort({ sentAt: -1 });

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
}}