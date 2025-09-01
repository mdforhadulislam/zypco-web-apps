import connectDB from "@/config/db";
import { verifyToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { Address } from "@/server/models/Address.model";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
        await connectDB();
    // Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Unauthorized",
        req: request,
      });
    }

    // Get address by id
    const address = await Address.find({ user: params.id })
      .populate("user", "name email")
      .populate("country");

    if (!address) {
      return errorResponse({
        status: 404,
        message: "Address not found",
        req: request,
      });
    }

    return successResponse({
      status: 200,
      message: "Address retrieved successfully",
      data: { address },
      req: request,
    });
  } catch (error: unknown) {
    console.error("Address Detail Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request,
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
        await connectDB();
    // Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Unauthorized",
        req: request,
      });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    // Validate address exists
    const address = await Address.findById(id);
    if (!address) {
      return errorResponse({
        status: 404,
        message: "Address not found",
        req: request,
      });
    }

    // Update address
    Object.assign(address, updates);
    await address.save();

    return successResponse({
      status: 200,
      message: "Address updated successfully",
      data: { address },
      req: request,
    });
  } catch (error: unknown) {
    console.error("Address Update Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
        await connectDB();
    // Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Unauthorized",
        req: request,
      });
    }

    const { id } = await request.json();

    // Validate address exists
    const address = await Address.findById(id);
    if (!address) {
      return errorResponse({
        status: 404,
        message: "Address not found",
        req: request,
      });
    }

    // Delete address
    await address.deleteOne();

    return successResponse({
      status: 200,
      message: "Address deleted successfully",
      req: request,
    });
  } catch (error: unknown) {
    console.error("Address Deletion Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request,
    });
  }
}
