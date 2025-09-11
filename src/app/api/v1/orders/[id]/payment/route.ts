// F:\New folder (2)\zypco-web-apps\src\app\api\v1\orders\[id]\payment\route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/db";
import { Order } from "@/server/models/Order.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid order id", req });

    const body = await req.json();
    if (!body || typeof body !== "object") return errorResponse({ status: 400, message: "Invalid body", req });

    // Allowed fields for payment update
    const allowedFields = [
      "pType",
      "pAmount",
      "pOfferDiscount",
      "pExtraCharge",
      "pDiscount",
      "pReceived",
      "pRefunded",
    ];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in body) {
        const val = Number(body[field]);
        update[`payment.${field}`] = isNaN(val) ? 0 : val;
      }
    }

    // Special case: pType (string)
    if ("pType" in body && typeof body.pType === "string") {
      update["payment.pType"] = body.pType;
    }

    const order = await Order.findByIdAndUpdate(id, { $set: update }, { new: true });
    if (!order) return errorResponse({ status: 404, message: "Order not found", req });

    return successResponse({
      status: 200,
      message: "Payment updated successfully",
      data: order.payment,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update payment";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
