import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Track } from "@/server/models/Track.model";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

type GetQuery = {
  trackId?: string;
  currentStatus?: string;
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

    const page = Math.max(1, parseInt(q.page || "1", 10));
    const limit = Math.max(1, Math.min(200, parseInt(q.limit || "20", 10)));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (q.trackId) {
      if (q.trackId.includes("*") || q.trackId.includes("%")) {
        const pattern = q.trackId.replace(/\*/g, ".*").replace(/%/g, ".*");
        query.trackId = { $regex: pattern, $options: "i" };
      } else query.trackId = q.trackId;
    }

    if (q.currentStatus) query.currentStatus = q.currentStatus;
    if (q.search)
      query["history.description"] = { $regex: q.search, $options: "i" };

    const allowedSortFields = new Set([
      "createdAt",
      "updatedAt",
      "currentStatus",
      "trackId",
    ]);
    const sortBy = allowedSortFields.has(q.sortBy || "")
      ? q.sortBy
      : "createdAt";
    const sortOrder = (q.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

    const total = await Track.countDocuments(query);
    const tracks = await Track.find(query).populate('order')
      .sort({ [sortBy as string]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse({
      status: 200,
      message: "Tracks fetched successfully",
      data: tracks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch tracks";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await req.json()) as any;

    if (!body.order || !Types.ObjectId.isValid(body.order))
      return errorResponse({ status: 400, message: "order is required", req });

    const track = new Track({
      order: body.order,
      currentStatus: body.currentStatus || "created",
      estimatedDelivery: body.estimatedDelivery
        ? new Date(body.estimatedDelivery)
        : undefined,
      history: body.history || [],
    });

    await track.save();

    return successResponse({
      status: 201,
      message: "Track created successfully",
      data: track,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to create track";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
