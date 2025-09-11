// F:\New folder (2)\zypco-web-apps\src\app\api\v1\orders\[id]\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";
import { Order } from "@/server/models/Order.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid order id", req });

    const order = await Order.findById(id).lean();
    if (!order) return errorResponse({ status: 404, message: "Order not found", req });

    return successResponse({ status: 200, message: "Order fetched successfully", data: order, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch order";
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
    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid order id", req });

    const body = await req.json();

    // Update document using $set
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: any = {};
    if (body.parcel) update.parcel = body.parcel;
    if (body.payment) update.payment = body.payment;
    if (body.handover_by) update.handover_by = body.handover_by;
    if (body.orderDate) update.orderDate = new Date(body.orderDate);

    const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!order) return errorResponse({ status: 404, message: "Order not found", req });

    return successResponse({ status: 200, message: "Order updated successfully", data: order, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update order";
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
    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid order id", req });

    const order = await Order.findByIdAndDelete(id);
    if (!order) return errorResponse({ status: 404, message: "Order not found", req });

    return successResponse({ status: 200, message: "Order deleted successfully", data: order, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete order";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
