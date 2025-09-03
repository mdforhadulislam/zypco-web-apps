// app/api/v1/auth/api-config/[phone]/route.ts
import connectDB from "@/config/db";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { ApiConfig } from "@/server/models/ApiConfig.model";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

// CREATE: Create API config for a specific user
export async function POST(
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
    if (user.role !== "admin" && user.phone !== targetUser.phone) {
      return errorResponse({
        status: 403,
        message: "Forbidden",
        error: "PermissionDenied",
      });
    }

    // Create new API config
    const newConfig = new ApiConfig({
      user: targetUser._id,
      name: `API Key for ${targetUser.name}`,
    });

    await newConfig.save();

    return successResponse({
      status: 201,
      message: "API key generated",
      data: { apiKey: newConfig.key },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}

// READ: Get all API configs for a specific user
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
    if (user.role !== "admin" && user.phone !== targetUser.phone) {
      return errorResponse({
        status: 403,
        message: "Forbidden",
        error: "PermissionDenied",
      });
    }

    // Fetch all API configs for the user
    const configs = await ApiConfig.find({ user: targetUser._id });

    return successResponse({
      status: 200,
      message: "API configs fetched",
      data: { configs },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}

// UPDATE: Update API config for a specific user
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

    const body = await req.json();
    const { configId, isActive, name } = body;

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
    if (user.role !== "admin" && user.phone !== targetUser.phone) {
      return errorResponse({
        status: 403,
        message: "Forbidden",
        error: "PermissionDenied",
      });
    }

    // Find and update config
    const updatedConfig = await ApiConfig.findOneAndUpdate(
      { _id: configId, user: targetUser._id },
      {
        isActive: isActive ?? undefined,
        name: name ?? undefined,
      },
      { new: true }
    );

    if (!updatedConfig) {
      return errorResponse({
        status: 404,
        message: "Config not found",
        error: "NotFound",
      });
    }

    return successResponse({
      status: 200,
      message: "API config updated",
      data: { config: updatedConfig },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}

// DELETE: Delete API config for a specific user
export async function DELETE(
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

    const body = await req.json();
    const { configId } = body;

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
    if (user.role !== "admin" && user.phone !== targetUser.phone) {
      return errorResponse({
        status: 403,
        message: "Forbidden",
        error: "PermissionDenied",
      });
    }

    // Soft delete (deactivate) config
    const deletedConfig = await ApiConfig.findOneAndUpdate(
      { _id: configId, user: targetUser._id },
      { isActive: false },
      { new: true }
    );

    if (!deletedConfig) {
      return errorResponse({
        status: 404,
        message: "Config not found",
        error: "NotFound",
      });
    }

    return successResponse({
      status: 200,
      message: "API config deactivated",
      data: { config: deletedConfig },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}
