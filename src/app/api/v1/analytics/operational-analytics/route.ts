import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Pickup } from "@/server/models/Pickup.model"; // path তোমার প্রকল্প অনুযায়ী ঠিক করো
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const statusFilter = searchParams.get("status"); // pending, scheduled, picked, cancelled
    const moderatorId = searchParams.get("moderatorId");
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match: any = {};

    if (startDateParam) {
      match.preferredDate = { $gte: new Date(startDateParam) };
    }
    if (endDateParam) {
      if (!match.preferredDate) match.preferredDate = {};
      const ed = new Date(endDateParam);
      ed.setHours(23, 59, 59, 999);
      match.preferredDate.$lte = ed;
    }

    if (statusFilter) {
      match.status = statusFilter;
    }

    if (moderatorId) {
      match.moderator = moderatorId;
    }

    const now = new Date();

    // Aggregation pipeline with facets

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [];
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({
      $facet: {
        totalPickups: [{ $count: "count" }],
        statusBreakdown: [
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        upcomingPickups: [
          { $match: { preferredDate: { $gte: now } } },
          { $sort: { preferredDate: 1 } },
          { $limit: Math.max(limitParam, 10) },
          {
            $project: {
              _id: 1,
              user: 1,
              moderator: 1,
              pickupAddress: 1,
              preferredDate: 1,
              preferredTimeSlot: 1,
              status: 1,
              notes: 1,
              cost: 1,
            },
          },
        ],
        pastPickups: [
          { $match: { preferredDate: { $lt: now } } },
          { $sort: { preferredDate: -1 } },
          { $limit: Math.max(limitParam, 10) },
          {
            $project: {
              _id: 1,
              user: 1,
              moderator: 1,
              pickupAddress: 1,
              preferredDate: 1,
              preferredTimeSlot: 1,
              status: 1,
              notes: 1,
              cost: 1,
            },
          },
        ],
        costSummary: [
          {
            $group: {
              _id: null,
              totalCost: { $sum: "$cost" },
              avgCost: { $avg: "$cost" },
              minCost: { $min: "$cost" },
              maxCost: { $max: "$cost" },
            },
          },
        ],
        moderatorActivity: [
          { $group: { _id: "$moderator", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: Math.max(limitParam, 10) },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "moderator",
            },
          },
          { $unwind: { path: "$moderator", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              moderatorId: "$_id",
              moderatorName: { $ifNull: ["$moderator.name", "Unknown"] },
              count: 1,
            },
          },
        ],
      },
    });

    const result = await Pickup.aggregate(pipeline);
    const r = result[0] || {};

    const analytics = {
      totalPickups: r.totalPickups?.[0]?.count || 0,
      statusBreakdown: r.statusBreakdown || [],
      upcomingPickups: r.upcomingPickups || [],
      pastPickups: r.pastPickups || [],
      costSummary: r.costSummary?.[0] || {
        totalCost: 0,
        avgCost: 0,
        minCost: 0,
        maxCost: 0,
      },
      moderatorActivity: r.moderatorActivity || [],
      filters: {
        startDate: startDateParam,
        endDate: endDateParam,
        status: statusFilter,
        moderatorId,
        limit: limitParam,
      },
    };

    return successResponse({
      status: 200,
      message: "Operational pickups analytics fetched successfully",
      data: analytics,
      req,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Operational Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch operational pickups analytics",
      error: err.message || err,
      req,
    });
  }
}
