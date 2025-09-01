import connectDB from "@/config/db";
import { verifyToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {
    await connectDB();
    // Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Authentication failed.",
        req: request,
      });
    }

    let user = null;

    if (params.identifier.includes("@")) {
      // Identifier is email
      user = await User.findOne({ email: params.identifier });
    } else if (/^\d+$/.test(params.identifier)) {
      // Identifier is phone number
      user = await User.findOne({ phone: params.identifier });
    } else {
      // Assume identifier is MongoDB ObjectId
      user = await User.findById(params.identifier);
    }

    if (!user) {
      return errorResponse({
        status: 404,
        message: "User not found",
        req: request,
      });
    }

    return successResponse({
      status: 200,
      message: "User data retrieved successfully",
      data: { user },
      req: request,
    });
  } catch (error: unknown) {
    console.error("User Data Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request,
    });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {
    await connectDB();
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Authentication failed.",
        req: request,
      });
    }

    const updates = await request.json();

    // Find user by identifier
    let user = null;
    if (params.identifier.includes("@")) {
      user = await User.findOne({ email: params.identifier });
    } else if (/^\d+$/.test(params.identifier)) {
      user = await User.findOne({ phone: params.identifier });
    } else {
      user = await User.findById(params.identifier);
    }

    if (!user) {
      return errorResponse({
        status: 404,
        message: "User not found",
        req: request,
      });
    }

    // Update user
    Object.assign(user, updates);
    await user.save();

    return successResponse({
      status: 200,
      message: "User updated successfully",
      data: { user },
      req: request,
    });
  } catch (error: unknown) {
    console.error("User Update Error:", error);
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
  { params }: { params: { identifier: string } }
) {
  try {
    await connectDB();
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Authentication failed.",
        req: request,
      });
    }

    // Find user by identifier
    let user = null;
    if (params.identifier.includes("@")) {
      user = await User.findOne({ email: params.identifier });
    } else if (/^\d+$/.test(params.identifier)) {
      user = await User.findOne({ phone: params.identifier });
    } else {
      user = await User.findById(params.identifier);
    }

    if (!user) {
      return errorResponse({
        status: 404,
        message: "User not found",
        req: request,
      });
    }

    await user.deleteOne();

    return successResponse({
      status: 200,
      message: "User deleted successfully",
      req: request,
    });
  } catch (error: unknown) {
    console.error("User Deletion Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request,
    });
  }
}