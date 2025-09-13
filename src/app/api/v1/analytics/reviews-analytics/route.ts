import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Review } from "@/server/models/Review.model";
import { NextRequest } from "next/server";

/**
 * Reviews Analytics
 * Query params (all optional):
 *  - startDate=YYYY-MM-DD
 *  - endDate=YYYY-MM-DD
 *  - status=pending|approved|rejected
 *  - featured=true|false
 *  - limit=<number> (for top helpful reviews)
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const params = url.searchParams;

    const startDateParam = params.get("startDate");
    const endDateParam = params.get("endDate");
    const statusFilter = params.get("status");
    const featuredParam = params.get("featured");
    const limitParam = parseInt(params.get("limit") || "10", 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match: any = {};

    if (startDateParam) {
      match.createdAt = { $gte: new Date(startDateParam) };
    }
    if (endDateParam) {
      const ed = new Date(endDateParam);
      ed.setHours(23, 59, 59, 999);
      match.createdAt = match.createdAt || {};
      match.createdAt.$lte = ed;
    }
    if (statusFilter) {
      match.status = statusFilter;
    }
    if (featuredParam !== null) {
      match.isFeatured = featuredParam === "true";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [];
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });

    pipeline.push({
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalReviews: { $sum: 1 },
              avgRating: { $avg: "$rating" },
              verifiedCount: {
                $sum: { $cond: ["$isVerified", 1, 0] },
              },
              featuredCount: {
                $sum: { $cond: ["$isFeatured", 1, 0] },
              },
            },
          },
        ],
        ratingDistribution: [
          {
            $group: {
              _id: "$rating",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: -1 } },
        ],
        topHelpful: [
          { $sort: { helpfulCount: -1, createdAt: -1 } },
          { $limit: Math.max(limitParam, 10) },
        ],
      },
    });

    const agg = await Review.aggregate(pipeline);
    const r = agg[0] || {};

    const summary = r.summary?.[0] || {
      totalReviews: 0,
      avgRating: 0,
      verifiedCount: 0,
      featuredCount: 0,
    };

    const analytics = {
      summary,
      ratingDistribution: r.ratingDistribution || [],
      topHelpfulReviews: r.topHelpful || [],
      filters: {
        startDate: startDateParam,
        endDate: endDateParam,
        status: statusFilter,
        featured: featuredParam,
        limit: limitParam,
      },
    };

    return successResponse({
      status: 200,
      message: "Reviews analytics fetched successfully",
      data: analytics,
      req,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Reviews Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch reviews analytics",
      error: err.message || err,
      req,
    });
  }
}
