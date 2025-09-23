// F:\New folder (2)\zypco-web-apps\src\app\api\v1\pickups\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";
import { Pickup } from "@/server/models/Pickup.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";


/**
 * GET - fetch single pickup by id
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid pickup id", req });
    }

    const pickup = await Pickup.findById(id)
      .populate("user")
      .populate("moderator")
      .populate("address")
      .lean();

    if (!pickup) {
      return errorResponse({ status: 404, message: "Pickup not found", req });
    }

    return successResponse({ status: 200, message: "Pickup fetched successfully", data: pickup, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch pickup";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

/**
 * PUT - update pickup by id
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid pickup id", req });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await req.json()) as any;

    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedData: Record<string, any> = {};

    if (body.preferredDate) updatedData.preferredDate = new Date(body.preferredDate);
    if (body.preferredTimeSlot !== undefined) updatedData.preferredTimeSlot = body.preferredTimeSlot;
    if (body.status) updatedData.status = body.status;
    if (body.notes !== undefined) updatedData.notes = body.notes;
    if (body.cost !== undefined) updatedData.cost = Number(body.cost);
    if (body.moderator && Types.ObjectId.isValid(body.moderator)) updatedData.moderator = new Types.ObjectId(body.moderator);

    const pickup = await Pickup.findByIdAndUpdate(id, updatedData, { new: true })
      .populate("user")
      .populate("moderator")
      .populate("address")
      .lean();

    if (!pickup) {
      return errorResponse({ status: 404, message: "Pickup not found", req });
    }

    return successResponse({ status: 200, message: "Pickup updated successfully", data: pickup, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update pickup";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

/**
 * DELETE - delete pickup by id
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid pickup id", req });
    }

    const pickup = await Pickup.findByIdAndDelete(id);

    if (!pickup) {
      return errorResponse({ status: 404, message: "Pickup not found", req });
    }

    return successResponse({ status: 200, message: "Pickup deleted successfully", data: pickup, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete pickup";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
