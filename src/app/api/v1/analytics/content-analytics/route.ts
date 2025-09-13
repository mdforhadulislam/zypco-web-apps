// D:\New folder\zypco-web-apps\src\app\api\v1\analytics\content-analytics\route.ts

import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Blog } from "@/server/models/Blog.model";
import { NextRequest } from "next/server";


export async function GET(req:NextRequest) {
  try {
    await connectDB();
    // 1️⃣ Category Breakdown
    const categoryBreakdown = await Blog.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // 2️⃣ Status Breakdown
    const statusBreakdown = await Blog.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ Views stats
    const viewsStats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          avgViews: { $avg: "$views" },
          maxViews: { $max: "$views" },
        },
      },
    ]);

    // 4️⃣ Likes & Dislikes stats
    const reactionStats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likes" },
          totalDislikes: { $sum: "$dislikes" },
          avgLikes: { $avg: "$likes" },
          avgDislikes: { $avg: "$dislikes" },
        },
      },
    ]);

    // 5️⃣ Published vs Draft
    const publishedDraftBreakdown = await Blog.aggregate([
      {
        $group: {
          _id: "$isPublished",
          count: { $sum: 1 },
        },
      },
    ]);

    // 6️⃣ Tags usage count (optional, top 10 tags)
    const tagsBreakdown = await Blog.aggregate([
      { $unwind: "$tags" },
      {
        $group: {
          _id: "$tags",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const analytics = {
      categoryBreakdown,
      statusBreakdown,
      viewsStats: viewsStats[0] || {},
      reactionStats: reactionStats[0] || {},
      publishedDraftBreakdown,
      topTags: tagsBreakdown,
    };

    return successResponse({
      status: 200,
      message: "Content analytics fetched successfully",
      data: analytics,
      req,
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Content Analytics Error:", error);
    return errorResponse({
      status: 500,
      message: "Failed to fetch content analytics",
      error,
      req,
    });
  }
}
