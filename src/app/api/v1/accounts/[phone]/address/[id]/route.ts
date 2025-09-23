import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Address, IAddress } from "@/server/models/Address.model";
import { User } from "@/server/models/User.model";
import { notificationService } from "@/services/notificationService";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

interface AddressBody {
  name?: string;
  label?: string;
  addressLine?: string;
  area?: string;
  subCity?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string; // Country ObjectId string
  phone?: string;
  isDefault?: boolean;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
}

// Helper to send notifications
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendAddressNotification(user: any, event: string, addressData: any, options?: { title?: string; message?: string; type?: string; category?: string; channels?: string[] }) {
  try {
    // Build NotificationData according to your notificationService API
    const notificationPayload = {
      userId: user._id?.toString ? user._id.toString() : undefined,
      phone: user.phone,
      email: user.email,
      title: options?.title || (event === "address_added" ? "Address Added" : event === "address_updated" ? "Address Updated" : "Address Notification"),
      message: options?.message || "",
      type: (options?.type as "info" | "success" | "warning" | "error" | "promo") || "info",
      category: (options?.category as "order" | "account" | "security" | "system" | "marketing") || "account",
      data: addressData,
      channels: options?.channels as ("email" | "sms" | "push" | "inapp")[] || ["inapp", "email"],
    };

    
    
    await notificationService.sendNotification(notificationPayload).catch((e) => {
      // already handled below, but ensure thrown errors don't bubble to user
      console.error("notificationService.sendNotification error:", e);
    });
  } catch (err) {
    console.error(`Notification for ${event} failed:`, err);
  }
}

// GET - fetch specific address by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string; id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone, id } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid address id", req });

    const address = await Address.findOne({ _id: id, user: user._id, isDeleted: false }).populate("user").populate("country").lean();
    if (!address) return errorResponse({ status: 404, message: "Address not found", req });

    return successResponse({ status: 200, message: "Address fetched", data: address, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch address";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// PUT - update specific address
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string; id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone,id } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid address id", req });

    const body = (await req.json()) as AddressBody;

    // Build updateData safely, mapping types correctly
    const updateData: Partial<IAddress> = {};

    if (body.name !== undefined) updateData.name = body.name as string;
    if (body.label !== undefined) updateData.label = body.label as string;
    if (body.addressLine !== undefined) updateData.addressLine = body.addressLine as string;
    if (body.area !== undefined) updateData.area = body.area as string;
    if (body.subCity !== undefined) updateData.subCity = body.subCity as string;
    if (body.city !== undefined) updateData.city = body.city as string;
    if (body.state !== undefined) updateData.state = body.state as string;
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode as string;
    if (body.phone !== undefined) updateData.phone = body.phone as string;
    if ("isDefault" in body) updateData.isDefault = Boolean(body.isDefault);

    if (body.country) {
      // convert to ObjectId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
      updateData.country = new Types.ObjectId(body.country) as unknown as any;
    }

    if (body.location && Array.isArray(body.location.coordinates) && body.location.coordinates.length === 2) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateData.location = { type: "Point", coordinates: body.location.coordinates } as any;
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, user: user._id, isDeleted: false },
      { $set: updateData },
      { new: true }
    );
    if (!updatedAddress) return errorResponse({ status: 404, message: "Address not found", req });

    // async notification, don't block response
    sendAddressNotification(
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
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string; id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone,id } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid address id", req });

    const deletedAddress = await Address.findOneAndUpdate(
      { _id: id, user: user._id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!deletedAddress) return errorResponse({ status: 404, message: "Address not found", req });

    // async notification
    sendAddressNotification(
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
