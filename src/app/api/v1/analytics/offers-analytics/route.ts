// D:\New folder\zypco-web-apps\src\app\api\v1\analytics\offers-analytics\route.ts
import { NextRequest } from "next/server";

import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Offer } from "@/server/models/Offer.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // Parse filters from query params
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const startDateParam = searchParams.get("startDate"); // YYYY-MM-DD
    const endDateParam = searchParams.get("endDate"); // YYYY-MM-DD
    const typeFilter = searchParams.get("type"); // "discount" | "rate_modifier"
    const targetUsersFilter = searchParams.get("targetUsers"); // "all" | "new" | "specific_group"
    const activeOnlyParam = searchParams.get("activeOnly"); // "true" => only currently active
    const limitParam = parseInt(searchParams.get("limit") || "10", 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match: any = {};

    if (startDateParam) {
      const sd = new Date(startDateParam);
      if (!match.createdAt) match.createdAt = {};
      match.createdAt.$gte = sd;
    }
    if (endDateParam) {
      const ed = new Date(endDateParam);
      // include end-of-day
      ed.setHours(23, 59, 59, 999);
      if (!match.createdAt) match.createdAt = {};
      match.createdAt.$lte = ed;
    }

    if (typeFilter) {
      match["offerDetails.type"] = typeFilter;
    }

    if (targetUsersFilter) {
      match.targetUsers = targetUsersFilter;
    }

    // if activeOnly, approximate "active" as isActive === true AND validFrom <= now <= validUntil
    const now = new Date();
    const activeOnly = activeOnlyParam === "true";

    // Build aggregation with facets (single db call)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const facetPipeline: any = {
      $facet: {
        totalOffers: [{ $count: "count" }],

        activeOffers: [
          {
            $match: Object.assign(
              {},
              activeOnly
                ? {
                    isActive: true,
                    validFrom: { $lte: now },
                    validUntil: { $gte: now },
                  }
                : { isActive: true }
            ), // if activeOnly true use date bounds else just isActive:true
          },
          { $count: "count" },
        ],

        expiredOffers: [
          {
            $match: {
              $or: [{ isActive: false }, { validUntil: { $lt: now } }],
            },
          },
          { $count: "count" },
        ],

        upcomingOffers: [
          {
            $match: {
              validFrom: { $gt: now },
            },
          },
          { $count: "count" },
        ],

        offersByType: [
          { $group: { _id: "$offerDetails.type", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],

        // Average discount percentage for "discount" offers
        avgDiscount: [
          { $match: { "offerDetails.type": "discount" } },
          {
            $group: {
              _id: null,
              avgDiscount: { $avg: "$offerDetails.percentage" },
              minDiscount: { $min: "$offerDetails.percentage" },
              maxDiscount: { $max: "$offerDetails.percentage" },
            },
          },
        ],

        // Average modifier for rate_modifier offers
        avgModifier: [
          { $match: { "offerDetails.type": "rate_modifier" } },
          {
            $group: {
              _id: null,
              avgModifier: { $avg: "$offerDetails.modifier" },
              minModifier: { $min: "$offerDetails.modifier" },
              maxModifier: { $max: "$offerDetails.modifier" },
            },
          },
        ],

        // Offers by targetUsers
        offersByTargetUsers: [
          { $group: { _id: "$targetUsers", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],

        // Created trend: monthly counts (for last 12 months if not filtered)
        createdTrend: [
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
          {
            $project: {
              _id: 0,
              year: "$_id.year",
              month: "$_id.month",
              count: 1,
            },
          },
        ],

        // Top creators (createdBy) with user lookup (name)
        topCreators: [
          { $group: { _id: "$createdBy", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: Math.max(10, limitParam) },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "creator",
            },
          },
          { $unwind: { path: "$creator", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              creatorId: "$_id",
              creatorName: { $ifNull: ["$creator.name", "Unknown"] },
              count: 1,
            },
          },
        ],

        // Offers ending soon (next 7 days)
        offersEndingSoon: [
          {
            $match: {
              validUntil: {
                $gte: now,
                $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $project: {
              _id: 1,
              name: "$name",
              validFrom: 1,
              validUntil: 1,
              isActive: 1,
              targetUsers: 1,
            },
          },
          { $sort: { validUntil: 1 } },
          { $limit: Math.max(10, limitParam) },
        ],
      },
    };

    // If a global match exists (filters), prepend it

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [];
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }
    pipeline.push(facetPipeline);

    const result = await Offer.aggregate(pipeline);
    const r = result[0] || {};

    // Normalize facet outputs to easy scalar / arrays for frontend
    const analytics = {
      totalOffers: r.totalOffers?.[0]?.count || 0,
      activeOffers: r.activeOffers?.[0]?.count || 0,
      expiredOffers: r.expiredOffers?.[0]?.count || 0,
      upcomingOffers: r.upcomingOffers?.[0]?.count || 0,
      offersByType: r.offersByType || [],
      avgDiscount: r.avgDiscount?.[0]
        ? {
            avg: r.avgDiscount[0].avgDiscount ?? 0,
            min: r.avgDiscount[0].minDiscount ?? 0,
            max: r.avgDiscount[0].maxDiscount ?? 0,
          }
        : { avg: 0, min: 0, max: 0 },
      avgModifier: r.avgModifier?.[0]
        ? {
            avg: r.avgModifier[0].avgModifier ?? 0,
            min: r.avgModifier[0].minModifier ?? 0,
            max: r.avgModifier[0].maxModifier ?? 0,
          }
        : { avg: 0, min: 0, max: 0 },
      offersByTargetUsers: r.offersByTargetUsers || [],
      createdTrend: r.createdTrend || [],
      topCreators: r.topCreators || [],
      offersEndingSoon: r.offersEndingSoon || [],
      // echo applied filters for frontend use
      filters: {
        startDate: startDateParam,
        endDate: endDateParam,
        type: typeFilter,
        targetUsers: targetUsersFilter,
        activeOnly: activeOnlyParam,
        limit: limitParam,
      },
    };

    return successResponse({
      status: 200,
      message: "Offers analytics fetched successfully",
      data: analytics,
      req,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Offers Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch offers analytics",
      error: err.message || err,
      req,
    });
  }
}
