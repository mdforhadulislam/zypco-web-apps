import connectDB from "@/config/db";
import { createAuthHandler, createModeratorHandler, createAdminHandler } from "@/server/common/apiWrapper";
import { errorResponse, successResponse } from "@/server/common/response";
import { Pickup } from "@/server/models/Pickup.model";
import { Types } from "mongoose";

// GET: Users can view their own pickups, Admin/Moderator can view all
export const GET = createAuthHandler(async ({ req, user }) => {
  try {
    await connectDB();

    const url = new URL(req.url);
    const pickupId = url.pathname.split('/').pop();

    if (!pickupId || !Types.ObjectId.isValid(pickupId)) {
      return errorResponse({
        status: 400,
        message: "Invalid pickup ID",
        req,
      });
    }

    // Build query based on user role
    const query: any = { _id: new Types.ObjectId(pickupId) };
    
    // Users can only see their own pickups
    if (user?.role === "user") {
      query.user = new Types.ObjectId(user.id);
    }
    // Admin and moderator can see all pickups

    const pickup = await Pickup.findOne(query)
      .populate("user", "name email phone")
      .populate("moderator", "name email")
      .populate("address")
      .lean();

    if (!pickup) {
      return errorResponse({
        status: 404,
        message: "Pickup not found or access denied",
        req,
      });
    }

    return successResponse({
      status: 200,
      message: "Pickup fetched successfully",
      data: pickup,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch pickup";
    return errorResponse({ status: 500, message: msg, error, req });
  }
});

// PUT: Users can update their own pickups (limited fields), Moderators can update any pickup
export const PUT = createAuthHandler(async ({ req, user }) => {
  try {
    await connectDB();

    const url = new URL(req.url);
    const pickupId = url.pathname.split('/').pop();

    if (!pickupId || !Types.ObjectId.isValid(pickupId)) {
      return errorResponse({
        status: 400,
        message: "Invalid pickup ID",
        req,
      });
    }

    const body = await req.json();

    // Build query based on user role
    const query: any = { _id: new Types.ObjectId(pickupId) };
    
    // Users can only update their own pickups
    if (user?.role === "user") {
      query.user = new Types.ObjectId(user.id);
    }
    // Admin and moderator can update any pickup

    const existingPickup = await Pickup.findOne(query);

    if (!existingPickup) {
      return errorResponse({
        status: 404,
        message: "Pickup not found or access denied",
        req,
      });
    }

    // Check if pickup can still be updated
    if (user?.role === "user" && existingPickup.status === "completed") {
      return errorResponse({
        status: 400,
        message: "Cannot update completed pickup",
        req,
      });
    }

    // Restrict what users can update vs admin/moderator
    let allowedUpdates: any = {};

    if (user?.role === "user") {
      // Users can only update limited fields and only if pickup is pending/scheduled
      if (!["pending", "scheduled"].includes(existingPickup.status)) {
        return errorResponse({
          status: 400,
          message: `Cannot update pickup with status: ${existingPickup.status}`,
          req,
        });
      }

      const userAllowedFields = [
        "preferredDate",
        "preferredTimeSlot", 
        "notes",
        "specialInstructions",
        "packageDetails"
      ];
      
      for (const field of userAllowedFields) {
        if (body[field] !== undefined) {
          allowedUpdates[field] = body[field];
        }
      }

      // Validate preferred date if being updated
      if (allowedUpdates.preferredDate) {
        const preferredDate = new Date(allowedUpdates.preferredDate);
        if (isNaN(preferredDate.getTime())) {
          return errorResponse({
            status: 400,
            message: "Invalid preferred date format",
            req,
          });
        }
        
        if (preferredDate < new Date()) {
          return errorResponse({
            status: 400,
            message: "Preferred date must be in the future",
            req,
          });
        }
      }
    } else {
      // Admin/Moderator can update most fields except system-generated ones
      const restrictedFields = ["_id", "createdAt", "user"];
      allowedUpdates = { ...body };
      
      for (const field of restrictedFields) {
        delete allowedUpdates[field];
      }

      // Set moderator info if status is being updated
      if (allowedUpdates.status && allowedUpdates.status !== existingPickup.status) {
        allowedUpdates.moderator = new Types.ObjectId(user.id);
        allowedUpdates.statusUpdatedAt = new Date();
      }
    }

    // Update the pickup
    const updatedPickup = await Pickup.findOneAndUpdate(
      query,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    )
    .populate("user", "name email phone")
    .populate("moderator", "name email")
    .populate("address")
    .lean();

    return successResponse({
      status: 200,
      message: "Pickup updated successfully",
      data: updatedPickup,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update pickup";
    return errorResponse({ status: 500, message: msg, error, req });
  }
});

// DELETE: Only Admin can delete pickups
export const DELETE = createAdminHandler(async ({ req, user }) => {
  try {
    await connectDB();

    const url = new URL(req.url);
    const pickupId = url.pathname.split('/').pop();

    if (!pickupId || !Types.ObjectId.isValid(pickupId)) {
      return errorResponse({
        status: 400,
        message: "Invalid pickup ID",
        req,
      });
    }

    const deletedPickup = await Pickup.findByIdAndDelete(pickupId)
      .populate("user", "name email phone")
      .lean();

    if (!deletedPickup) {
      return errorResponse({
        status: 404,
        message: "Pickup not found",
        req,
      });
    }

    return successResponse({
      status: 200,
      message: "Pickup deleted successfully",
      data: {
        deletedPickupId: pickupId,
        userInfo: deletedPickup.user,
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
    const msg = error instanceof Error ? error.message : "Failed to delete pickup";
    return errorResponse({ status: 500, message: msg, error, req });
  }
});