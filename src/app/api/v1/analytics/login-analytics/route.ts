import connectDB from "@/config/db";
import { createModeratorHandler } from "@/server/common/apiWrapper";
import { successResponse, errorResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";

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
    const hours = parseInt(params.get("hours") || "24", 10);
    const limit = parseInt(params.get("limit") || "20", 10);

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

    const pastNHours = new Date();
    pastNHours.setHours(now.getHours() - hours + 1);

    // Build match query
    const matchQuery: any = {};
    if (startDate) matchQuery.timestamp = { $gte: startDate };
    else matchQuery.timestamp = { $gte: pastNDays };
    if (endDate) {
      matchQuery.timestamp = matchQuery.timestamp || {};
      matchQuery.timestamp.$lte = endDate;
    }

    // Execute login analytics queries in parallel
    const [
      loginSummary,
      dailyLogins,
      hourlyLogins,
      loginsByAction,
      topFailureReasons,
      securityMetrics,
      userBehavior,
      geographicAnalysis,
    ] = await Promise.all([
      // Overall login summary
      LoginHistory.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: 1 },
            successfulLogins: { $sum: { $cond: ["$success", 1, 0] } },
            failedLogins: { $sum: { $cond: ["$success", 0, 1] } },
            uniqueUsers: { $addToSet: "$user" },
            uniqueIPs: { $addToSet: "$ipAddress" },
            uniquePhones: { $addToSet: "$phone" }
          }
        },
        {
          $project: {
            _id: 0,
            totalAttempts: 1,
            successfulLogins: 1,
            failedLogins: 1,
            successRate: {
              $multiply: [
                { $divide: ["$successfulLogins", "$totalAttempts"] },
                100
              ]
            },
            uniqueUsers: { $size: "$uniqueUsers" },
            uniqueIPs: { $size: "$uniqueIPs" },
            uniquePhones: { $size: "$uniquePhones" }
          }
        }
      ]),

      // Daily login trend
      LoginHistory.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            totalAttempts: { $sum: 1 },
            successful: { $sum: { $cond: ["$success", 1, 0] } },
            failed: { $sum: { $cond: ["$success", 0, 1] } },
            uniqueUsers: { $addToSet: "$user" }
          }
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
            totalAttempts: 1,
            successful: 1,
            failed: 1,
            uniqueUsers: { $size: "$uniqueUsers" },
            successRate: {
              $multiply: [
                { $divide: ["$successful", "$totalAttempts"] },
                100
              ]
            }
          }
        },
        { $sort: { date: 1 } }
      ]),

      // Hourly login pattern (last 24 hours)
      LoginHistory.aggregate([
        { $match: { timestamp: { $gte: pastNHours } } },
        {
          $group: {
            _id: { $hour: "$timestamp" },
            totalAttempts: { $sum: 1 },
            successful: { $sum: { $cond: ["$success", 1, 0] } },
            failed: { $sum: { $cond: ["$success", 0, 1] } }
          }
        },
        {
          $project: {
            _id: 0,
            hour: "$_id",
            totalAttempts: 1,
            successful: 1,
            failed: 1,
            successRate: {
              $cond: [
                { $eq: ["$totalAttempts", 0] },
                0,
                { $multiply: [{ $divide: ["$successful", "$totalAttempts"] }, 100] }
              ]
            }
          }
        },
        { $sort: { hour: 1 } }
      ]),

      // Login attempts by action type
      LoginHistory.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$action",
            count: { $sum: 1 },
            successful: { $sum: { $cond: ["$success", 1, 0] } },
            failed: { $sum: { $cond: ["$success", 0, 1] } }
          }
        },
        {
          $project: {
            _id: 0,
            action: "$_id",
            count: 1,
            successful: 1,
            failed: 1,
            successRate: {
              $cond: [
                { $eq: ["$count", 0] },
                0,
                { $multiply: [{ $divide: ["$successful", "$count"] }, 100] }
              ]
            }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Top failure reasons
      LoginHistory.aggregate([
        { $match: { ...matchQuery, success: false, failureReason: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: "$failureReason",
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: "$phone" },
            uniqueIPs: { $addToSet: "$ipAddress" }
          }
        },
        {
          $project: {
            _id: 0,
            reason: "$_id",
            count: 1,
            uniqueUsers: { $size: "$uniqueUsers" },
            uniqueIPs: { $size: "$uniqueIPs" }
          }
        },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]),

      // Security metrics
      LoginHistory.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            suspiciousIPs: [
              { $match: { success: false } },
              { $group: { _id: "$ipAddress", failedAttempts: { $sum: 1 } } },
              { $match: { failedAttempts: { $gte: 5 } } },
              { $sort: { failedAttempts: -1 } },
              { $limit: 10 }
            ],
            suspiciousPhones: [
              { $match: { success: false } },
              { $group: { _id: "$phone", failedAttempts: { $sum: 1 } } },
              { $match: { failedAttempts: { $gte: 3 } } },
              { $sort: { failedAttempts: -1 } },
              { $limit: 10 }
            ],
            peakFailureHours: [
              { $match: { success: false } },
              {
                $group: {
                  _id: { $hour: "$timestamp" },
                  failures: { $sum: 1 }
                }
              },
              { $sort: { failures: -1 } },
              { $limit: 5 }
            ]
          }
        }
      ]),

      // User behavior analysis
      LoginHistory.aggregate([
        { $match: { ...matchQuery, success: true, user: { $ne: null } } },
        {
          $group: {
            _id: "$user",
            loginCount: { $sum: 1 },
            firstLogin: { $min: "$timestamp" },
            lastLogin: { $max: "$timestamp" },
            uniqueIPs: { $addToSet: "$ipAddress" }
          }
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            loginCount: 1,
            firstLogin: 1,
            lastLogin: 1,
            uniqueIPs: { $size: "$uniqueIPs" },
            daysSinceFirst: {
              $divide: [
                { $subtract: [new Date(), "$firstLogin"] },
                1000 * 60 * 60 * 24
              ]
            },
            avgLoginsPerDay: {
              $cond: [
                { $eq: [{ $divide: [{ $subtract: [new Date(), "$firstLogin"] }, 1000 * 60 * 60 * 24] }, 0] },
                "$loginCount",
                {
                  $divide: [
                    "$loginCount",
                    { $divide: [{ $subtract: [new Date(), "$firstLogin"] }, 1000 * 60 * 60 * 24] }
                  ]
                }
              ]
            }
          }
        },
        { $sort: { loginCount: -1 } },
        { $limit: limit }
      ]),

      // Geographic analysis
      LoginHistory.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$ipAddress",
            attempts: { $sum: 1 },
            successful: { $sum: { $cond: ["$success", 1, 0] } },
            failed: { $sum: { $cond: ["$success", 0, 1] } },
            uniqueUsers: { $addToSet: "$user" },
            firstSeen: { $min: "$timestamp" },
            lastSeen: { $max: "$timestamp" }
          }
        },
        {
          $project: {
            _id: 0,
            ipAddress: "$_id",
            attempts: 1,
            successful: 1,
            failed: 1,
            uniqueUsers: { $size: "$uniqueUsers" },
            firstSeen: 1,
            lastSeen: 1,
            successRate: {
              $cond: [
                { $eq: ["$attempts", 0] },
                0,
                { $multiply: [{ $divide: ["$successful", "$attempts"] }, 100] }
              ]
            }
          }
        },
        { $sort: { attempts: -1 } },
        { $limit: limit }
      ])
    ]);

    // Process results
    const summary = loginSummary[0] || {
      totalAttempts: 0,
      successfulLogins: 0,
      failedLogins: 0,
      successRate: 0,
      uniqueUsers: 0,
      uniqueIPs: 0,
      uniquePhones: 0
    };

    const security = securityMetrics[0] || {
      suspiciousIPs: [],
      suspiciousPhones: [],
      peakFailureHours: []
    };

    // Calculate additional insights
    const avgAttemptsPerUser = summary.uniqueUsers > 0 
      ? summary.totalAttempts / summary.uniqueUsers : 0;

    const avgAttemptsPerIP = summary.uniqueIPs > 0 
      ? summary.totalAttempts / summary.uniqueIPs : 0;

    const riskScore = Math.min(100, (
      (summary.failedLogins / Math.max(summary.totalAttempts, 1)) * 40 +
      (security.suspiciousIPs.length / Math.max(summary.uniqueIPs, 1)) * 30 +
      (security.suspiciousPhones.length / Math.max(summary.uniquePhones, 1)) * 30
    ) * 100);

    // Prepare analytics response
    const analytics = {
      summary: {
        ...summary,
        avgAttemptsPerUser,
        avgAttemptsPerIP,
        riskScore,
        period: {
          start: startDate?.toISOString() || pastNDays.toISOString(),
          end: endDate?.toISOString() || now.toISOString(),
          days,
          hours,
        }
      },
      trends: {
        daily: dailyLogins,
        hourly: hourlyLogins,
        byAction: loginsByAction,
      },
      security: {
        ...security,
        topFailureReasons,
        riskAssessment: {
          level: riskScore < 30 ? "Low" : riskScore < 60 ? "Medium" : "High",
          score: riskScore,
          factors: [
            riskScore > 60 && "High failure rate detected",
            security.suspiciousIPs.length > 5 && "Multiple suspicious IPs",
            security.suspiciousPhones.length > 3 && "Repeated failed phone attempts"
          ].filter(Boolean)
        }
      },
      userBehavior: {
        topUsers: userBehavior,
        insights: {
          avgLoginsPerUser: userBehavior.reduce((sum, u) => sum + u.loginCount, 0) / Math.max(userBehavior.length, 1),
          avgUniqueIPsPerUser: userBehavior.reduce((sum, u) => sum + u.uniqueIPs, 0) / Math.max(userBehavior.length, 1),
          mostActiveUser: userBehavior[0] || null
        }
      },
      geographic: {
        topIPs: geographicAnalysis,
        insights: {
          totalUniqueIPs: summary.uniqueIPs,
          avgAttemptsPerIP,
          mostActiveIP: geographicAnalysis[0] || null,
          suspiciousIPCount: security.suspiciousIPs.length
        }
      },
      recommendations: [
        summary.successRate < 80 && "Investigate authentication issues - success rate below 80%",
        security.suspiciousIPs.length > 10 && "Implement IP-based rate limiting",
        security.suspiciousPhones.length > 5 && "Review phone number validation",
        riskScore > 60 && "Enhanced security monitoring recommended",
        summary.failedLogins / Math.max(summary.totalAttempts, 1) > 0.3 && "Review password policies"
      ].filter(Boolean),
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
          hours,
          limit,
        },
      },
    };

    return successResponse({
      status: 200,
      message: "Login analytics fetched successfully",
      data: analytics,
      req,
    });

  } catch (err: any) {
    console.error("Login Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch login analytics",
      error: err.message || err,
      req,
    });
  }
});