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
    const months = parseInt(params.get("months") || "12", 10);

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

    const pastNMonths = new Date();
    pastNMonths.setMonth(now.getMonth() - months + 1);

    // Build match query
    const matchQuery: any = {};
    if (startDate) matchQuery.createdAt = { $gte: startDate };
    else matchQuery.createdAt = { $gte: pastNDays };
    if (endDate) {
      matchQuery.createdAt = matchQuery.createdAt || {};
      matchQuery.createdAt.$lte = endDate;
    }

    // Execute revenue analytics queries in parallel
    const [
      totalRevenueResult,
      monthlyRevenueResult,
      dailyRevenueResult,
      revenueByTypeResult,
      paymentMethodsResult,
      topCustomersResult,
    ] = await Promise.all([
      // Total revenue summary
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
            totalAmount: { $sum: { $ifNull: ["$payment.pAmount", 0] } },
            totalRefunds: { $sum: { $ifNull: ["$payment.pRefunded", 0] } },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: { $ifNull: ["$payment.pReceived", 0] } },
          }
        }
      ]),

      // Monthly revenue trend
      Order.aggregate([
        { $match: { createdAt: { $gte: pastNMonths } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: { $ifNull: ["$payment.pReceived", 0] } },
            refunds: { $sum: { $ifNull: ["$payment.pRefunded", 0] } }
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
            revenue: 1,
            orders: 1,
            avgOrderValue: 1,
            refunds: 1
          }
        }
      ]),

      // Daily revenue trend
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
      ]),

      // Revenue by order type
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$parcel.orderType",
            revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: { $ifNull: ["$payment.pReceived", 0] } }
          }
        },
        { $sort: { revenue: -1 } },
      ]),

      // Revenue by payment methods
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$payment.pType",
            revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: { $ifNull: ["$payment.pReceived", 0] } }
          }
        },
        { $sort: { revenue: -1 } },
      ]),

      // Top customers by revenue
      Order.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              phone: "$parcel.sender.phone",
              name: "$parcel.sender.name"
            },
            totalRevenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: { $ifNull: ["$payment.pReceived", 0] } }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            customerPhone: "$_id.phone",
            customerName: "$_id.name",
            totalRevenue: 1,
            totalOrders: 1,
            avgOrderValue: 1
          }
        }
      ]),
    ]);

    // Calculate growth rates and additional metrics
    let monthlyGrowth = 0;
    if (monthlyRevenueResult.length >= 2) {
      const currentMonth = monthlyRevenueResult[monthlyRevenueResult.length - 1];
      const previousMonth = monthlyRevenueResult[monthlyRevenueResult.length - 2];
      
      if (previousMonth.revenue > 0) {
        monthlyGrowth = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100;
      }
    }

    // Calculate revenue metrics
    const totalRevenueSummary = totalRevenueResult[0] || {
      totalRevenue: 0,
      totalAmount: 0,
      totalRefunds: 0,
      totalOrders: 0,
      avgOrderValue: 0
    };

    const collectionRate = totalRevenueSummary.totalAmount > 0
      ? (totalRevenueSummary.totalRevenue / totalRevenueSummary.totalAmount) * 100
      : 0;

    const refundRate = totalRevenueSummary.totalRevenue > 0
      ? (totalRevenueSummary.totalRefunds / totalRevenueSummary.totalRevenue) * 100
      : 0;

    // Prepare analytics response
    const analytics = {
      summary: {
        totalRevenue: totalRevenueSummary.totalRevenue,
        totalOrders: totalRevenueSummary.totalOrders,
        avgOrderValue: totalRevenueSummary.avgOrderValue,
        totalRefunds: totalRevenueSummary.totalRefunds,
        collectionRate,
        refundRate,
        monthlyGrowth,
        period: {
          start: startDate?.toISOString() || pastNDays.toISOString(),
          end: endDate?.toISOString() || now.toISOString(),
          days,
          months,
        }
      },
      trends: {
        monthly: monthlyRevenueResult,
        daily: dailyRevenueResult,
      },
      breakdown: {
        byOrderType: revenueByTypeResult,
        byPaymentMethod: paymentMethodsResult,
      },
      insights: {
        topCustomers: topCustomersResult,
        growthRate: monthlyGrowth,
        performance: {
          collectionEfficiency: collectionRate,
          refundImpact: refundRate,
          customerLoyalty: topCustomersResult.length > 0
            ? topCustomersResult[0].totalOrders / totalRevenueSummary.totalOrders * 100
            : 0
        }
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
          months,
        },
      },
    };

    return successResponse({
      status: 200,
      message: "Revenue analytics fetched successfully",
      data: analytics,
      req,
    });

  } catch (err: any) {
    console.error("Revenue Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch revenue analytics",
      error: err.message || err,
      req,
    });
  }
});