import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { IOffer, Offer } from "@/server/models/Offer.model";
import { User } from "@/server/models/User.model";
import { notificationService } from "@/services/notificationService";
import { NextRequest } from "next/server";

// GET - fetch all offers for a user
export async function GET(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await connectDB();
    const { phone } = params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const offers = await Offer.find({ isActive: true }).sort({ validFrom: -1 });

    return successResponse({ status: 200, message: "Offers fetched", data: offers, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch offers";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// POST - create a new offer
export async function POST(req: NextRequest, { params }: { params: { phone: string } }) {
  try {
    await connectDB();
    const { phone } = params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const body: Partial<IOffer> = await req.json();

    const newOffer = new Offer({
      ...body,
      createdBy: user._id,
    });

    await newOffer.save();

    // Send notification
    await notificationService.sendNotification(
      { phone: user.phone, email: user.email, name: user.name },
      "offer_notification",
      { addressId: null, label: undefined, addressLine: "N/A" },
      {
        title: "New Offer Added",
        message: `A new offer "${newOffer.name}" has been created successfully.`,
        type: "success",
        category: "marketing",
        data: { offerId: newOffer._id, name: newOffer.name },
        channels: ["email", "inapp"]
      }
    ).catch(err => console.error("Offer creation notification failed:", err));

    return successResponse({ status: 201, message: "Offer created", data: newOffer, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create offer";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// PUT - update an existing offer
export async function PUT(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await connectDB();
    const { phone, id } = params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const body: Partial<IOffer> = await req.json();

    const updatedOffer = await Offer.findOneAndUpdate(
      { _id: id },
      { $set: body },
      { new: true }
    );

    if (!updatedOffer) return errorResponse({ status: 404, message: "Offer not found", req });

    // Send notification
    await notificationService.sendNotification(
      { phone: user.phone, email: user.email, name: user.name },
      "offer_notification",
      { addressId: null, label: undefined, addressLine: "N/A" },
      {
        title: "Offer Updated",
        message: `The offer "${updatedOffer.name}" has been updated successfully.`,
        type: "info",
        category: "marketing",
        data: { offerId: updatedOffer._id, name: updatedOffer.name },
        channels: ["email", "inapp"]
      }
    ).catch(err => console.error("Offer update notification failed:", err));

    return successResponse({ status: 200, message: "Offer updated", data: updatedOffer, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update offer";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// DELETE - soft delete an offer (mark inactive)
export async function DELETE(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await connectDB();
    const { phone, id } = params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const deletedOffer = await Offer.findOneAndUpdate(
      { _id: id },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!deletedOffer) return errorResponse({ status: 404, message: "Offer not found", req });

    // Send notification
    await notificationService.sendNotification(
      { phone: user.phone, email: user.email, name: user.name },
      "offer_notification",
      { addressId: null, label: undefined, addressLine: "N/A" },
      {
        title: "Offer Deleted",
        message: `The offer "${deletedOffer.name}" has been deleted.`,
        type: "warning",
        category: "marketing",
        data: { offerId: deletedOffer._id, name: deletedOffer.name },
        channels: ["email", "inapp"]
      }
    ).catch(err => console.error("Offer delete notification failed:", err));

    return successResponse({ status: 200, message: "Offer deleted", data: deletedOffer, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete offer";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
