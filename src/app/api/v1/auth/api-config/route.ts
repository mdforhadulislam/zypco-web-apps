// app/api/v1/auth/api-config/route.ts
import connectDB from "@/config/db";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { ApiConfig } from "@/server/models/ApiConfig.model";
import { NextRequest } from "next/server";

// CREATE: Create new API config
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

    // Create new API config
    const newConfig = new ApiConfig({
      user: user._id,
      name: `API Key for ${user.name}`,
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

// READ: Get all API configs for the user
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

    // Fetch all active API configs for the user
    const configs = await ApiConfig.find({ user: user._id, isActive: true });

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

// UPDATE: Update API config (enable/disable, change name)
export async function PUT(req: NextRequest) {
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

    // Find and update config
    const updatedConfig = await ApiConfig.findOneAndUpdate(
      { _id: configId, user: user._id },
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

// DELETE: Delete API config
export async function DELETE(req: NextRequest) {
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

    // Soft delete (mark as inactive instead of hard delete)
    const deletedConfig = await ApiConfig.findOneAndUpdate(
      { _id: configId, user: user._id },
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
