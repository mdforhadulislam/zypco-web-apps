// D:\New folder\zypco-web-apps\src\app\api\v1\offers\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";
import { Offer } from "@/server/models/Offer.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid ID", req });

    const offer = await Offer.findById(id).lean();
    if (!offer) return errorResponse({ status: 404, message: "Offer not found", req });

    return successResponse({ status: 200, message: "Offer fetched successfully", data: offer, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch offer";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid ID", req });

    const body = await req.json();
    const allowedFields = ["name", "description", "offerDetails", "isActive", "validFrom", "validUntil", "targetUsers"];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    for (const key of allowedFields) if (key in body) updateData[key] = body[key];

    const updated = await Offer.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) return errorResponse({ status: 404, message: "Offer not found", req });

    return successResponse({ status: 200, message: "Offer updated successfully", data: updated, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update offer";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid ID", req });

    const deleted = await Offer.findByIdAndDelete(id).lean();
    if (!deleted) return errorResponse({ status: 404, message: "Offer not found", req });

    return successResponse({ status: 200, message: "Offer deleted successfully", data: deleted, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete offer";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
