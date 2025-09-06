import { NextRequest, NextResponse } from "next/server";
import { Order } from "@/server/models/Order.model";
import { User } from "@/server/models/User.model";
import { Country } from "@/server/models/Country.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler, extractPaginationParams, createPaginatedResponse, generateTrackingId } from "@/lib/utils/apiHelpers";
import { orderSchemas, commonSchemas } from "@/lib/middleware/validation";
import { notificationService } from "@/services/notificationService";

// Create Order
export const POST = createApiHandler({
  auth: { required: true },
  validation: { body: orderSchemas.create },
  rateLimit: 'orderCreation'
})(async (req) => {
  try {
    await connectDB();
    
    const orderData = req.validatedData!.body;
    const userId = req.user!.id;

    // Validate countries exist and shipping is available
    const fromCountry = await Country.findById(orderData.parcel.from);
    const toCountry = await Country.findById(orderData.parcel.to);

    if (!fromCountry || !toCountry) {
      return errorResponse({
        req,
        status: 404,
        message: "Invalid country selection",
        error: "One or more selected countries are not available"
      });
    }

    // Check if service is available for this route
    const serviceAvailable = await checkServiceAvailability(
      orderData.parcel.serviceType,
      fromCountry.code,
      toCountry.code
    );

    if (!serviceAvailable) {
      return errorResponse({
        req,
        status: 422,
        message: "Service not available",
        error: `${orderData.parcel.serviceType} is not available for this route`
      });
    }

    // Calculate total weight and volume
    const totalVolume = orderData.parcel.box.reduce((total: number, box: any) => 
      total + (box.length * box.width * box.height), 0
    );

    // Generate tracking ID
    const trackId = generateTrackingId();

    // Calculate estimated pricing (you would integrate with actual pricing service)
    const estimatedPrice = await calculateShippingPrice(orderData);

    // Create order
    const order = new Order({
      user: userId,
      trackId,
      status: "created",
      parcel: {
        ...orderData.parcel,
        totalVolume,
        estimatedPrice
      },
      payment: {
        ...orderData.payment,
        status: "pending",
        currency: "USD" // Default currency
      },
      orderDate: new Date(),
      estimatedDelivery: calculateEstimatedDelivery(orderData.parcel.priority),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await order.save();

    // Create tracking record
    const { Track } = await import("@/server/models/Track.model");
    const trackingRecord = new Track({
      order: order._id,
      trackId: order.trackId,
      currentStatus: "created",
      history: [{
        status: "created",
        location: {
          city: orderData.parcel.sender.address.city,
          country: fromCountry.name
        },
        description: "Order created and payment pending",
        timestamp: new Date()
      }],
      estimatedDelivery: order.estimatedDelivery
    });

    await trackingRecord.save();

    // Send order confirmation notifications
    await notificationService.sendOrderNotification({
      orderId: order._id.toString(),
      trackId: order.trackId,
      status: "created",
      senderPhone: orderData.parcel.sender.phone,
      receiverPhone: orderData.parcel.receiver.phone,
      senderEmail: orderData.parcel.sender.email,
      receiverEmail: orderData.parcel.receiver.email
    }, "created");

    // Log order creation
    console.log(`New order created: ${trackId} by user ${userId}`);

    return successResponse({
      req,
      status: 201,
      message: "Order created successfully",
      data: {
        order: {
          id: order._id,
          trackId: order.trackId,
          status: order.status,
          orderDate: order.orderDate,
          estimatedDelivery: order.estimatedDelivery,
          parcel: {
            from: fromCountry.name,
            to: toCountry.name,
            serviceType: order.parcel.serviceType,
            priority: order.parcel.priority,
            weight: order.parcel.weight,
            totalItems: order.parcel.item.length,
            totalVolume
          },
          payment: {
            type: order.payment.pType,
            amount: order.payment.pAmount,
            finalAmount: order.payment.pReceived,
            status: order.payment.status
          }
        }
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Order creation failed",
      error: "An error occurred while creating the order"
    });
  }
});

// Get Orders (Admin only for all orders, users get their own)
export const GET = createApiHandler({
  auth: { required: true },
  rateLimit: 'general'
})(async (req) => {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const { page, limit, offset, sort, order } = extractPaginationParams(searchParams);
    
    const user = req.user!;
    let query: any = {};

    // If not admin, only show user's own orders
    if (!['admin', 'super_admin'].includes(user.role)) {
      const userDoc = await User.findOne({ phone: user.phone });
      if (!userDoc) {
        return errorResponse({
          req,
          status: 404,
          message: "User not found"
        });
      }
      query.user = userDoc._id;
    }

    // Apply filters
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const serviceType = searchParams.get('serviceType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (status) query.status = status;
    if (priority) query['parcel.priority'] = priority;
    if (serviceType) query['parcel.serviceType'] = serviceType;

    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    // Get total count
    const total = await Order.countDocuments(query);

    // Get orders with pagination
    const sortField = sort === 'amount' ? 'payment.pAmount' : sort;
    const sortOrder = order === 'asc' ? 1 : -1;

    const orders = await Order.find(query)
      .populate('user', 'name phone email')
      .populate('parcel.from', 'name code flag')
      .populate('parcel.to', 'name code flag')
      .sort({ [sortField]: sortOrder })
      .skip(offset)
      .limit(limit)
      .lean();

    // Transform orders for response
    const transformedOrders = orders.map(order => ({
      id: order._id,
      trackId: order.trackId,
      status: order.status,
      orderDate: order.orderDate,
      priority: order.parcel.priority,
      serviceType: order.parcel.serviceType,
      route: {
        from: order.parcel.from?.name || 'Unknown',
        to: order.parcel.to?.name || 'Unknown'
      },
      payment: {
        amount: order.payment.pReceived,
        status: order.payment.status,
        type: order.payment.pType
      },
      user: user.role === 'admin' ? {
        name: order.user?.name,
        phone: order.user?.phone
      } : undefined,
      estimatedDelivery: order.estimatedDelivery,
      deliveryDate: order.deliveryDate
    }));

    const response = createPaginatedResponse({
      items: transformedOrders,
      total,
      page,
      limit,
      sort,
      order
    });

    return successResponse({
      req,
      status: 200,
      message: "Orders retrieved successfully",
      data: response
    });

  } catch (error) {
    console.error('Get orders error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Failed to retrieve orders",
      error: "An error occurred while fetching orders"
    });
  }
});

/**
 * Check service availability for route
 */
async function checkServiceAvailability(
  serviceType: string,
  fromCountryCode: string,
  toCountryCode: string
): Promise<boolean> {
  // This would integrate with actual service provider APIs
  // For now, we'll do basic validation
  
  const serviceRoutes = {
    "DHL Express": ["BD", "US", "UK", "CA", "AU", "DE", "FR", "IT", "ES"],
    "FedEx": ["BD", "US", "UK", "CA", "AU", "DE", "FR"],
    "UPS": ["BD", "US", "UK", "CA", "AU"],
    "Aramex": ["BD", "AE", "SA", "KW", "QA", "BH", "OM"]
  };

  const allowedCountries = serviceRoutes[serviceType as keyof typeof serviceRoutes] || [];
  
  return allowedCountries.includes(fromCountryCode) && allowedCountries.includes(toCountryCode);
}

/**
 * Calculate shipping price (placeholder)
 */
async function calculateShippingPrice(orderData: any): Promise<number> {
  // This would integrate with actual pricing APIs
  // Basic calculation based on weight, distance, and service type
  
  const baseRates = {
    "DHL Express": 25,
    "FedEx": 22,
    "UPS": 20,
    "Aramex": 18
  };

  const priorityMultipliers = {
    "normal": 1,
    "express": 1.5,
    "super-express": 2,
    "tax-paid": 1.8
  };

  const weightInKg = parseFloat(orderData.parcel.weight.replace(/[^\d.]/g, ''));
  const baseRate = baseRates[orderData.parcel.serviceType as keyof typeof baseRates] || 20;
  const priorityMultiplier = priorityMultipliers[orderData.parcel.priority as keyof typeof priorityMultipliers] || 1;
  
  return Math.round(baseRate * weightInKg * priorityMultiplier);
}

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

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}