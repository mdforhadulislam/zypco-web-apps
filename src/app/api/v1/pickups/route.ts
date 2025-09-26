import connectDB from "@/config/db";
import { createPublicHandler, createAuthHandler, createModeratorHandler } from "@/server/common/apiWrapper";
import { successResponse, errorResponse } from "@/server/common/response";
import { Pickup } from "@/server/models/Pickup.model";
import { User } from "@/server/models/User.model";
import { Address } from "@/server/models/Address.model";
import { Types } from "mongoose";

type GetQuery = {
  status?: string;
  user?: string;
  moderator?: string;
  preferredDateFrom?: string;
  preferredDateTo?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
};

// GET: Everyone can view pickups, but filtered by role
export const GET = createAuthHandler(async ({ req, user }) => {
  try {
    await connectDB();

    const url = new URL(req.url);
    const q: GetQuery = Object.fromEntries(url.searchParams.entries());

    const page = Math.max(1, parseInt(q.page || "1", 10));
    const limit = Math.max(1, Math.min(200, parseInt(q.limit || "10", 10)));
    const skip = (page - 1) * limit;

    const query: any = {};

    // Role-based filtering
    if (user?.role === "user") {
      // Users can only see their own pickups
      query.user = new Types.ObjectId(user.id);
    }
    // Admin and moderator can see all pickups

    // Apply additional filters
    if (q.status) query.status = q.status;
    if (q.user && Types.ObjectId.isValid(q.user)) {
      if (user?.role !== "user") {
        // Only admin/moderator can filter by other users
        query.user = new Types.ObjectId(q.user);
      }
    }
    if (q.moderator && Types.ObjectId.isValid(q.moderator)) {
      query.moderator = new Types.ObjectId(q.moderator);
    }

    if (q.preferredDateFrom || q.preferredDateTo) {
      query.preferredDate = {};
      if (q.preferredDateFrom) {
        const d = new Date(q.preferredDateFrom);
        if (!isNaN(d.getTime())) query.preferredDate.$gte = d;
      }
      if (q.preferredDateTo) {
        const d = new Date(q.preferredDateTo);
        if (!isNaN(d.getTime())) query.preferredDate.$lte = d;
      }
      if (Object.keys(query.preferredDate).length === 0) delete query.preferredDate;
    }

    // Sorting
    const allowedSortFields = new Set([
      "createdAt",
      "preferredDate", 
      "status",
      "cost",
    ]);
    const sortBy = allowedSortFields.has(q.sortBy || "")
      ? (q.sortBy as string)
      : "preferredDate";
    const sortOrder = (q.sortOrder || "asc").toLowerCase() === "desc" ? -1 : 1;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder;

    const total = await Pickup.countDocuments(query);
    const pickups = await Pickup.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .populate("user", "name email phone")
      .populate("moderator", "name email")
      .populate("address")
      .lean();

    return successResponse({
      status: 200,
      message: "Pickups fetched successfully",
      data: pickups,
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
    const msg = error instanceof Error ? error.message : "Failed to fetch pickups";
    return errorResponse({ status: 500, message: msg, error, req });
  }
});

// POST: Everyone can create pickup requests (public access with optional auth)
export const POST = createPublicHandler(async ({ req, user }) => {
  try {
    await connectDB();

    const body = await req.json() as any;

    // Validate required fields
    if (!body.preferredDate) {
      return errorResponse({ 
        status: 400, 
        message: "Preferred pickup date is required", 
        req 
      });
    }

    // Validate preferred date is in the future
    const preferredDate = new Date(body.preferredDate);
    if (isNaN(preferredDate.getTime())) {
      return errorResponse({ 
        status: 400, 
        message: "Invalid preferred date format", 
        req 
      });
    }

    const now = new Date();
    if (preferredDate < now) {
      return errorResponse({ 
        status: 400, 
        message: "Preferred date must be in the future", 
        req 
      });
    }

    let userId: string;
    let addressId: string;

    if (user) {
      // Authenticated user
      userId = user.id;
      
      if (body.address && Types.ObjectId.isValid(body.address)) {
        // Verify address belongs to user or create new one
        const existingAddress = await Address.findOne({
          _id: new Types.ObjectId(body.address),
          user: new Types.ObjectId(user.id)
        });
        
        if (!existingAddress) {
          return errorResponse({
            status: 400,
            message: "Address not found or doesn't belong to you",
            req,
          });
        }
        addressId = body.address;
      } else {
        return errorResponse({
          status: 400,
          message: "Address ID is required for authenticated users",
          req,
        });
      }
    } else {
      // Non-authenticated user - need to create user and address
      if (!body.contactInfo || !body.contactInfo.name || !body.contactInfo.phone) {
        return errorResponse({
          status: 400,
          message: "Contact information (name and phone) is required for guest users",
          req,
        });
      }

      if (!body.pickupAddress) {
        return errorResponse({
          status: 400,
          message: "Pickup address details are required for guest users",
          req,
        });
      }

      // Create or find user by phone
      let guestUser = await User.findOne({ phone: body.contactInfo.phone });
      
      if (!guestUser) {
        guestUser = new User({
          name: body.contactInfo.name,
          phone: body.contactInfo.phone,
          email: body.contactInfo.email || "",
          role: "user",
          isActive: true,
          isVerified: false,
          // Generate a temporary password - user will need to complete registration later
          password: Math.random().toString(36).slice(-8),
        });
        await guestUser.save();
      }

      userId = guestUser._id.toString();

      // Create address
      const newAddress = new Address({
        user: guestUser._id,
        name: body.pickupAddress.name || "Pickup Address",
        street: body.pickupAddress.street || "",
        city: body.pickupAddress.city || "",
        state: body.pickupAddress.state || "",
        country: body.pickupAddress.country || "",
        zipCode: body.pickupAddress.zipCode || "",
        phone: body.contactInfo.phone,
        email: body.contactInfo.email || "",
        isDefault: true,
        type: "pickup",
      });
      
      await newAddress.save();
      addressId = newAddress._id.toString();
    }

    // Create pickup request
    const pickup = new Pickup({
      user: new Types.ObjectId(userId),
      address: new Types.ObjectId(addressId),
      preferredDate: preferredDate,
      preferredTimeSlot: body.preferredTimeSlot || "",
      status: "pending",
      notes: body.notes || "",
      cost: 0, // Default cost, will be calculated by admin/moderator
      specialInstructions: body.specialInstructions || "",
      packageDetails: body.packageDetails || {},
    });

    await pickup.save();

    // Populate for response
    const populatedPickup = await Pickup.findById(pickup._id)
      .populate("user", "name email phone")
      .populate("address")
      .lean();

    return successResponse({
      status: 201,
      message: "Pickup request created successfully",
      data: {
        ...populatedPickup,
        instructions: user 
          ? "Your pickup request has been submitted. You'll receive updates in your dashboard."
          : "Your pickup request has been submitted. Please save your pickup ID for future reference.",
        estimatedProcessingTime: "24-48 hours",
      },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create pickup request";
    return errorResponse({ status: 500, message: msg, error, req });
  }
});