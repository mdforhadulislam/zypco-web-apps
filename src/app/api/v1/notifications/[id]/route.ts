// F:\New folder\zypco-web-apps\src\app\api\v1\notifications\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";
import { Notification } from "@/server/models/Notification.model";
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

    const notification = await Notification.findById(id).lean();
    if (!notification) return errorResponse({ status: 404, message: "Notification not found", req });

    return successResponse({ status: 200, message: "Notification fetched successfully", data: notification, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch notification";
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
    const allowedFields = ["title", "message", "type", "read"];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    for (const key of allowedFields) if (key in body) updateData[key] = body[key];

    const updated = await Notification.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) return errorResponse({ status: 404, message: "Notification not found", req });

    return successResponse({ status: 200, message: "Notification updated successfully", data: updated, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update notification";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid ID", req });

    const body = await req.json();
    console.log(body);
    
    const allowedFields = ["title", "message", "type", "isRead"];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    for (const key of allowedFields) if (key in body) updateData[key] = body[key];

    console.log(updateData);
    

    const updated = await Notification.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!updated) return errorResponse({ status: 404, message: "Notification not found", req });

    return successResponse({ status: 200, message: "Notification updated successfully", data: updated, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update notification";
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

    const deleted = await Notification.findByIdAndDelete(id).lean();
    if (!deleted) return errorResponse({ status: 404, message: "Notification not found", req });

    return successResponse({ status: 200, message: "Notification deleted successfully", data: deleted, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete notification";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
