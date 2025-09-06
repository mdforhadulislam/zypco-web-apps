import { NextRequest, NextResponse } from "next/server";
import { Track } from "@/server/models/Track.model";
import { Order } from "@/server/models/Order.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler } from "@/lib/utils/apiHelpers";

// Track shipment by ID (Public endpoint)
export const GET = createApiHandler({
  auth: { required: false },
  rateLimit: 'public'
})(async (req, { params }) => {
  try {
    await connectDB();
    
    const trackId = params?.trackId;

    if (!trackId) {
      return errorResponse({
        req,
        status: 400,
        message: "Tracking ID is required",
        error: "Please provide a valid tracking ID"
      });
    }

    // Validate tracking ID format (ZYP + YYMMDD + sequence)
    if (!/^ZYP\d{8}$/.test(trackId)) {
      return errorResponse({
        req,
        status: 400,
        message: "Invalid tracking ID format",
        error: "Tracking ID must be in format: ZYP + YYMMDD + sequence number"
      });
    }

    // Find tracking record
    const tracking = await Track.findOne({ trackId })
      .populate({
        path: 'order',
        populate: [
          { path: 'parcel.from', select: 'name code' },
          { path: 'parcel.to', select: 'name code' }
        ]
      });

    if (!tracking) {
      return errorResponse({
        req,
        status: 404,
        message: "Tracking ID not found",
        error: `No shipment found with tracking ID: ${trackId}`
      });
    }

    const order = tracking.order;
    
    // Calculate delivery progress
    const totalSteps = ['created', 'picked-up', 'in-transit', 'arrived-at-hub', 'customs-clearance', 'out-for-delivery', 'delivered'];
    const currentStepIndex = totalSteps.indexOf(tracking.currentStatus);
    const progress = currentStepIndex >= 0 ? Math.round((currentStepIndex / (totalSteps.length - 1)) * 100) : 0;

    // Get next milestone
    const nextMilestone = currentStepIndex >= 0 && currentStepIndex < totalSteps.length - 1 
      ? totalSteps[currentStepIndex + 1] 
      : null;

    // Prepare tracking response (sanitized for public access)
    const trackingResponse = {
      trackId: tracking.trackId,
      orderId: order._id,
      currentStatus: tracking.currentStatus,
      lastUpdate: tracking.updatedAt,
      estimatedDelivery: tracking.estimatedDelivery,
      route: {
        from: {
          country: order.parcel.from?.name || 'Unknown',
          city: order.parcel.sender?.address?.city || 'Unknown'
        },
        to: {
          country: order.parcel.to?.name || 'Unknown',
          city: order.parcel.receiver?.address?.city || 'Unknown'
        }
      },
      serviceInfo: {
        carrier: order.parcel.serviceType,
        serviceType: `${order.parcel.serviceType} ${order.parcel.priority}`,
        priority: order.parcel.priority
      },
      currentLocation: getCurrentLocation(tracking.history),
      events: tracking.history.map((event: any) => ({
        timestamp: event.timestamp,
        status: event.status,
        location: event.location,
        description: event.description,
        updatedBy: event.updatedBy ? getPublicUpdaterName(event.updatedBy) : 'System'
      })),
      deliveryProgress: {
        percentage: progress,
        nextMilestone,
        expectedNextUpdate: getExpectedNextUpdate(tracking.currentStatus)
      }
    };

    return successResponse({
      req,
      status: 200,
      message: "Tracking information retrieved successfully",
      data: { tracking: trackingResponse }
    });

  } catch (error) {
    console.error('Tracking error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to retrieve tracking information",
      error: "An error occurred while fetching tracking details"
    });
  }
});

/**
 * Get current location from tracking history
 */
function getCurrentLocation(history: any[]): any {
  if (!history || history.length === 0) return null;
  
  const latestEvent = history[history.length - 1];
  return {
    facility: latestEvent.location?.facility || 'In Transit',
    city: latestEvent.location?.city || 'Unknown',
    country: latestEvent.location?.country || 'Unknown',
    timestamp: latestEvent.timestamp
  };
}

/**
 * Get public-friendly updater name
 */
function getPublicUpdaterName(updatedBy: string): string {
  // Sanitize internal names for public display
  if (updatedBy.includes('admin') || updatedBy.includes('staff')) {
    return 'Staff';
  }
  if (updatedBy.includes('system') || updatedBy.includes('auto')) {
    return 'System';
  }
  return 'Courier Partner';
}

/**
 * Get expected next update time
 */
function getExpectedNextUpdate(currentStatus: string): Date | null {
  const nextUpdateHours = {
    'created': 2,           // Pickup within 2 hours
    'pickup-pending': 4,    // Pickup within 4 hours
    'picked-up': 6,         // Transit update in 6 hours
    'in-transit': 12,       // Hub arrival in 12 hours
    'arrived-at-hub': 24,   // Customs/processing in 24 hours
    'customs-clearance': 6, // Out for delivery in 6 hours
    'out-for-delivery': 8,  // Delivery in 8 hours
  };

  const hours = nextUpdateHours[currentStatus as keyof typeof nextUpdateHours];
  return hours ? new Date(Date.now() + hours * 60 * 60 * 1000) : null;
}

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}