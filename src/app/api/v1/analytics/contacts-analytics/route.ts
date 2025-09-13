// D:\New folder\zypco-web-apps\src\app\api\v1\analytics\contacts-analytics\route.ts
import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Contact } from "@/server/models/Contact.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // 1️⃣ Status Breakdown
    const statusBreakdown = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 2️⃣ Category Breakdown
    const categoryBreakdown = await Contact.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ Priority Breakdown
    const priorityBreakdown = await Contact.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // 4️⃣ Read vs Unread
    const readUnreadBreakdown = await Contact.aggregate([
      {
        $group: {
          _id: "$isRead",
          count: { $sum: 1 },
        },
      },
    ]);

    // 5️⃣ Contacts per day (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const contactsPerDay = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 6️⃣ Total replies count
    const totalReplies = await Contact.aggregate([
      { $unwind: "$replies" },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    // 7️⃣ Average replies per contact
    const avgReplies = await Contact.aggregate([
      { $project: { numReplies: { $size: "$replies" } } },
      { $group: { _id: null, avgReplies: { $avg: "$numReplies" } } },
    ]);

    const analytics = {
      statusBreakdown,
      categoryBreakdown,
      priorityBreakdown,
      readUnreadBreakdown,
      contactsPerDay,
      totalReplies: totalReplies[0]?.count || 0,
      avgReplies: avgReplies[0]?.avgReplies || 0,
    };

    return successResponse({
      status: 200,
      message: "Contacts analytics fetched successfully",
      data: analytics,
      req,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Contacts Analytics Error:", error);
    return errorResponse({
      status: 500,
      message: "Failed to fetch contacts analytics",
      error,
      req,
    });
  }
}
