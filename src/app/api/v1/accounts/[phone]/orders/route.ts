import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Order } from "@/server/models/Order.model";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

// GET - fetch all orders for a user by phone
export async function GET(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await connectDB();
    const { phone } = params;

    // Find the user by phone
    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    // Fetch all orders where the user is sender or receiver
    const orders = await Order.find({
      $or: [
        { "parcel.sender.phone": phone },
        { "parcel.receiver.phone": phone }
      ]
    }).sort({ orderDate: -1 });

    return successResponse({ status: 200, message: "Orders fetched", data: orders, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch orders";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
