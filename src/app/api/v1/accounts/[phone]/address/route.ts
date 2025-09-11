import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Address, IAddress } from "@/server/models/Address.model";
import { User } from "@/server/models/User.model";
import { notificationService } from "@/services/notificationService";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

interface AddressBody {
  name: string;
  label?: string;
  addressLine: string;
  area?: string;
  subCity?: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string; // Country ObjectId string
  phone?: string;
  isDefault?: boolean;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
}

// GET - fetch all addresses for a user
export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await connectDB();
    const { phone } = params;
    const user = await User.findOne({ phone });
    if (!user)
      return errorResponse({ status: 404, message: "User not found", req });

    const addresses = await Address.find({
      user: user._id,
      isDeleted: false,
    }).sort({ isDefault: -1, createdAt: -1 });
    return successResponse({
      status: 200,
      message: "Addresses fetched",
      data: addresses,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch addresses";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// POST - create new address
export async function POST(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await connectDB();
    const { phone } = params;
    const user = await User.findOne({ phone });
    if (!user)
      return errorResponse({ status: 404, message: "User not found", req });

    const body: AddressBody = await req.json();
    const newAddress = new Address({
      user: user._id,
      name: body.name,
      label: body.label || "Home",
      addressLine: body.addressLine,
      area: body.area || "",
      subCity: body.subCity || "",
      city: body.city,
      state: body.state || "",
      zipCode: body.zipCode || "",
      country: new Types.ObjectId(body.country),
      phone: body.phone || "",
      isDefault: body.isDefault || false,
      location: body.location
        ? { type: "Point", coordinates: body.location.coordinates }
        : undefined,
    });
    await newAddress.save();

    // Send notification
    await notificationService
      .sendNotification(
        { phone: user.phone, email: user.email },
        "address_added",
        {
          addressId: newAddress._id,
          label: newAddress.label,
          addressLine: newAddress.addressLine,
        },
        {
          title: "Address Added",
          message: `New address "${newAddress.label}" has been added successfully.`,
          type: "success",
          category: "account",
          channels: ["email", "inapp"],
        }
      )
      .catch((err) => console.error("Address notification failed:", err));

    return successResponse({
      status: 201,
      message: "Address created",
      data: newAddress,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to create address";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// PUT - update existing address
export async function PUT(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await connectDB();
    const { phone } = params;
    const user = await User.findOne({ phone });
    if (!user)
      return errorResponse({ status: 404, message: "User not found", req });

    const body: Partial<AddressBody> & { addressId: string } = await req.json();
    if (!body.addressId)
      return errorResponse({
        status: 400,
        message: "Address ID required",
        req,
      });
      
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    const updateData: Partial<IAddress> & {
      country?: Types.ObjectId;
      location?: { type: "Point"; coordinates: [number, number] };
    } = { ...body };
    if (body.country) updateData.country = new Types.ObjectId(body.country);
    if (body.location)
      updateData.location = {
        type: "Point",
        coordinates: body.location.coordinates,
      };

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: body.addressId, user: user._id, isDeleted: false },
      { $set: updateData },
      { new: true }
    );

    if (!updatedAddress)
      return errorResponse({ status: 404, message: "Address not found", req });

    // Send notification
    await notificationService
      .sendNotification(
        { phone: user.phone, email: user.email },
        "address_updated",
        {
          addressId: updatedAddress._id,
          label: updatedAddress.label,
          addressLine: updatedAddress.addressLine,
        },
        {
          title: "Address Updated",
          message: `Address "${updatedAddress.label}" has been updated successfully.`,
          type: "info",
          category: "account",
          channels: ["email", "inapp"],
        }
      )
      .catch((err) =>
        console.error("Address update notification failed:", err)
      );

    return successResponse({
      status: 200,
      message: "Address updated",
      data: updatedAddress,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to update address";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// DELETE - soft delete address
export async function DELETE(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await connectDB();
    const { phone } = params;
    const user = await User.findOne({ phone });
    if (!user)
      return errorResponse({ status: 404, message: "User not found", req });

    const body: { addressId: string } = await req.json();
    if (!body.addressId)
      return errorResponse({
        status: 400,
        message: "Address ID required",
        req,
      });

    const deletedAddress = await Address.findOneAndUpdate(
      { _id: body.addressId, user: user._id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!deletedAddress)
      return errorResponse({ status: 404, message: "Address not found", req });

    // Send notification
    await notificationService
      .sendNotification(
        { phone: user.phone, email: user.email },
        "address_deleted",
        {
          addressId: deletedAddress._id,
          label: deletedAddress.label,
          addressLine: deletedAddress.addressLine,
        },
        {
          title: "Address Deleted",
          message: `Address "${deletedAddress.label}" has been deleted successfully.`,
          type: "warning",
          category: "account",
          channels: ["email", "inapp"],
        }
      )
      .catch((err) =>
        console.error("Address delete notification failed:", err)
      );

    return successResponse({
      status: 200,
      message: "Address deleted",
      data: deletedAddress,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to delete address";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
