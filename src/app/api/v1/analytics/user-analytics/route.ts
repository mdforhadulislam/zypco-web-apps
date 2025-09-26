import connectDB from "@/config/db";
import { createModeratorHandler } from "@/server/common/apiWrapper";
import { successResponse, errorResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { User } from "@/server/models/User.model";

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
    const dormancyDays = parseInt(params.get("dormancyDays") || "90", 10);
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

    // For default trends
    const pastNDays = new Date();
    pastNDays.setDate(now.getDate() - days + 1);

    const pastNMonths = new Date(
      now.getFullYear(),
      now.getMonth() - months + 1,
      1
    );

    // Basic user totals & breakdowns
    const totalUsersPromise = User.countDocuments();
    const activeUsersPromise = User.countDocuments({ isActive: true });
    const verifiedUsersPromise = User.countDocuments({ isVerified: true });
    const roleBreakdownPromise = User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);
    const notificationPrefsPromise = User.aggregate([
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

    // Signup trend (daily) within provided dates or last `days`
    const signupMatch: any = {};
    if (startDate) signupMatch.createdAt = { $gte: startDate };
    else signupMatch.createdAt = { $gte: pastNDays };
    if (endDate) signupMatch.createdAt = signupMatch.createdAt || {};
    if (endDate) signupMatch.createdAt.$lte = endDate;

    const signupTrendPromise = User.aggregate([
      { $match: signupMatch },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // DAU (daily active users) last `days`
    const dauMatch: any = { success: true, timestamp: { $gte: pastNDays } };
    if (startDate) dauMatch.timestamp.$gte = startDate;
    if (endDate) dauMatch.timestamp.$lte = endDate;

    const dauPromise = LoginHistory.aggregate([
      { $match: dauMatch },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          },
          users: { $addToSet: "$user" },
        },
      },
      {
        $project: { day: "$_id.day", activeUsers: { $size: "$users" } },
      },
      { $sort: { day: 1 } },
    ]);

    // MAU (monthly unique active users) last `months`
    const mauMatch: any = { success: true, timestamp: { $gte: pastNMonths } };
    if (startDate) mauMatch.timestamp.$gte = startDate;
    if (endDate) mauMatch.timestamp.$lte = endDate;

    const mauPromise = LoginHistory.aggregate([
      { $match: mauMatch },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
          },
          users: { $addToSet: "$user" },
        },
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          activeUsers: { $size: "$users" },
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);

    // Top users by successful login count
    const topUsersPromise = LoginHistory.aggregate([
      { $match: { success: true, user: { $ne: null } } },
      ...(startDate || endDate
        ? [
            {
              $match: {
                ...(startDate ? { timestamp: { $gte: startDate } } : {}),
                ...(endDate
                  ? { timestamp: { ...(endDate ? { $lte: endDate } : {}) } }
                  : {}),
              },
            },
          ]
        : []),
      { $group: { _id: "$user", logins: { $sum: 1 } } },
      { $sort: { logins: -1 } },
      { $limit: Math.max(limit, 10) },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: { $ifNull: ["$user.name", "Unknown"] },
          email: { $ifNull: ["$user.email", ""] },
          phone: { $ifNull: ["$user.phone", ""] },
          logins: 1,
        },
      },
    ]);

    // Top failed login phones & IPs
    const topFailedPhonesPromise = LoginHistory.aggregate([
      { $match: { success: false } },
      { $group: { _id: "$phone", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Math.max(limit, 10) },
    ]);
    const topFailedIPsPromise = LoginHistory.aggregate([
      { $match: { success: false } },
      { $group: { _id: "$ipAddress", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: Math.max(limit, 10) },
    ]);

    // Last login per user
    const lastLoginPerUserPromise = LoginHistory.aggregate([
      { $match: { success: true, user: { $ne: null } } },
      {
        $group: {
          _id: "$user",
          lastLogin: { $max: "$timestamp" },
        },
      },
      { $sort: { lastLogin: -1 } },
      { $limit: Math.max(limit, 20) },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          name: { $ifNull: ["$user.name", "Unknown"] },
          email: { $ifNull: ["$user.email", ""] },
          lastLogin: 1,
        },
      },
    ]);

    // Dormant users calculation
    const dormancyDate = new Date();
    dormancyDate.setDate(now.getDate() - dormancyDays);
    
    const lastLoginAllUsersPromise = LoginHistory.aggregate([
      { $match: { success: true, user: { $ne: null } } },
      {
        $group: {
          _id: "$user",
          lastLogin: { $max: "$timestamp" },
        },
      },
    ]);

    // Execute all promises
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      roleBreakdown,
      notificationPrefs,
      signupTrend,
      dau,
      mau,
      topUsers,
      topFailedPhones,
      topFailedIPs,
      lastLogins,
      lastLoginAllUsers,
    ] = await Promise.all([
      totalUsersPromise,
      activeUsersPromise,
      verifiedUsersPromise,
      roleBreakdownPromise,
      notificationPrefsPromise,
      signupTrendPromise,
      dauPromise,
      mauPromise,
      topUsersPromise,
      topFailedPhonesPromise,
      topFailedIPsPromise,
      lastLoginPerUserPromise,
      lastLoginAllUsersPromise,
    ]);

    // Compute dormant users count
    const lastLoginMap = new Map<string, Date>();
    for (const doc of lastLoginAllUsers) {
      if (doc._id && doc.lastLogin)
        lastLoginMap.set(String(doc._id), new Date(doc.lastLogin));
    }

    const usersWithAnyLogin = lastLoginMap.size;
    const usersWithoutAnyLogin = Math.max(0, totalUsers - usersWithAnyLogin);

    let usersWithLastLoginBeforeDormancy = 0;
    for (const d of lastLoginMap.values()) {
      if (d < dormancyDate) usersWithLastLoginBeforeDormancy++;
    }
    const dormantUsersCount = usersWithoutAnyLogin + usersWithLastLoginBeforeDormancy;

    // New vs Returning users calculation
    const periodStart = startDate || pastNDays;
    const periodEnd = endDate || now;

    const newUsersCount = await User.countDocuments({
      createdAt: { $gte: periodStart, $lte: periodEnd },
    });

    const returningUsersAgg = await LoginHistory.aggregate([
      {
        $match: {
          success: true,
          user: { $ne: null },
          timestamp: { $gte: periodStart, $lte: periodEnd },
        },
      },
      { $group: { _id: "$user" } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          "user.createdAt": { $lt: periodStart },
        },
      },
      { $count: "returningCount" },
    ]);
    
    const returningUsersCount = returningUsersAgg?.[0]?.returningCount || 0;

    // Growth rate calculation
    const prevPeriodStart = new Date(periodStart);
    const prevPeriodEnd = new Date(periodEnd);
    const periodMs = periodEnd.getTime() - periodStart.getTime();
    prevPeriodStart.setTime(periodStart.getTime() - periodMs);
    prevPeriodEnd.setTime(periodStart.getTime() - 1);

    const prevNewUsersCount = await User.countDocuments({
      createdAt: { $gte: prevPeriodStart, $lte: prevPeriodEnd },
    });

    const growthRate = prevNewUsersCount > 0
      ? ((newUsersCount - prevNewUsersCount) / prevNewUsersCount) * 100
      : null;

    // Prepare analytics response
    const analytics = {
      totals: {
        totalUsers,
        activeUsers,
        inactiveUsers: Math.max(0, totalUsers - activeUsers),
        verifiedUsers,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
      },
      roleBreakdown,
      notificationPrefs: notificationPrefs[0] || {
        emailOn: 0,
        smsOn: 0,
        total: totalUsers,
      },
      signupTrend,
      dau,
      mau,
      newVsReturning: {
        newUsersCount,
        returningUsersCount,
        growthRate,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString(),
        },
      },
      topUsers,
      topFailedPhones,
      topFailedIPs,
      lastLogins,
      dormantUsersCount,
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
          dormancyDays,
          limit,
        },
      },
    };

    return successResponse({
      status: 200,
      message: "User analytics fetched successfully",
      data: analytics,
      req,
    });

  } catch (err: any) {
    console.error("User Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch user analytics",
      error: err.message || err,
      req,
    });
  }
});