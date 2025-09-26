import connectDB from "@/config/db";
import { createAuthHandler, createModeratorHandler, createAdminHandler } from "@/server/common/apiWrapper";
import { errorResponse, successResponse } from "@/server/common/response";
import { Order } from "@/server/models/Order.model";
import { Types } from "mongoose";

interface Params {
  id: string;
}

// GET: Users can view their own orders, Admin/Moderator can view all
export const GET = createAuthHandler(async ({ req, user }) => {
  try {
    await connectDB();

    const url = new URL(req.url);
    const orderId = url.pathname.split('/').pop();

    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return errorResponse({
        status: 400,
        message: "Invalid order ID",
        req,
      });
    }

    // Build query based on user role
    const query: any = { _id: new Types.ObjectId(orderId) };
    
    // Users can only see their own orders
    if (user?.role === "user") {
      query.$or = [
        { "parcel.sender.phone": user.phone },
        { "parcel.sender.email": user.email }
      ];
    }
    // Admin and moderator can see all orders

    const order = await Order.findOne(query).lean();

    if (!order) {
      return errorResponse({
        status: 404,
        message: "Order not found or access denied",
        req,
      });
    }

    return successResponse({
      status: 200,
      message: "Order fetched successfully",
      data: order,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch order";
    return errorResponse({ status: 500, message: msg, error, req });
  }
});

// PUT: Users can update their own orders, Moderators can update any order
export const PUT = createAuthHandler(async ({ req, user }) => {
  try {
    await connectDB();

    const url = new URL(req.url);
    const orderId = url.pathname.split('/').pop();

    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return errorResponse({
        status: 400,
        message: "Invalid order ID",
        req,
      });
    }

    const body = await req.json();

    // Build query based on user role
    const query: any = { _id: new Types.ObjectId(orderId) };
    
    // Users can only update their own orders
    if (user?.role === "user") {
      query.$or = [
        { "parcel.sender.phone": user.phone },
        { "parcel.sender.email": user.email }
      ];
    }
    // Admin and moderator can update any order

    const existingOrder = await Order.findOne(query);

    if (!existingOrder) {
      return errorResponse({
        status: 404,
        message: "Order not found or access denied",
        req,
      });
    }

    // Restrict what users can update vs admin/moderator
    let allowedUpdates: any = {};

    if (user?.role === "user") {
      // Users can only update limited fields
      const userAllowedFields = [
        "parcel.receiver",
        "parcel.description", 
        "parcel.notes",
        "parcel.item"
      ];
      
      for (const field of userAllowedFields) {
        if (body[field] !== undefined) {
          allowedUpdates[field] = body[field];
        }
      }
    } else {
      // Admin/Moderator can update most fields except system-generated ones
      const restrictedFields = ["_id", "trackId", "createdAt"];
      allowedUpdates = { ...body };
      
      for (const field of restrictedFields) {
        delete allowedUpdates[field];
      }
    }

    // Update the order
    const updatedOrder = await Order.findOneAndUpdate(
      query,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).lean();

    return successResponse({
      status: 200,
      message: "Order updated successfully",
      data: updatedOrder,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update order";
    return errorResponse({ status: 500, message: msg, error, req });
  }
});

// DELETE: Only Admin can delete orders
export const DELETE = createAdminHandler(async ({ req, user }) => {
  try {
    await connectDB();

    const url = new URL(req.url);
    const orderId = url.pathname.split('/').pop();

    if (!orderId || !Types.ObjectId.isValid(orderId)) {
      return errorResponse({
        status: 400,
        message: "Invalid order ID",
        req,
      });
    }

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return errorResponse({
        status: 404,
        message: "Order not found",
        req,
      });
    }

    return successResponse({
      status: 200,
      message: "Order deleted successfully",
      data: {
        deletedOrderId: orderId,
        trackId: deletedOrder.trackId,
        deletedBy: {
          userId: user?.id,
          role: user?.role,
          name: user?.name,
        },
        deletedAt: new Date().toISOString(),
      },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete order";
    return errorResponse({ status: 500, message: msg, error, req });
  }
});