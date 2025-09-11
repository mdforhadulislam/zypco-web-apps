import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import { Review } from "@/server/models/Review.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";

type GetQuery = {
  user?: string;
  status?: string;
  rating?: string;
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

    if (q.user && Types.ObjectId.isValid(q.user)) query.user = new Types.ObjectId(q.user);
    if (q.status) query.status = q.status;
    if (q.rating) query.rating = Number(q.rating);
    if (q.search) query.$or = [{ comment: { $regex: q.search, $options: "i" } }];

    const allowedSortFields = new Set(["createdAt", "updatedAt", "rating", "helpfulCount"]);
    const sortBy = allowedSortFields.has(q.sortBy || "") ? q.sortBy : "createdAt";
    const sortOrder = (q.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
  .sort({ [sortBy as string]: sortOrder })
  .skip(skip)
  .limit(limit)
  .lean();

    return successResponse({
      status: 200,
      message: "Reviews fetched successfully",
      data: reviews,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch reviews";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await req.json()) as any;

    if (!body.user || !Types.ObjectId.isValid(body.user)) return errorResponse({ status: 400, message: "user is required", req });
    if (!body.rating || Number(body.rating) < 1 || Number(body.rating) > 5) return errorResponse({ status: 400, message: "rating must be between 1 and 5", req });
    if (!body.comment || typeof body.comment !== "string") return errorResponse({ status: 400, message: "comment is required", req });

    const review = new Review({
      user: body.user,
      rating: Number(body.rating),
      comment: body.comment,
      isVerified: !!body.isVerified,
      isFeatured: !!body.isFeatured,
      helpfulCount: body.helpfulCount ? Number(body.helpfulCount) : 0,
      status: body.status || "pending",
    });

    await review.save();

    return successResponse({ status: 201, message: "Review created successfully", data: review, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create review";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
