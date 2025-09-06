import { NextRequest, NextResponse } from "next/server";
import { Order } from "@/server/models/Order.model";
import { User } from "@/server/models/User.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler, isValidObjectId, sanitizeUser } from "@/lib/utils/apiHelpers";
import { AuthMiddleware } from "@/lib/middleware/auth";
import { notificationService } from "@/services/notificationService";
import { z } from "zod";

const updateOrderSchema = z.object({
  parcel: z.object({
    customerNote: z.string().max(500).optional(),
    priority: z.enum(["normal", "express", "super-express", "tax-paid"]).optional(),
  }).optional(),
  payment: z.object({
    pExtraCharge: z.number().nonnegative().optional(),
  }).optional(),
});

const cancelOrderSchema = z.object({
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  refundRequested: z.boolean().optional().default(false)
});

// Get Order by ID
export const GET = createApiHandler({
  auth: { required: true },
  rateLimit: 'general'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const orderId = params?.id;
    
    if (!orderId || !isValidObjectId(orderId)) {
      return errorResponse({
        req,
        status: 400,
        message: "Invalid order ID",
        error: "Order ID must be a valid MongoDB ObjectId"
      });
    }

    const user = req.user!;

    // Find order
    const order = await Order.findById(orderId)
      .populate('user', 'name phone email')
      .populate('parcel.from', 'name code flag')
      .populate('parcel.to', 'name code flag');

    if (!order) {
      return errorResponse({
        req,
        status: 404,
        message: "Order not found",
        error: `Order with ID ${orderId} does not exist`
      });
    }

    // Check access permissions
    const canAccess = ['admin', 'super_admin'].includes(user.role) || 
                     order.user._id.toString() === user.id;

    if (!canAccess) {
      return errorResponse({
        req,
        status: 403,
        message: "Access denied",
        error: "You can only view your own orders"
      });
    }

    // Get tracking information
    const { Track } = await import("@/server/models/Track.model");
    const tracking = await Track.findOne({ order: order._id });

    // Prepare response
    const orderResponse = {
      id: order._id,
      trackId: order.trackId,
      status: order.status,
      orderDate: order.orderDate,
      parcel: {
        from: {
          country: order.parcel.from?.name || 'Unknown',
          code: order.parcel.from?.code,
          id: order.parcel.from?._id
        },
        to: {
          country: order.parcel.to?.name || 'Unknown',
          code: order.parcel.to?.code,
          id: order.parcel.to?._id
        },
        sender: order.parcel.sender,
        receiver: order.parcel.receiver,
        box: order.parcel.box,
        weight: order.parcel.weight,
        serviceType: order.parcel.serviceType,
        priority: order.parcel.priority,
        orderType: order.parcel.orderType,
        item: order.parcel.item,
        customerNote: order.parcel.customerNote
      },
      payment: {
        pType: order.payment.pType,
        pAmount: order.payment.pAmount,
        pOfferDiscount: order.payment.pOfferDiscount,
        pExtraCharge: order.payment.pExtraCharge,
        pDiscount: order.payment.pDiscount,
        pReceived: order.payment.pReceived,
        pRefunded: order.payment.pRefunded,
        status: order.payment.status
      },
      handover_by: order.handover_by,
      tracking: tracking ? {
        currentStatus: tracking.currentStatus,
        lastUpdate: tracking.updatedAt,
        estimatedDelivery: tracking.estimatedDelivery,
        historyCount: tracking.history?.length || 0
      } : null,
      estimatedDelivery: order.estimatedDelivery,
      deliveryDate: order.deliveryDate,
      cancellation: order.cancellation,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };

    // Include user info for admins
    if (['admin', 'super_admin'].includes(user.role)) {
      (orderResponse as any).user = sanitizeUser(order.user);
    }

    return successResponse({
      req,
      status: 200,
      message: "Order details retrieved successfully",
      data: { order: orderResponse }
    });

  } catch (error) {
    console.error('Get order error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to retrieve order",
      error: "An error occurred while fetching order details"
    });
  }
});

// Update Order
export const PUT = createApiHandler({
  auth: { required: true },
  validation: { body: updateOrderSchema },
  rateLimit: 'general'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const orderId = params?.id;
    const updateData = req.validatedData!.body;
    const user = req.user!;

    if (!orderId || !isValidObjectId(orderId)) {
      return errorResponse({
        req,
        status: 400,
        message: "Invalid order ID"
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return errorResponse({
        req,
        status: 404,
        message: "Order not found"
      });
    }

    // Check ownership or admin access
    const canUpdate = ['admin', 'super_admin'].includes(user.role) || 
                     order.user.toString() === user.id;

    if (!canUpdate) {
      return errorResponse({
        req,
        status: 403,
        message: "Access denied",
        error: "You can only update your own orders"
      });
    }

    // Check if order can be updated (not shipped yet)
    const updatableStatuses = ['created', 'pickup-pending'];
    if (!updatableStatuses.includes(order.status)) {
      return errorResponse({
        req,
        status: 422,
        message: "Order cannot be updated",
        error: `Order with status '${order.status}' cannot be modified`
      });
    }

    // Apply updates
    const updatedFields: string[] = [];

    if (updateData.parcel) {
      if (updateData.parcel.customerNote !== undefined) {
        order.parcel.customerNote = updateData.parcel.customerNote;
        updatedFields.push('customerNote');
      }
      
      if (updateData.parcel.priority !== undefined) {
        order.parcel.priority = updateData.parcel.priority;
        updatedFields.push('priority');
        
        // Recalculate estimated delivery
        order.estimatedDelivery = calculateEstimatedDelivery(updateData.parcel.priority);
      }
    }

    if (updateData.payment) {
      if (updateData.payment.pExtraCharge !== undefined) {
        order.payment.pExtraCharge = updateData.payment.pExtraCharge;
        // Recalculate final amount
        order.payment.pReceived = order.payment.pAmount + 
          updateData.payment.pExtraCharge - 
          (order.payment.pDiscount || 0) - 
          (order.payment.pOfferDiscount || 0);
        updatedFields.push('extraCharge');
      }
    }

    order.updatedAt = new Date();
    await order.save();

    // Send update notification if significant changes
    if (updatedFields.includes('priority')) {
      await notificationService.sendOrderNotification({
        orderId: order._id.toString(),
        trackId: order.trackId,
        status: order.status,
        senderPhone: order.parcel.sender.phone,
        senderEmail: order.parcel.sender.email
      }, "created"); // Use created template with updated info
    }

    return successResponse({
      req,
      status: 200,
      message: "Order updated successfully",
      data: {
        order: {
          id: order._id,
          trackId: order.trackId,
          updatedFields,
          updatedAt: order.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Update order error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Order update failed",
      error: "An error occurred while updating the order"
    });
  }
});

// Cancel Order
export const DELETE = createApiHandler({
  auth: { required: true },
  validation: { body: cancelOrderSchema },
  rateLimit: 'general'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const orderId = params?.id;
    const { reason, refundRequested } = req.validatedData!.body;
    const user = req.user!;

    if (!orderId || !isValidObjectId(orderId)) {
      return errorResponse({
        req,
        status: 400,
        message: "Invalid order ID"
      });
    }

    // Find order
    const order = await Order.findById(orderId);

    if (!order) {
      return errorResponse({
        req,
        status: 404,
        message: "Order not found"
      });
    }

    // Check ownership or admin access
    const canCancel = ['admin', 'super_admin'].includes(user.role) || 
                     order.user.toString() === user.id;

    if (!canCancel) {
      return errorResponse({
        req,
        status: 403,
        message: "Access denied",
        error: "You can only cancel your own orders"
      });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['created', 'pickup-pending', 'picked-up'];
    if (!cancellableStatuses.includes(order.status)) {
      return errorResponse({
        req,
        status: 422,
        message: "Order cannot be cancelled",
        error: `Order with status '${order.status}' cannot be cancelled`
      });
    }

    // Calculate refund eligibility
    const refundInfo = calculateRefundEligibility(order);

    // Update order status
    order.status = 'cancelled';
    order.cancellation = {
      reason,
      refundRequested,
      refundEligible: refundInfo.eligible,
      refundAmount: refundInfo.amount,
      processingTime: refundInfo.processingTime,
      cancelledBy: user.id,
      cancelledAt: new Date()
    };
    order.updatedAt = new Date();

    await order.save();

    // Update tracking
    const { Track } = await import("@/server/models/Track.model");
    await Track.findOneAndUpdate(
      { order: order._id },
      {
        currentStatus: 'cancelled',
        $push: {
          history: {
            status: 'cancelled',
            description: `Order cancelled: ${reason}`,
            timestamp: new Date()
          }
        }
      }
    );

    // Send cancellation notifications
    await notificationService.sendOrderNotification({
      orderId: order._id.toString(),
      trackId: order.trackId,
      status: 'cancelled',
      senderPhone: order.parcel.sender.phone,
      senderEmail: order.parcel.sender.email
    }, "cancelled");

    return successResponse({
      req,
      status: 200,
      message: "Order cancelled successfully",
      data: {
        order: {
          id: order._id,
          trackId: order.trackId,
          status: order.status,
          cancellationDate: order.cancellation.cancelledAt,
          refund: {
            eligible: refundInfo.eligible,
            amount: refundInfo.amount,
            processingTime: refundInfo.processingTime
          }
        }
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Order cancellation failed",
      error: "An error occurred while cancelling the order"
    });
  }
});

/**
 * Calculate estimated delivery date
 */
function calculateEstimatedDelivery(priority: string): Date {
  const deliveryDays = {
    "normal": 7,
    "express": 3,
    "super-express": 2,
    "tax-paid": 5
  };

  const days = deliveryDays[priority as keyof typeof deliveryDays] || 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Calculate refund eligibility
 */
function calculateRefundEligibility(order: any): {
  eligible: boolean;
  amount: number;
  processingTime: string;
} {
  const status = order.status;
  const totalPaid = order.payment.pReceived;

  // Refund rules based on order status
  if (status === 'created') {
    return {
      eligible: true,
      amount: totalPaid - 5, // $5 processing fee
      processingTime: "1-2 business days"
    };
  }
  
  if (status === 'pickup-pending') {
    return {
      eligible: true,
      amount: totalPaid - 10, // $10 processing fee
      processingTime: "2-3 business days"
    };
  }
  
  if (status === 'picked-up') {
    return {
      eligible: true,
      amount: Math.round(totalPaid * 0.7), // 70% refund
      processingTime: "3-5 business days"
    };
  }

  return {
    eligible: false,
    amount: 0,
    processingTime: "No refund available"
  };
}

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}