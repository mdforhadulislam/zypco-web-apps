import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { NextRequest } from "next/server";

// Models
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { Order } from "@/server/models/Order.model";
import { User } from "@/server/models/User.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const params = url.searchParams;

    const startDateParam = params.get("startDate");
    const endDateParam = params.get("endDate");
    const days = parseInt(params.get("days") || "30", 10);
    const months = parseInt(params.get("months") || "12", 10);
    const limit = parseInt(params.get("limit") || "10", 10);

    const now = new Date();
    const pastNDays = new Date();
    pastNDays.setDate(now.getDate() - days + 1);

    const pastNMonths = new Date(
      now.getFullYear(),
      now.getMonth() - months + 1,
      1
    );

    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (startDateParam) startDate = new Date(startDateParam);
    if (endDateParam) {
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    }

    //
    // ---------- Users Section ----------
    //
    const totalUsersP = User.countDocuments();
    const activeUsersP = User.countDocuments({ isActive: true });
    const verifiedUsersP = User.countDocuments({ isVerified: true });
    const roleBreakdownP = User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const notificationPrefsP = User.aggregate([
      {
        $group: {
          _id: null,
          emailOn: {
            $sum: { $cond: ["$preferences.notifications.email", 1, 0] },
          },
          smsOn: { $sum: { $cond: ["$preferences.notifications.sms", 1, 0] } },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          emailOn: 1,
          smsOn: 1,
          total: 1,
          emailOff: { $subtract: ["$total", "$emailOn"] },
          smsOff: { $subtract: ["$total", "$smsOn"] },
        },
      },
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signupMatch: any = {};
    signupMatch.createdAt = { $gte: startDate || pastNDays };
    if (endDate) signupMatch.createdAt.$lte = endDate;

    const signupTrendP = User.aggregate([
      { $match: signupMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    //
    // ---------- Security / Login ----------
    //

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dauMatch: any = {
      success: true,
      timestamp: { $gte: startDate || pastNDays },
    };
    if (endDate) dauMatch.timestamp.$lte = endDate;

    const dauP = LoginHistory.aggregate([
      { $match: dauMatch },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          },
          users: { $addToSet: "$user" },
        },
      },
      { $project: { day: "$_id.day", activeUsers: { $size: "$users" } } },
      { $sort: { day: 1 } },
    ]);

    const topFailedPhonesP = LoginHistory.aggregate([
      { $match: { success: false } },
      { $group: { _id: "$phone", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Math.max(limit, 10) },
    ]);

    const topFailedIPsP = LoginHistory.aggregate([
      { $match: { success: false } },
      { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Math.max(limit, 10) },
    ]);

    const topIPsP = LoginHistory.aggregate([
      { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Math.max(limit, 10) },
    ]);

    //
    // ---------- Orders / Revenue ----------
    //

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderMatch: any = {};
    if (startDate) orderMatch.orderDate = { $gte: startDate };
    if (endDate)
      orderMatch.orderDate = { ...(orderMatch.orderDate || {}), $lte: endDate };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ordersPipeline: any[] = [];
    if (Object.keys(orderMatch).length)
      ordersPipeline.push({ $match: orderMatch });

    ordersPipeline.push(
      {
        $lookup: {
          from: "tracks",
          localField: "trackId",
          foreignField: "trackId",
          as: "track",
        },
      },
      { $addFields: { track: { $arrayElemAt: ["$track", 0] } } },
      {
        $addFields: {
          weightNum: {
            $convert: {
              input: { $ifNull: ["$parcel.weight", 0] },
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
        },
      },
      {
        $addFields: {
          _pickedAt: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: { $ifNull: ["$track.history", []] },
                      cond: { $eq: ["$$this.status", "picked-up"] },
                    },
                  },
                  as: "p",
                  in: "$$p.timestamp",
                },
              },
              0,
            ],
          },
          _deliveredAt: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: { $ifNull: ["$track.history", []] },
                      cond: { $eq: ["$$this.status", "delivered"] },
                    },
                  },
                  as: "d",
                  in: "$$d.timestamp",
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          deliveryHours: {
            $cond: [
              { $and: ["$_pickedAt", "$_deliveredAt"] },
              {
                $divide: [
                  { $subtract: ["$_deliveredAt", "$_pickedAt"] },
                  1000 * 60 * 60,
                ],
              },
              null,
            ],
          },
        },
      },
      {
        $facet: {
          totalOrders: [{ $count: "count" }],
          ordersByType: [
            { $group: { _id: "$parcel.orderType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          revenueSummary: [
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
                totalRefunds: { $sum: { $ifNull: ["$payment.pRefunded", 0] } },
                avgOrderValue: { $avg: { $ifNull: ["$payment.pReceived", 0] } },
                totalOrders: { $sum: 1 },
              },
            },
          ],
          monthlyRevenue: [
            {
              $group: {
                _id: {
                  year: { $year: "$orderDate" },
                  month: { $month: "$orderDate" },
                },
                revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
                orders: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
              $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                revenue: 1,
                orders: 1,
              },
            },
          ],
          paymentMethods: [
            {
              $group: {
                _id: "$payment.pType",
                count: { $sum: 1 },
                total: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
              },
            },
          ],
        },
      }
    );

    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      roleBreakdown,
      notificationPrefs,
      signupTrend,
      dau,
      topFailedPhones,
      topFailedIPs,
      topIPs,
      ordersSummary,
    ] = await Promise.all([
      totalUsersP,
      activeUsersP,
      verifiedUsersP,
      roleBreakdownP,
      notificationPrefsP,
      signupTrendP,
      dauP,
      topFailedPhonesP,
      topFailedIPsP,
      topIPsP,
      Order.aggregate(ordersPipeline),
    ]);

    return successResponse({
      message: "",
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        roleBreakdown,
        notificationPrefs,
        signupTrend,
        dau,
        topFailedPhones,
        topFailedIPs,
        topIPs,
        ordersSummary: ordersSummary[0] || {},
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse({
      message: "Dashboard analytics fetch failed",
      error,
    });
  }
}
