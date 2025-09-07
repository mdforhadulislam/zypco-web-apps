import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import { User } from "@/server/models/User.model";
import { Address, IAddress } from "@/server/models/Address.model";
import { successResponse, errorResponse } from "@/server/common/response"; 
import { Types } from "mongoose";
import { notificationService } from "@/services/notificationService";

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

// Helper to send notifications
async function sendAddressNotification(user: any, event: string, addressData: any, options: any) {
  try {
    await notificationService.sendNotification(
      { phone: user.phone, email: user.email },
      event,
      addressData,
      options
    );
  } catch (err) {
    console.error(`Notification for ${event} failed:`, err);
  }
}

// GET - fetch specific address by ID
export async function GET(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await connectDB();
    const { phone, id } = params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const address = await Address.findOne({ _id: id, user: user._id, isDeleted: false });
    if (!address) return errorResponse({ status: 404, message: "Address not found", req });

    return successResponse({ status: 200, message: "Address fetched", data: address, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch address";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// PUT - update specific address
export async function PUT(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await connectDB();
    const { phone, id } = params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const body: Partial<AddressBody> = await req.json();
    const updateData: Partial<IAddress> = { ...body };
    if (body.country) updateData.country = new Types.ObjectId(body.country);
    if (body.location) updateData.location = { type: "Point", coordinates: body.location.coordinates };

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, user: user._id, isDeleted: false },
      { $set: updateData },
      { new: true }
    );
    if (!updatedAddress) return errorResponse({ status: 404, message: "Address not found", req });

    await sendAddressNotification(
      user,
      "address_updated",
      { addressId: updatedAddress._id, label: updatedAddress.label, addressLine: updatedAddress.addressLine },
      { title: "Address Updated", message: `Address "${updatedAddress.label}" has been updated successfully.`, type: "info", category: "account", channels: ["email", "inapp"] }
    );

    return successResponse({ status: 200, message: "Address updated", data: updatedAddress, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update address";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// DELETE - soft delete address
export async function DELETE(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await connectDB();
    const { phone, id } = params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const deletedAddress = await Address.findOneAndUpdate(
      { _id: id, user: user._id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!deletedAddress) return errorResponse({ status: 404, message: "Address not found", req });

    await sendAddressNotification(
      user,
      "address_deleted",
      { addressId: deletedAddress._id, label: deletedAddress.label, addressLine: deletedAddress.addressLine },
      { title: "Address Deleted", message: `Address "${deletedAddress.label}" has been deleted successfully.`, type: "warning", category: "account", channels: ["email", "inapp"] }
    );

    return successResponse({ status: 200, message: "Address deleted", data: deletedAddress, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete address";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}