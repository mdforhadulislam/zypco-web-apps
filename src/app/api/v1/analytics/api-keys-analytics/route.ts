// D:\New folder\zypco-web-apps\src\app\api\v1\analytics\api-keys-analytics\route.ts
import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { ApiAccessLog } from "@/server/models/ApiAccessLog.model";
import { ApiConfig } from "@/server/models/ApiConfig.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // 1️⃣ API Key Analytics
    const totalKeys = await ApiConfig.countDocuments();
    const activeKeys = await ApiConfig.countDocuments({ isActive: true });
    const inactiveKeys = totalKeys - activeKeys;

    const keysPerUser = await ApiConfig.aggregate([
      { $group: { _id: "$user", totalKeys: { $sum: 1 } } },
      { $sort: { totalKeys: -1 } },
    ]);

    const expiredKeys = await ApiConfig.countDocuments({
      expiresAt: { $lte: new Date() },
    });

    const lastUsedKeys = await ApiConfig.aggregate([
      { $match: { lastUsedAt: { $ne: null } } },
      {
        $group: {
          _id: null,
          mostRecent: { $max: "$lastUsedAt" },
          oldest: { $min: "$lastUsedAt" },
        },
      },
    ]);

    // 2️⃣ API Usage Analytics
    const totalRequests = await ApiAccessLog.countDocuments();
    const requestsPerKey = await ApiAccessLog.aggregate([
      { $group: { _id: "$apiKey", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const endpointUsage = await ApiAccessLog.aggregate([
      { $group: { _id: "$endpoint", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const methodBreakdown = await ApiAccessLog.aggregate([
      { $group: { _id: "$method", count: { $sum: 1 } } },
    ]);

    const successFailure = await ApiAccessLog.aggregate([
      { $group: { _id: "$success", count: { $sum: 1 } } },
    ]);

    const responseTimeStats = await ApiAccessLog.aggregate([
      {
        $group: {
          _id: "$endpoint",
          avgResponseTime: { $avg: "$responseTime" },
          maxResponseTime: { $max: "$responseTime" },
          minResponseTime: { $min: "$responseTime" },
        },
      },
      { $sort: { avgResponseTime: -1 } },
      { $limit: 10 },
    ]);

    // 3️⃣ Security & Abuse Monitoring
    const failedRequests = await ApiAccessLog.countDocuments({
      success: false,
    });
    const blockedIPRequests = await ApiAccessLog.aggregate([
      {
        $lookup: {
          from: "apiconfigs",
          localField: "apiKey",
          foreignField: "_id",
          as: "apiKeyInfo",
        },
      },
      { $unwind: "$apiKeyInfo" },
      {
        $match: {
          $expr: { $not: { $in: ["$ip", "$apiKeyInfo.allowedIPs"] } },
        },
      },
      { $count: "blockedRequests" },
    ]);

    const expiredKeyUsage = await ApiAccessLog.aggregate([
      {
        $lookup: {
          from: "apiconfigs",
          localField: "apiKey",
          foreignField: "_id",
          as: "apiKeyInfo",
        },
      },
      { $unwind: "$apiKeyInfo" },
      {
        $match: {
          "apiKeyInfo.expiresAt": { $lte: new Date() },
        },
      },
      { $count: "expiredKeyUsage" },
    ]);

    // Response payload
    const analytics = {
      apiKeyAnalytics: {
        totalKeys,
        activeKeys,
        inactiveKeys,
        expiredKeys,
        lastUsedKeys: lastUsedKeys[0] || {},
        keysPerUser,
      },
      apiUsageAnalytics: {
        totalRequests,
        requestsPerKey,
        endpointUsage,
        methodBreakdown,
        successFailure,
        responseTimeStats,
      },
      securityMonitoring: {
        failedRequests,
        blockedIPRequests: blockedIPRequests[0]?.blockedRequests || 0,
        expiredKeyUsage: expiredKeyUsage[0]?.expiredKeyUsage || 0,
      },
    };

    return successResponse({
      message: "Analytics fetched successfully",
      data: analytics,
      req,
      status: 200,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return errorResponse({ message: error.message, status: 500, req });
  }
}
