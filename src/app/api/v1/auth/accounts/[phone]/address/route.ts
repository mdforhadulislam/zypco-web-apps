// app/api/v1/auth/accounts/[phone]/address/route.ts
import connectDB from "@/config/db";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { Address } from "@/server/models/Address.model";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated",
      });
    }

    // Find user by phone
    const targetUser = await User.findOne({ phone: params.phone });
    if (!targetUser) {
      return errorResponse({
        status: 404,
        message: "User not found",
        error: "NotFound",
      });
    }

    // Check permission (own account or admin)
    if (user.role !== "admin" || user.phone !== targetUser.phone) {
      return errorResponse({
        status: 403,
        message: "Forbidden",
        error: "PermissionDenied",
      });
    }

    // Fetch all addresses for the user
    const addresses = await Address.find({ user: targetUser._id }).sort({
      isDefault: -1,
    });

    return successResponse({
      status: 200,
      message: "Addresses fetched successfully",
      data: { addresses },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated",
      });
    }

    const finduserPhone = await User.findOne({ phone: params.phone });
    if (!finduserPhone) {
      return errorResponse({
        status: 404,
        message: "User not found",
        error: "NotFound",
      });
    }

    const body = await req.json();
    const {
      addressId,
      name,
      label,
      addressLine,
      area,
      subCity,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault,
    } = body;

    // Find and update address
    const updatedAddress = await Address.findOneAndUpdate(
      { _id: addressId, user: finduserPhone._id },
      {
        name,
        label,
        addressLine,
        area,
        subCity,
        city,
        state,
        zipCode,
        country,
        phone,
        isDefault,
      },
      { new: true }
    );

    if (!updatedAddress) {
      return errorResponse({
        status: 404,
        message: "Address not found",
        error: "NotFound",
      });
    }

    return successResponse({
      status: 200,
      message: "Address updated successfully",
      data: { address: updatedAddress },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}

 