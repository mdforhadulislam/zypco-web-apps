// D:\New folder\zypco-web-apps\src\app\api\v1\analytics\notifications-analytics\route.ts 

import connectDB from "@/config/db";
import { Notification } from "@/server/models/Notification.model";
import { NextRequest } from "next/server";
import { errorResponse, successResponse } from "@/server/common/response";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Total notifications
    const totalNotifications = await Notification.countDocuments();
    const unreadNotifications = await Notification.countDocuments({ isRead: false });
    const readNotifications = totalNotifications - unreadNotifications;

    // Notifications by type
    const byType = await Notification.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    // Notifications by category
    const byCategory = await Notification.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    // Notifications per channel
    const byChannel = await Notification.aggregate([
      { $unwind: "$channels" },
      { $group: { _id: "$channels", count: { $sum: 1 } } },
    ]);

    // Notifications trend (last 30 days)
    const today = new Date();
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);

    const trend = await Notification.aggregate([
      { $match: { createdAt: { $gte: past30Days } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    return successResponse({
      message: "Notifications analytics fetched successfully",
      data: {
        totalNotifications,
        readNotifications,
        unreadNotifications,
        byType,       // chart-ready
        byCategory,   // chart-ready
        byChannel,    // chart-ready
        trend,        // chart-ready daily trend
      }, req, status: 200
    });
  } catch (error) {
    return errorResponse({
      message: "Failed to fetch notifications analytics",
      error,
        req, status: 500
    });
  }
}
