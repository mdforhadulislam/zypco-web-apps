// F:\New folder\zypco-web-apps\src\app\api\v1\notifications\route.ts
import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import { Notification } from "@/server/models/Notification.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";

type GetQuery = {
  user?: string;
  read?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const q: GetQuery = Object.fromEntries(url.searchParams.entries());

    const page = Math.max(1, parseInt(q.page || "1"));
    const limit = Math.max(1, Math.min(200, parseInt(q.limit || "20")));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (q.user && Types.ObjectId.isValid(q.user)) query.user = new Types.ObjectId(q.user);
    if (q.read !== undefined) query.read = q.read === "true";
    if (q.search) {
      const s = q.search.trim();
      query.$or = [
        { title: { $regex: s, $options: "i" } },
        { message: { $regex: s, $options: "i" } },
      ];
    }

    const allowedSortFields = new Set(["sentAt", "createdAt", "title", "read"]);
    const sortBy = allowedSortFields.has(q.sortBy || "") ? (q.sortBy as string) : "sentAt";
    const sortOrder = (q.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse({
      status: 200,
      message: "Notifications fetched successfully",
      data: notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch notifications";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.userId) return errorResponse({ status: 400, message: "user is required", req });
    if (!body.title) return errorResponse({ status: 400, message: "title is required", req });
    if (!body.message) return errorResponse({ status: 400, message: "message is required", req });

    const notification = new Notification({
      userId: body.userId,
      title: body.title,
      message: body.message,
      type: body.type || "info",
      read: body.read || false,
      sentAt: body.sentAt ? new Date(body.sentAt) : new Date(),
    });

    await notification.save();

    return successResponse({ status: 201, message: "Notification created successfully", data: notification, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create notification";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
