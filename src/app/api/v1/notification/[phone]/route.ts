import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/server/models/Notification.model";
import { User } from "@/server/models/User.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler, extractPaginationParams, extractFilterParams, createPaginatedResponse } from "@/lib/utils/apiHelpers";
import { AuthMiddleware } from "@/lib/middleware/auth";

// Get user notifications
export const GET = createApiHandler({
  auth: { required: true },
  rateLimit: 'general'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const phone = params?.phone;
    
    if (!phone) {
      return errorResponse({
        req,
        status: 400,
        message: "Phone number is required"
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

    const { searchParams } = new URL(req.url);
    const { page, limit, offset, sort, order } = extractPaginationParams(searchParams);
    
    // Build query
    let query: any = { user: user._id };
    
    // Apply filters
    const allowedFilters = ['read', 'type', 'priority', 'category'];
    const filters = extractFilterParams(searchParams, allowedFilters);
    Object.assign(query, filters);

    // Date range filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (startDate || endDate) {
      query.sentAt = {};
      if (startDate) query.sentAt.$gte = new Date(startDate);
      if (endDate) query.sentAt.$lte = new Date(endDate);
    }

    // Get total count
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ ...query, read: false });

    // Get notifications with pagination
    const sortField = sort === 'newest' ? 'sentAt' : 
                     sort === 'oldest' ? 'sentAt' :
                     sort === 'priority' ? 'priority' : 'sentAt';
    const sortOrder = (sort === 'oldest') ? 1 : -1;

    const notifications = await Notification.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(offset)
      .limit(limit)
      .lean();

    // Transform notifications for response
    const transformedNotifications = notifications.map(notification => ({
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
      sentAt: notification.sentAt,
      readAt: notification.readAt,
      expiresAt: notification.expiresAt
    }));

    // Get summary stats
    const typeDistribution = await Notification.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    const categoryDistribution = await Notification.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const response = createPaginatedResponse({
      items: transformedNotifications,
      total,
      page,
      limit,
      sort,
      order
    });

    // Add summary information
    (response as any).summary = {
      totalNotifications: total,
      unreadCount,
      typeDistribution: typeDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      categoryDistribution: categoryDistribution.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    return successResponse({
      req,
      status: 200,
      message: "Notifications retrieved successfully",
      data: response
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to retrieve notifications",
      error: "An error occurred while fetching notifications"
    });
  }
});

// Mark all notifications as read
export const PUT = createApiHandler({
  auth: { required: true },
  rateLimit: 'general'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const phone = params?.phone;
    
    if (!phone) {
      return errorResponse({
        req,
        status: 400,
        message: "Phone number is required"
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

    // Mark all unread notifications as read
    const result = await Notification.updateMany(
      { user: user._id, read: false },
      { 
        $set: { 
          read: true, 
          readAt: new Date() 
        } 
      }
    );

    return successResponse({
      req,
      status: 200,
      message: "All notifications marked as read",
      data: {
        markedCount: result.modifiedCount,
        unreadCount: 0
      }
    });

  } catch (error) {
    console.error('Mark all read error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to mark notifications as read",
      error: "An error occurred while updating notifications"
    });
  }
});

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}