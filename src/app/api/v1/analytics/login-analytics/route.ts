import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Total logins
    const totalLogins = await LoginHistory.countDocuments({ success: true });
    const failedLogins = await LoginHistory.countDocuments({ success: false });

    // Active / Inactive users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = totalUsers - activeUsers;

    // Last 30 days login trends
    const today = new Date();
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);

    const loginTrends = await LoginHistory.aggregate([
      { $match: { timestamp: { $gte: past30Days }, success: true } },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Top 10 IP addresses by login attempts
    const topIPs = await LoginHistory.aggregate([
      { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Top 10 failed login phones
    const topFailedPhones = await LoginHistory.aggregate([
      { $match: { success: false } },
      { $group: { _id: "$phone", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return successResponse({
      message: "Login analytics fetched successfully",
      data: {
        totalLogins,
        failedLogins,
        activeUsers,
        inactiveUsers,
        loginTrends, // can be used for charts
        topIPs,
        topFailedPhones,
      },
    });
  } catch (error) {
    return errorResponse({
      message: "Failed to fetch login analytics",
      error,
    });
  }
}
