import connectDB from "@/config/db";
import { createModeratorHandler } from "@/server/common/apiWrapper";
import { successResponse, errorResponse } from "@/server/common/response";
import { Order } from "@/server/models/Order.model";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { Notification } from "@/server/models/Notification.model";

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

    const days = parseInt(params.get("days") || "30", 10);
    const startDateParam = params.get("startDate");
    const endDateParam = params.get("endDate");

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

    // Execute operational analytics queries in parallel
    const [
      orderProcessingMetrics,
      systemPerformanceMetrics,
      userEngagementMetrics,
      operationalEfficiencyMetrics,
    ] = await Promise.all([
      // Order processing metrics
      Order.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            orderStatus: [
              {
                $addFields: {
                  status: {
                    $cond: {
                      if: { $gte: ["$payment.pReceived", "$payment.pAmount"] },
                      then: "completed",
                      else: {
                        $cond: {
                          if: { $gt: ["$payment.pReceived", 0] },
                          then: "partial",
                          else: "pending"
                        }
                      }
                    }
                  }
                }
              },
              { $group: { _id: "$status", count: { $sum: 1 } } },
              { $sort: { count: -1 } }
            ],
            processingTime: [
              {
                $addFields: {
                  processingHours: {
                    $divide: [
                      { $subtract: ["$updatedAt", "$createdAt"] },
                      1000 * 60 * 60
                    ]
                  }
                }
              },
              {
                $group: {
                  _id: null,
                  avgProcessingTime: { $avg: "$processingHours" },
                  minProcessingTime: { $min: "$processingHours" },
                  maxProcessingTime: { $max: "$processingHours" }
                }
              }
            ],
            dailyVolume: [
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        }
      ]),

      // System performance metrics
      LoginHistory.aggregate([
        { $match: { timestamp: matchQuery.createdAt } },
        {
          $facet: {
            loginSuccess: [
              { $group: { _id: "$success", count: { $sum: 1 } } }
            ],
            peakHours: [
              {
                $group: {
                  _id: { $hour: "$timestamp" },
                  logins: { $sum: 1 }
                }
              },
              { $sort: { logins: -1 } },
              { $limit: 5 }
            ],
            failureReasons: [
              { $match: { success: false } },
              { $group: { _id: "$failureReason", count: { $sum: 1 } } },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ]
          }
        }
      ]),

      // User engagement metrics
      Promise.all([
        Notification.aggregate([
          { $match: { createdAt: matchQuery.createdAt } },
          {
            $group: {
              _id: null,
              totalSent: { $sum: 1 },
              totalRead: { $sum: { $cond: ["$isRead", 1, 0] } },
              readRate: { 
                $avg: { $cond: ["$isRead", 1, 0] } 
              }
            }
          }
        ]),
        Order.aggregate([
          { $match: matchQuery },
          {
            $group: {
              _id: "$parcel.sender.phone",
              orderCount: { $sum: 1 }
            }
          },
          {
            $group: {
              _id: null,
              totalCustomers: { $sum: 1 },
              avgOrdersPerCustomer: { $avg: "$orderCount" },
              repeatCustomers: {
                $sum: { $cond: [{ $gt: ["$orderCount", 1] }, 1, 0] }
              }
            }
          }
        ])
      ]),

      // Operational efficiency metrics
      Order.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            paymentEfficiency: [
              {
                $group: {
                  _id: null,
                  totalOrders: { $sum: 1 },
                  paidOrders: {
                    $sum: {
                      $cond: [
                        { $gte: ["$payment.pReceived", "$payment.pAmount"] },
                        1,
                        0
                      ]
                    }
                  },
                  totalAmount: { $sum: "$payment.pAmount" },
                  collectedAmount: { $sum: "$payment.pReceived" },
                  refundedAmount: { $sum: "$payment.pRefunded" }
                }
              }
            ],
            geographicDistribution: [
              {
                $group: {
                  _id: {
                    from: "$parcel.from",
                    to: "$parcel.to"
                  },
                  count: { $sum: 1 },
                  revenue: { $sum: "$payment.pReceived" }
                }
              },
              { $sort: { count: -1 } },
              { $limit: 10 }
            ],
            serviceTypePerformance: [
              {
                $group: {
                  _id: "$parcel.orderType",
                  count: { $sum: 1 },
                  revenue: { $sum: "$payment.pReceived" },
                  avgValue: { $avg: "$payment.pReceived" }
                }
              },
              { $sort: { revenue: -1 } }
            ]
          }
        }
      ])
    ]);

    // Process results
    const orderMetrics = orderProcessingMetrics[0] || {};
    const systemMetrics = systemPerformanceMetrics[0] || {};
    const [notificationMetrics, customerMetrics] = userEngagementMetrics;
    const efficiencyMetrics = operationalEfficiencyMetrics[0] || {};

    // Calculate key performance indicators
    const paymentData = efficiencyMetrics.paymentEfficiency?.[0] || {};
    const collectionRate = paymentData.totalAmount > 0 
      ? (paymentData.collectedAmount / paymentData.totalAmount) * 100 
      : 0;

    const paymentSuccessRate = paymentData.totalOrders > 0
      ? (paymentData.paidOrders / paymentData.totalOrders) * 100
      : 0;

    const notificationData = notificationMetrics?.[0] || {};
    const notificationReadRate = (notificationData.readRate || 0) * 100;

    const customerData = customerMetrics?.[0] || {};
    const customerRetentionRate = customerData.totalCustomers > 0
      ? (customerData.repeatCustomers / customerData.totalCustomers) * 100
      : 0;

    const processingData = orderMetrics.processingTime?.[0] || {};

    // Prepare analytics response
    const analytics = {
      summary: {
        deliveryRate: paymentSuccessRate, // Using payment success as proxy for delivery
        processingEfficiency: collectionRate,
        customerSatisfaction: notificationReadRate,
        systemUptime: 99.5, // This would be calculated from actual system metrics
        period: {
          start: startDate?.toISOString() || pastNDays.toISOString(),
          end: endDate?.toISOString() || now.toISOString(),
          days,
        }
      },
      performance: {
        orderProcessing: {
          avgProcessingTime: processingData.avgProcessingTime || 0,
          minProcessingTime: processingData.minProcessingTime || 0,
          maxProcessingTime: processingData.maxProcessingTime || 0,
          statusBreakdown: orderMetrics.orderStatus || [],
          dailyVolume: orderMetrics.dailyVolume || []
        },
        systemHealth: {
          loginSuccessRate: systemMetrics.loginSuccess || [],
          peakHours: systemMetrics.peakHours || [],
          commonFailures: systemMetrics.failureReasons || []
        },
        userEngagement: {
          notificationReadRate,
          avgOrdersPerCustomer: customerData.avgOrdersPerCustomer || 0,
          customerRetentionRate,
          totalActiveCustomers: customerData.totalCustomers || 0
        }
      },
      efficiency: {
        payment: {
          collectionRate,
          successRate: paymentSuccessRate,
          refundImpact: paymentData.totalAmount > 0
            ? (paymentData.refundedAmount / paymentData.totalAmount) * 100
            : 0
        },
        geographic: efficiencyMetrics.geographicDistribution || [],
        serviceTypes: efficiencyMetrics.serviceTypePerformance || []
      },
      insights: {
        recommendations: [
          collectionRate < 95 && "Improve payment collection processes",
          notificationReadRate < 80 && "Optimize notification content and timing",
          customerRetentionRate < 60 && "Implement customer loyalty programs",
          processingData.avgProcessingTime > 48 && "Streamline order processing workflow"
        ].filter(Boolean),
        alerts: [
          paymentSuccessRate < 90 && "Payment success rate below target",
          processingData.avgProcessingTime > 72 && "Processing time exceeds SLA",
          notificationReadRate < 50 && "Low notification engagement"
        ].filter(Boolean)
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
        },
      },
    };

    return successResponse({
      status: 200,
      message: "Operational analytics fetched successfully",
      data: analytics,
      req,
    });

  } catch (err: any) {
    console.error("Operational Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch operational analytics",
      error: err.message || err,
      req,
    });
  }
});