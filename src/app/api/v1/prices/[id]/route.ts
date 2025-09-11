import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import { Price } from "@/server/models/Price.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid ID", req });

    const price = await Price.findById(id).lean();
    if (!price) return errorResponse({ status: 404, message: "Price not found", req });

    return successResponse({ status: 200, message: "Price fetched successfully", data: price, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch price";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid ID", req });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await req.json()) as any;

    if (body.rate && !Array.isArray(body.rate)) return errorResponse({ status: 400, message: "rate must be an array", req });

    const price = await Price.findById(id);
    if (!price) return errorResponse({ status: 404, message: "Price not found", req });

    // Update fields
    if (body.from && Types.ObjectId.isValid(body.from)) price.from = body.from;
    if (body.to && Types.ObjectId.isValid(body.to)) price.to = body.to;
    if (body.rate) price.rate = body.rate;

    await price.save();

    return successResponse({ status: 200, message: "Price updated successfully", data: price, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update price";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid ID", req });

    const deleted = await Price.findByIdAndDelete(id);
    if (!deleted) return errorResponse({ status: 404, message: "Price not found", req });

    return successResponse({ status: 200, message: "Price deleted successfully", req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete price";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
