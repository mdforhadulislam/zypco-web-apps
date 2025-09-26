import connectDB from "@/config/db";
import { createModeratorHandler } from "@/server/common/apiWrapper";
import { successResponse, errorResponse } from "@/server/common/response";
import { Order } from "@/server/models/Order.model";

export const GET = createModeratorHandler(async ({ req, user }) => {
  try {
    await connectDB();

    // Verify admin/moderator access
    if (!user || (user.role !== "admin" && user.role !== "moderator")) {
      return errorResponse({
        status: 403,
        message: "Admin or moderator access required",
        req,
      });
    }

    const url = new URL(req.url);
    const params = url.searchParams;

    const startDateParam = params.get("startDate");
    const endDateParam = params.get("endDate");
    const days = parseInt(params.get("days") || "30", 10);
    const limit = parseInt(params.get("limit") || "10", 10);

    // Build date bounds
    const now = new Date();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    
    if (startDateParam) startDate = new Date(startDateParam);
    if (endDateParam) {
      endDate = new Date(endDateParam);
      endDate.setHours(23, 59, 59, 999);
    }

    const pastNDays = new Date();
    pastNDays.setDate(now.getDate() - days + 1);

    // Build match query
    const matchQuery: any = {};
    if (startDate) matchQuery.createdAt = { $gte: startDate };
    else matchQuery.createdAt = { $gte: pastNDays };
    if (endDate) {
      matchQuery.createdAt = matchQuery.createdAt || {};
      matchQuery.createdAt.$lte = endDate;
    }

    // Execute analytics queries in parallel
    const [
      totalOrdersResult,
      ordersByTypeResult,
      ordersByPriorityResult,
      ordersByStatusResult,
      recentOrdersResult,
      topRoutesResult,
      dailyOrdersResult,
      monthlyOrdersResult,
    ] = await Promise.all([
      // Total orders count
      Order.countDocuments(matchQuery),

      // Orders by type
      Order.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$parcel.orderType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Orders by priority
      Order.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$parcel.priority", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Orders by status (based on payment status as proxy)
      Order.aggregate([
        { $match: matchQuery },
        {
          $addFields: {
            status: {
              $cond: {
                if: { $gte: ["$payment.pReceived", "$payment.pAmount"] },
                then: "paid",
                else: "pending"
              }
            }
          }
        },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Recent orders
      Order.find(matchQuery)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("trackId parcel.from parcel.to createdAt payment.pAmount")
        .lean(),

      // Top routes (from -> to combinations)
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              from: "$parcel.from",
              to: "$parcel.to"
            },
            count: { $sum: 1 },
            totalValue: { $sum: { $ifNull: ["$payment.pAmount", 0] } }
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            _id: 0,
            route: { $concat: ["$_id.from", " → ", "$_id.to"] },
            from: "$_id.from",
            to: "$_id.to",
            count: 1,
            totalValue: 1
          }
        }
      ]),

      // Daily orders trend
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
            totalValue: { $sum: { $ifNull: ["$payment.pAmount", 0] } }
          }
        },
        { $sort: { _id: 1 } },
      ]),

      // Monthly orders trend
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 },
            totalValue: { $sum: { $ifNull: ["$payment.pAmount", 0] } },
            avgValue: { $avg: { $ifNull: ["$payment.pAmount", 0] } }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        {
          $project: {
            _id: 0,
            year: "$_id.year",
            month: "$_id.month",
            monthName: {
              $arrayElemAt: [
                ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                 "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                "$_id.month"
              ]
            },
            count: 1,
            totalValue: 1,
            avgValue: 1
          }
        }
      ]),
    ]);

    // Calculate additional metrics
    const avgOrderValue = monthlyOrdersResult.length > 0
      ? monthlyOrdersResult.reduce((sum, month) => sum + (month.avgValue || 0), 0) / monthlyOrdersResult.length
      : 0;

    const totalRevenue = monthlyOrdersResult.reduce((sum, month) => sum + (month.totalValue || 0), 0);

    // Prepare analytics response
    const analytics = {
      summary: {
        totalOrders: totalOrdersResult,
        totalRevenue,
        avgOrderValue,
        period: {
          start: startDate?.toISOString() || pastNDays.toISOString(),
          end: endDate?.toISOString() || now.toISOString(),
          days,
        }
      },
      breakdown: {
        byType: ordersByTypeResult,
        byPriority: ordersByPriorityResult,
        byStatus: ordersByStatusResult,
      },
      trends: {
        daily: dailyOrdersResult,
        monthly: monthlyOrdersResult,
      },
      insights: {
        topRoutes: topRoutesResult,
        recentOrders: recentOrdersResult,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: {
          userId: user.id,
          role: user.role,
          name: user.name,
        },
        filters: {
          startDate: startDateParam,
          endDate: endDateParam,
          days,
          limit,
        },
      },
    };

    return successResponse({
      status: 200,
      message: "Order analytics fetched successfully",
      data: analytics,
      req,
    });

  } catch (err: any) {
    console.error("Order Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch order analytics",
      error: err.message || err,
      req,
    });
  }
});