// D:\New folder\zypco-web-apps\src\app\api\v1\analytics\user-analytics\route.ts
import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

/**
 * User Analytics
 * Query params (optional):
 *  - startDate=YYYY-MM-DD
 *  - endDate=YYYY-MM-DD
 *  - days (for DAU trend) default 30
 *  - months (for MAU trend) default 12
 *  - dormancyDays default 90
 *  - limit default 10 (top lists)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
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

    // 1) Basic user totals & breakdowns
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

    // 2) Signup trend (daily) within provided dates or last `days`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // 3) DAU (daily active users) last `days` (unique user count per day from successful logins)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // 4) MAU (monthly unique active users) last `months`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // 5) Top users by successful login count
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

    // 6) Top failed login phones & IPs (failed attempts)
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

    // 7) Last login per user (most recent N users by lastSeen)
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

    // 8) Dormant users (no successful login in `dormancyDays`)
    const dormancyDate = new Date();
    dormancyDate.setDate(now.getDate() - dormancyDays);
    // We'll compute last login per user and count users with lastLogin < dormancyDate OR never logged in.
    const lastLoginAllUsersPromise = LoginHistory.aggregate([
      { $match: { success: true, user: { $ne: null } } },
      {
        $group: {
          _id: "$user",
          lastLogin: { $max: "$timestamp" },
        },
      },
    ]);

    // run promises in parallel
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

    // compute dormant users count
    // build a Map of userId -> lastLogin
    const lastLoginMap = new Map<string, Date>();
    for (const doc of lastLoginAllUsers) {
      if (doc._id && doc.lastLogin)
        lastLoginMap.set(String(doc._id), new Date(doc.lastLogin));
    }

    // We'll fetch all users count and subtract active users within dormancyDate
    // Approach: users with no successful login at all OR lastLogin < dormancyDate
    // Count users with lastLogin >= dormancyDate
    const activeSinceDormancyCount = Array.from(lastLoginMap.values()).filter(
      (d) => d >= dormancyDate
    ).length;

    // usersWithAnyLogin = size of lastLoginMap
    const usersWithAnyLogin = lastLoginMap.size;

    // usersWithoutAnyLogin = totalUsers - usersWithAnyLogin
    const usersWithoutAnyLogin = Math.max(0, totalUsers - usersWithAnyLogin);

    // dormant users = usersWithoutAnyLogin + (usersWithAnyLogin but lastLogin < dormancyDate)
    let usersWithLastLoginBeforeDormancy = 0;
    for (const d of lastLoginMap.values()) {
      if (d < dormancyDate) usersWithLastLoginBeforeDormancy++;
    }
    const dormantUsersCount =
      usersWithoutAnyLogin + usersWithLastLoginBeforeDormancy;

    // 9) New vs Returning users for period (if startDate provided, else last `days`)
    const periodStart = startDate || pastNDays;
    const periodEnd = endDate || now;

    // new users: createdAt within period
    const newUsersCountPromise = User.countDocuments({
      createdAt: { $gte: periodStart, $lte: periodEnd },
    });
    // returning users: createdAt < periodStart AND had at least one successful login in period
    const returningUsersAgg = await LoginHistory.aggregate([
      {
        $match: {
          success: true,
          user: { $ne: null },
          timestamp: { $gte: periodStart, $lte: periodEnd },
        },
      },
      {
        $group: { _id: "$user" },
      },
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
    const newUsersCount = await newUsersCountPromise;
    const returningUsersCount = returningUsersAgg?.[0]?.returningCount || 0;

    // 10) User growth rate: compare new users in this period vs previous same-length period
    const prevPeriodStart = new Date(periodStart);
    const prevPeriodEnd = new Date(periodEnd);
    const periodMs = periodEnd.getTime() - periodStart.getTime();
    prevPeriodStart.setTime(periodStart.getTime() - periodMs);
    prevPeriodEnd.setTime(periodStart.getTime() - 1);

    const prevNewUsersCount = await User.countDocuments({
      createdAt: { $gte: prevPeriodStart, $lte: prevPeriodEnd },
    });

    const growthRate =
      prevNewUsersCount > 0
        ? ((newUsersCount - prevNewUsersCount) / prevNewUsersCount) * 100
        : null;

    // Prepare final analytics payload
    const analytics = {
      totals: {
        totalUsers,
        activeUsers,
        inactiveUsers: Math.max(0, totalUsers - activeUsers),
        verifiedUsers,
        verificationRate:
          totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0,
      },
      roleBreakdown, // [{_id: "user", count: N}, ...]
      notificationPrefs: notificationPrefs[0] || {
        emailOn: 0,
        smsOn: 0,
        total: totalUsers,
      },
      signupTrend, // [{_id: "2025-09-01", count: N}, ...]
      dau, // [{day: "2025-09-01", activeUsers: N}, ...]
      mau, // [{year: 2025, month: 9, activeUsers: N}, ...]
      newVsReturning: {
        newUsersCount,
        returningUsersCount,
        growthRate,
        period: {
          start: periodStart.toISOString(),
          end: periodEnd.toISOString(),
        },
      },
      topUsers, // top successful logins with user details
      topFailedPhones,
      topFailedIPs,
      lastLogins, // recent last-login users
      dormantUsersCount,
      filters: {
        startDate: startDateParam,
        endDate: endDateParam,
        days,
        months,
        dormancyDays,
        limit,
      },
    };

    return successResponse({
      status: 200,
      message: "User analytics fetched successfully",
      data: analytics,
      req,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("User Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch user analytics",
      error: err.message || err,
      req,
    });
  }
}
