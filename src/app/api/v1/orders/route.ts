import connectDB from "@/config/db";
import { createPublicHandler, createAuthHandler, createModeratorHandler } from "@/server/common/apiWrapper";
import { errorResponse, successResponse } from "@/server/common/response";
import { Order } from "@/server/models/Order.model";
import { notificationService } from "@/services/notificationService";

type GetQuery = {
  trackId?: string;
  priority?: string;
  orderType?: string;
  from?: string;
  to?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
};

function validateAndFixItems(items: any[]): {
  valid: boolean;
  message?: string;
} {
  if (!Array.isArray(items))
    return { valid: false, message: "parcel.item must be an array" };

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it || typeof it !== "object")
      return { valid: false, message: `parcel.item[${i}] invalid` };

    if (!it.name || typeof it.name !== "string" || !it.name.trim()) {
      return { valid: false, message: `parcel.item[${i}].name is required` };
    }

    if (
      it.quantity == null ||
      Number.isNaN(Number(it.quantity)) ||
      Number(it.quantity) <= 0
    ) {
      return {
        valid: false,
        message: `parcel.item[${i}].quantity must be a positive number`,
      };
    }

    if (
      it.unitPrice == null ||
      Number.isNaN(Number(it.unitPrice)) ||
      Number(it.unitPrice) < 0
    ) {
      return {
        valid: false,
        message: `parcel.item[${i}].unitPrice must be a non-negative number`,
      };
    }

    // Ensure totalPrice exists and is correct
    const qty = Number(it.quantity);
    const unit = Number(it.unitPrice);
    const computed = qty * unit;
    if (it.totalPrice == null || Number(it.totalPrice) !== computed) {
      it.totalPrice = computed;
    }
  }

  return { valid: true };
}

// GET: Everyone can view orders, but filtered by role
export const GET = createAuthHandler(async ({ req, user }) => {
  try {
    await connectDB();

    const url = new URL(req.url);
    const q: GetQuery = Object.fromEntries(url.searchParams.entries());

    const page = Math.max(1, parseInt(q.page || "1", 10));
    const limit = Math.max(1, Math.min(200, parseInt(q.limit || "10", 10)));
    const skip = (page - 1) * limit;

    // Build query - users can only see their own orders unless admin/moderator
    const query: any = {};
    
    // Role-based filtering
    if (user?.role === "user") {
      // Regular users can only see orders they created or where they're the sender
      query.$or = [
        { "parcel.sender.phone": user.phone },
        { "parcel.sender.email": user.email }
      ];
    }
    // Admin and moderator can see all orders (no additional filter needed)

    if (q.trackId) {
      const t = q.trackId.trim();
      if (t.includes("*") || t.includes("%")) {
        const pattern = t.replace(/\*/g, ".*").replace(/%/g, ".*");
        query.trackId = { $regex: pattern, $options: "i" };
      } else {
        query.trackId = t;
      }
    }

    if (q.priority) query["parcel.priority"] = q.priority;
    if (q.orderType) query["parcel.orderType"] = q.orderType;

    if (q.createdFrom || q.createdTo) {
      query.createdAt = {};
      if (q.createdFrom) {
        const d = new Date(q.createdFrom);
        if (!isNaN(d.getTime())) query.createdAt.$gte = d;
      }
      if (q.createdTo) {
        const d = new Date(q.createdTo);
        if (!isNaN(d.getTime())) query.createdAt.$lte = d;
      }
      if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
    }

    if (q.search) {
      const s = q.search.trim();
      query.$or = [
        { trackId: { $regex: s, $options: "i" } },
        { "parcel.sender.name": { $regex: s, $options: "i" } },
        { "parcel.receiver.name": { $regex: s, $options: "i" } },
      ];
    }

    // Sorting
    const allowedSortFields = new Set([
      "createdAt",
      "orderDate",
      "trackId",
      "parcel.priority",
    ]);
    const sortBy = allowedSortFields.has(q.sortBy || "")
      ? (q.sortBy as string)
      : "createdAt";
    const sortOrder = (q.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse({
      status: 200,
      message: "Orders fetched successfully",
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        userRole: user?.role || "guest",
        filteredByRole: user?.role === "user",
      },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch orders";
    return errorResponse({ status: 500, message: msg, error, req });
  }
});

// POST: Everyone can create orders (public access with optional auth)
export const POST = createPublicHandler(async ({ req, user }) => {
  try {
    await connectDB();

    const body = (await req.json()) as any;

    // Validate parcel existence
    if (!body || !body.parcel || typeof body.parcel !== "object") {
      return errorResponse({
        status: 400,
        message: "Parcel information is required",
        req,
      });
    }

    const parcel = body.parcel as Record<string, any>;

    // Validate required parcel fields
    if (!parcel.from) {
      return errorResponse({
        status: 400,
        message: "Origin country (parcel.from) is required",
        req,
      });
    }
    if (!parcel.to) {
      return errorResponse({
        status: 400,
        message: "Destination country (parcel.to) is required",
        req,
      });
    }
    if (!parcel.weight && parcel.weight !== 0) {
      return errorResponse({
        status: 400,
        message: "Package weight (parcel.weight) is required",
        req,
      });
    }

    // Validate sender information
    if (!parcel.sender) {
      return errorResponse({
        status: 400,
        message: "Sender information (parcel.sender) is required",
        req,
      });
    }

    if (!parcel.sender.name || !parcel.sender.phone) {
      return errorResponse({
        status: 400,
        message: "Sender name and phone are required",
        req,
      });
    }

    // Add authenticated user info if available, otherwise use provided sender info
    if (user) {
      // If user is authenticated, use their info
      parcel.sender.phone = user.phone;
      parcel.sender.email = user.email;
      if (!parcel.sender.name) {
        parcel.sender.name = user.name;
      }
    } else {
      // For non-authenticated users, validate email format if provided
      if (parcel.sender.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(parcel.sender.email)) {
          return errorResponse({
            status: 400,
            message: "Invalid email format",
            req,
          });
        }
      }
    }

    // Validate receiver information
    if (!parcel.receiver) {
      return errorResponse({
        status: 400,
        message: "Receiver information (parcel.receiver) is required",
        req,
      });
    }

    if (!parcel.receiver.name || !parcel.receiver.phone) {
      return errorResponse({
        status: 400,
        message: "Receiver name and phone are required",
        req,
      });
    }

    // If items provided, validate each
    if (parcel.item) {
      const validation = validateAndFixItems(parcel.item);
      if (!validation.valid) {
        return errorResponse({
          status: 400,
          message: validation.message || "Invalid parcel.item",
          req,
        });
      }
      body.parcel.item = parcel.item;
    }

    // Set default values for optional fields
    if (!parcel.orderType) parcel.orderType = "standard";
    if (!parcel.priority) parcel.priority = "normal";
    if (!parcel.description) parcel.description = "";

    // If payment not provided, create default
    if (!body.payment || typeof body.payment !== "object") {
      body.payment = {
        pType: "cash-on-delivery",
        pAmount: 0,
        pOfferDiscount: 0,
        pExtraCharge: 0,
        pDiscount: 0,
        pReceived: 0,
        pRefunded: 0,
      };
    } else {
      // coerce numeric fields
      const numericFields = [
        "pAmount",
        "pOfferDiscount",
        "pExtraCharge",
        "pDiscount",
        "pReceived",
        "pRefunded",
      ];
      for (const f of numericFields) {
        if (body.payment[f] == null || Number.isNaN(Number(body.payment[f]))) {
          body.payment[f] = 0;
        } else {
          body.payment[f] = Number(body.payment[f]);
        }
      }
      if (!body.payment.pType) body.payment.pType = "cash-on-delivery";
    }

    // set to genaret trackId
    const generateTrackId = () => {
      const prefix = "ZYP";
      const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
      const timestampPart = Date.now().toString().slice(-5);
      return `${prefix}-${randomPart}-${timestampPart}`;
    }
    body.trackId = generateTrackId();
    
    // Ensure trackId is unique (in rare case of collision)
    let exists = await Order.findOne({ trackId: body.trackId }).lean();
    while (exists) {
      body.trackId = generateTrackId();
      exists = await Order.findOne({ trackId: body.trackId }).lean();
    }
    
    body.orderDate = new Date();
    body.handover_by = {
      company: "",
      tracking: "",
      payment: 0,
    };
    

    // Construct order document and save
    const order = new Order(body);
    await order.save();

    // Send order creation notifications (only if user is authenticated)
    if (user) {
      try {
        await notificationService.sendNotification({
          userId: user.id,
          title: "Order Created Successfully",
          message: `Your order ${order.trackId} has been created and will be processed soon.`,
          type: "success",
          category: "order",
          priority: "normal",
          channels: ["inapp", "email"],
          actionUrl: `/dashboard/orders/${order._id}`,
          actionText: "View Order",
          data: {
            orderId: order._id,
            trackId: order.trackId,
            from: parcel.from,
            to: parcel.to,
          },
        });
      } catch (notificationError) {
        console.error("Failed to send order notification:", notificationError);
        // Don't fail order creation if notification fails
      }
    }

    return successResponse({
      status: 201,
      message: "Order created successfully",
      data: {
        ...order.toObject(),
        instructions: user 
          ? "You can track this order in your dashboard"
          : "Please save your tracking ID to track this order later",
        trackingUrl: `/track/${order.trackId}`,
      },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create order";
    return errorResponse({ status: 500, message: msg, error, req });
  }
});