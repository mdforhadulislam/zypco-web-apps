import { NextRequest } from "next/server";

import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Permission } from "@/server/models/Permission.model";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const params = url.searchParams;

    const startDateParam = params.get("startDate");
    const endDateParam = params.get("endDate");
    const roleFilter = params.get("role"); // user | admin | moderator
    const limitParam = parseInt(params.get("limit") || "10", 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match: any = {};
    if (startDateParam) match.grantedAt = { $gte: new Date(startDateParam) };
    if (endDateParam) {
      const ed = new Date(endDateParam);
      ed.setHours(23, 59, 59, 999);
      match.grantedAt = match.grantedAt || {};
      match.grantedAt.$lte = ed;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [];
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });

    // Lookup user to get role
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    });

    pipeline.push({ $unwind: "$user" });

    if (roleFilter) {
      pipeline.push({ $match: { "user.role": roleFilter } });
    }

    // Facet for analytics
    pipeline.push({
      $facet: {
        totalPermissions: [
          { $count: "count" },
          { $addFields: { active: { $sum: { $cond: ["$isActive", 1, 0] } } } },
        ],
        activePermissions: [
          { $match: { isActive: true } },
          { $count: "count" },
        ],
        revokedPermissions: [
          { $match: { isActive: false } },
          { $count: "count" },
        ],
        permissionsDistribution: [
          { $unwind: "$permissions" },
          {
            $group: {
              _id: "$permissions",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: Math.max(limitParam, 10) },
        ],
        roleBreakdown: [
          {
            $group: {
              _id: "$user.role",
              totalPermissions: { $sum: { $size: "$permissions" } },
              users: { $sum: 1 },
            },
          },
        ],
      },
    });

    const agg = await Permission.aggregate(pipeline);
    const r = agg[0] || {};

    return successResponse({
      status: 200,
      message: "Permissions analytics fetched successfully",
      data: {
        totalPermissions: r.totalPermissions?.[0]?.count || 0,
        activePermissions: r.activePermissions?.[0]?.count || 0,
        revokedPermissions: r.revokedPermissions?.[0]?.count || 0,
        permissionsDistribution: r.permissionsDistribution || [],
        roleBreakdown: r.roleBreakdown || [],
        filters: {
          startDate: startDateParam,
          endDate: endDateParam,
          role: roleFilter,
        },
      },
      req,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Permissions Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch permissions analytics",
      error: err.message || err,
      req,
    });
  }
}
