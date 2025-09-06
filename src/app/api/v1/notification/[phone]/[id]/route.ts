import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/server/models/Notification.model";
import { User } from "@/server/models/User.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler, isValidObjectId } from "@/lib/utils/apiHelpers";
import { AuthMiddleware } from "@/lib/middleware/auth";
import { z } from "zod";

const markReadSchema = z.object({
  readAt: z.string().datetime().optional()
});

// Get specific notification
export const GET = createApiHandler({
  auth: { required: true },
  rateLimit: 'general'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const phone = params?.phone;
    const id = params?.id;
    
    if (!phone || !id) {
      return errorResponse({
        req,
        status: 400,
        message: "Phone number and notification ID are required"
      });
    }

    if (!isValidObjectId(id)) {
      return errorResponse({
        req,
        status: 400,
        message: "Invalid notification ID format"
      });
    }

    // Validate phone access
    const phoneAccess = await AuthMiddleware.validatePhoneAccess(req, phone);
    if (!phoneAccess.success && phoneAccess.response) {
      return phoneAccess.response;
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return errorResponse({
        req,
        status: 404,
        message: "User not found"
      });
    }

    // Find notification
    const notification = await Notification.findOne({
      _id: id,
      user: user._id
    });

    if (!notification) {
      return errorResponse({
        req,
        status: 404,
        message: "Notification not found",
        error: `No notification found with ID ${id}`
      });
    }

    // Prepare detailed notification response
    const notificationResponse = {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      read: notification.read,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      data: notification.data,
      metadata: {
        source: 'notification_system',
        template: notification.category,
        locale: 'en-US',
        timezone: 'UTC'
      },
      sentAt: notification.sentAt,
      readAt: notification.readAt,
      expiresAt: notification.expiresAt,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    };

    return successResponse({
      req,
      status: 200,
      message: "Notification retrieved successfully",
      data: { notification: notificationResponse }
    });

  } catch (error) {
    console.error('Get notification error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to retrieve notification",
      error: "An error occurred while fetching notification details"
    });
  }
});

// Mark notification as read
export const PUT = createApiHandler({
  auth: { required: true },
  validation: { body: markReadSchema },
  rateLimit: 'general'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const phone = params?.phone;
    const id = params?.id;
    const { readAt } = req.validatedData!.body;
    
    if (!phone || !id) {
      return errorResponse({
        req,
        status: 400,
        message: "Phone number and notification ID are required"
      });
    }

    if (!isValidObjectId(id)) {
      return errorResponse({
        req,
        status: 400,
        message: "Invalid notification ID format"
      });
    }

    // Validate phone access
    const phoneAccess = await AuthMiddleware.validatePhoneAccess(req, phone);
    if (!phoneAccess.success && phoneAccess.response) {
      return phoneAccess.response;
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return errorResponse({
        req,
        status: 404,
        message: "User not found"
      });
    }

    // Find and update notification
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: user._id },
      { 
        read: true, 
        readAt: readAt ? new Date(readAt) : new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return errorResponse({
        req,
        status: 404,
        message: "Notification not found"
      });
    }

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      user: user._id,
      read: false
    });

    return successResponse({
      req,
      status: 200,
      message: "Notification marked as read",
      data: {
        notification: {
          id: notification._id,
          read: notification.read,
          readAt: notification.readAt
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to mark notification as read",
      error: "An error occurred while updating notification"
    });
  }
});

// Delete notification
export const DELETE = createApiHandler({
  auth: { required: true },
  rateLimit: 'general'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const phone = params?.phone;
    const id = params?.id;
    
    if (!phone || !id) {
      return errorResponse({
        req,
        status: 400,
        message: "Phone number and notification ID are required"
      });
    }

    if (!isValidObjectId(id)) {
      return errorResponse({
        req,
        status: 400,
        message: "Invalid notification ID format"
      });
    }

    // Validate phone access
    const phoneAccess = await AuthMiddleware.validatePhoneAccess(req, phone);
    if (!phoneAccess.success && phoneAccess.response) {
      return phoneAccess.response;
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return errorResponse({
        req,
        status: 404,
        message: "User not found"
      });
    }

    // Delete notification
    const result = await Notification.findOneAndDelete({
      _id: id,
      user: user._id
    });

    if (!result) {
      return errorResponse({
        req,
        status: 404,
        message: "Notification not found"
      });
    }

    return successResponse({
      req,
      status: 200,
      message: "Notification deleted successfully",
      data: {
        deleted: true,
        id: result._id
      }
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to delete notification",
      error: "An error occurred while deleting notification"
    });
  }
});

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