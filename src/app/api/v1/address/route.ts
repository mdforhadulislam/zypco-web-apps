import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Address } from "@/server/models/Address.model";
import { User } from "@/server/models/User.model";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// GET all addresses (with optional query userId / phone)
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    

    const addresses = await Address.find()
      .populate("user")
      .populate("country")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({
      status: 200,
      message: "Addresses fetched",
      data: addresses,
      req,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch addresses";
    return errorResponse({ status: 500, message: msg, error: err, req });
  }
}

// POST create new address for a user
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();

    const body = await req.json();
    if (!body.userId) {
      return errorResponse({ status: 400, message: "userId is required", req });
    }

    if (!Types.ObjectId.isValid(body.userId)) {
      return errorResponse({ status: 400, message: "Invalid userId", req });
    }

    const user = await User.findById(body.userId);
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const address = new Address({
      user: user._id,
      name: body.name,
      label: body.label || "Home",
      addressLine: body.addressLine,
      city: body.city,
      state: body.state || "",
      zipCode: body.zipCode || "",
      country: new Types.ObjectId(body.country),
      phone: body.phone || "",
      isDefault: body.isDefault || false,
      location: body.location
        ? { type: "Point", coordinates: body.location.coordinates ? body.location.coordinates : [0, 0] }
        : undefined,
    });

    await address.save();

    return successResponse({ status: 200, message: "Address created", data: address, req });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create address";
    return errorResponse({ status: 500, message: msg, error: err, req });
  }
}
