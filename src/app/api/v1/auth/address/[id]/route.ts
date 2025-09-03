import connectDB from "@/config/db";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { Address } from "@/server/models/Address.model";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    // Find address by ID
    const address = await Address.findById(params.id);
    if (!address) {
      return errorResponse({
        status: 404,
        message: "Address not found",
        error: "NotFound",
      });
    }

    // Check permission (own address or admin)
    if (
      user.role !== "admin" ||
      address.user.toString() !== user._id.toString()
    ) {
      return errorResponse({
        status: 403,
        message: "Forbidden",
        error: "PermissionDenied",
      });
    }

    return successResponse({
      status: 200,
      message: "Address fetched successfully",
      data: { address },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}






export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated"
      });
    }

    const body = await req.json();
    const { name, label, addressLine, area, subCity, city, state, zipCode, country, phone, isDefault } = body;

    // Find and update address
    const updatedAddress = await Address.findByIdAndUpdate(
      params.id,
      { 
        name, 
        label, 
        addressLine, 
        area, 
        subCity, 
        city, 
        state, 
        zipCode, 
        country: new Types.ObjectId(country), 
        phone, 
        isDefault 
      },
      { new: true }
    );

    if (!updatedAddress) {
      return errorResponse({
        status: 404,
        message: "Address not found",
        error: "NotFound"
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




export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated"
      });
    }

    // Soft delete (deactivate) address
    const deletedAddress = await Address.findByIdAndUpdate(
      params.id,
      { isDefault: false },
      { new: true }
    );

    if (!deletedAddress) {
      return errorResponse({
        status: 404,
        message: "Address not found",
        error: "NotFound"
      });
    }

    return successResponse({
      status: 200,
      message: "Address deactivated successfully",
      data: { address: deletedAddress },
    });

  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}
