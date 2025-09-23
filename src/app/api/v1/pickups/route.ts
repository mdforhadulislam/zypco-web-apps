// F:\New folder (2)\zypco-web-apps\src\app\api\v1\pickups\route.ts
import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import { Pickup } from "@/server/models/Pickup.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";

type GetQuery = {
  status?: string;
  user?: string;
  moderator?: string;
  preferredDateFrom?: string;
  preferredDateTo?: string;
  page?: string;
  limit?: string;
};

/**
 * GET - fetch all pickups with filters, pagination & sorting
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const q: GetQuery = Object.fromEntries(url.searchParams.entries());

    const page = Math.max(1, parseInt(q.page || "1", 10));
    const limit = Math.max(1, Math.min(200, parseInt(q.limit || "10", 10)));
    const skip = (page - 1) * limit;

    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (q.status) query.status = q.status;
    if (q.user && Types.ObjectId.isValid(q.user)) query.user = new Types.ObjectId(q.user);
    if (q.moderator && Types.ObjectId.isValid(q.moderator)) query.moderator = new Types.ObjectId(q.moderator);

    if (q.preferredDateFrom || q.preferredDateTo) {
      query.preferredDate = {};
      if (q.preferredDateFrom) {
        const d = new Date(q.preferredDateFrom);
        if (!isNaN(d.getTime())) query.preferredDate.$gte = d;
      }
      if (q.preferredDateTo) {
        const d = new Date(q.preferredDateTo);
        if (!isNaN(d.getTime())) query.preferredDate.$lte = d;
      }
      if (Object.keys(query.preferredDate).length === 0) delete query.preferredDate;
    }

    const total = await Pickup.countDocuments(query);
    const pickups = await Pickup.find(query).sort({ preferredDate: 1, createdAt: -1 }).skip(skip).limit(limit).populate("user").populate("moderator").populate("address").lean();

    return successResponse({
      status: 200,
      message: "Pickups fetched successfully",
      data: pickups,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch pickups";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

/**
 * POST - create a new pickup
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await req.json()) as any;

    if (!body.user || !Types.ObjectId.isValid(body.user)) {
      return errorResponse({ status: 400, message: "user is required and must be a valid ObjectId", req });
    }

    if (!body.address || !Types.ObjectId.isValid(body.address)) {
      return errorResponse({ status: 400, message: "address is required and must be a valid ObjectId", req });
    }

    if (!body.preferredDate) {
      return errorResponse({ status: 400, message: "preferredDate is required", req });
    }

    const pickup = new Pickup({
      user: body.user, 
      address: body.address,
      preferredDate: new Date(body.preferredDate),
      preferredTimeSlot: body.preferredTimeSlot || "",
      status: body.status || "pending",
      notes: body.notes || "",
      cost: Number(body.cost) || 0,
    });

    await pickup.save();

    return successResponse({
      status: 201,
      message: "Pickup created successfully",
      data: pickup,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create pickup";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
