// app/api/v1/auth/address/route.ts
import connectDB from "@/config/db";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { Address } from "@/server/models/Address.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const {
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

    // Create new address
    const newAddress = new Address({
      user: user._id,
      name,
      label: label || "Home",
      addressLine,
      area: area || "",
      subCity: subCity || "",
      city,
      state: state || "",
      zipCode: zipCode || "",
      country: new Types.ObjectId(country),
      phone: phone || "",
      isDefault: !!isDefault,
      location: {
        type: "Point",
        coordinates: [parseFloat(body.longitude), parseFloat(body.latitude)],
      },
    });

    await newAddress.save();

    return successResponse({
      status: 201,
      message: "Address created successfully",
      data: { address: newAddress },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}

export async function GET(req: NextRequest) {
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

    // Fetch all addresses for the user
    const addresses = await Address.find({ user: user._id }).sort({
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
