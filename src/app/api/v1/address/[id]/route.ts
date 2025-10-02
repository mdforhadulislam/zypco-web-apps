import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Address } from "@/server/models/Address.model";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// GET address by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid ID", req });

    const address = await Address.findById(id).populate("user").populate("country").lean();
    if (!address) return errorResponse({ status: 404, message: "Address not found", req });

    return successResponse({ status: 200, message: "Address fetched", data: address, req });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch address";
    return errorResponse({ status: 500, message: msg, error: err, req });
  }
}

// PUT update address
export async function PUT(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid ID", req });

    const body = await req.json();

    const updated = await Address.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!updated) return errorResponse({ status: 404, message: "Address not found", req });

    return successResponse({ status: 200, message: "Address updated", data: updated, req });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update address";
    return errorResponse({ status: 500, message: msg, error: err, req });
  }
}

// DELETE soft delete
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid ID", req });

    const deleted = await Address.findByIdAndUpdate(id, { $set: { isDeleted: true } }, { new: true });
    if (!deleted) return errorResponse({ status: 404, message: "Address not found", req });

    return successResponse({ status: 200, message: "Address deleted", data: deleted, req });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to delete address";
    return errorResponse({ status: 500, message: msg, error: err, req });
  }
}
