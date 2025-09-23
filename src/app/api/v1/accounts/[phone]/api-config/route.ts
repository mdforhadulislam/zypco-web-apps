import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { ApiConfig, IApiConfig } from "@/server/models/ApiConfig.model";
import { User } from "@/server/models/User.model";
import { notificationService } from "@/services/notificationService";
import { NextRequest, NextResponse } from "next/server";

interface ApiConfigBody {
  name?: string;
  allowedIPs?: string[];
  isActive?: boolean;
  expiresAt?: string;
  rateLimit?: {
    windowMs?: number;
    maxRequests?: number;
  };
}

// GET - fetch all API configs for a user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;

    const user = await User.findOne({ phone });
    if (!user)
      return errorResponse({ status: 404, message: "User not found", req });

    const configs = await ApiConfig.find({ user: user._id }).sort({
      createdAt: -1,
    }).populate("user").lean();

    return successResponse({
      status: 200,
      message: "API configs fetched",
      data: configs,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch API configs";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// POST - create a new API config
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;
    const body: ApiConfigBody = await req.json();

    const user = await User.findOne({ phone });
    if (!user)
      return errorResponse({ status: 404, message: "User not found", req });

    const newConfig = new ApiConfig({
      user: user._id,
      name: body.name,
      allowedIPs: body.allowedIPs || [],
      isActive: body.isActive ?? true,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      rateLimit: {
        windowMs: body.rateLimit?.windowMs || 60000,
        maxRequests: body.rateLimit?.maxRequests || 60,
        remaining: body.rateLimit?.maxRequests || 60,
        resetTime: new Date(Date.now() + (body.rateLimit?.windowMs || 60000)),
      },
    });

    await newConfig.save();

    // Send notification
    await notificationService
      .sendNotification(
        { userId:user._id, phone: user.phone, email: user.email ,
          title: "New API Key Created",
          message: `Your new API key "${newConfig.name}" has been created successfully.`,
          type: "success",
          category: "account",
          channels: ["email", "inapp"],
          data: { configId: newConfig._id, name: newConfig.name },
        }
      )
      .catch((err) =>
        console.error("API config creation notification failed:", err)
      );

    return successResponse({
      status: 201,
      message: "API config created",
      data: newConfig,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to create API config";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// PUT - update an existing API config
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;
    const body: ApiConfigBody & { configId: string } = await req.json();

    if (!body.configId)
      return errorResponse({ status: 400, message: "Config ID required", req });

    const user = await User.findOne({ phone });
    if (!user)
      return errorResponse({ status: 404, message: "User not found", req });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    const updateData: Partial<IApiConfig> = { ...body };
    if (body.rateLimit) {
      
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
      updateData.rateLimit = {...body.rateLimit,remaining: body.rateLimit.maxRequests,resetTime: new Date(Date.now() + (body.rateLimit.windowMs || 60000)),};
    }
    if (body.expiresAt) updateData.expiresAt = new Date(body.expiresAt);

    const updatedConfig = await ApiConfig.findOneAndUpdate(
      { _id: body.configId, user: user._id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedConfig)
      return errorResponse({
        status: 404,
        message: "API config not found",
        req,
      });

    // Send notification
    await notificationService
      .sendNotification(
        { userId:user._id, phone: user.phone, email: user.email ,
          title: "API Key Updated",
          message: `Your API key "${updatedConfig.name}" has been updated successfully.`,
          type: "info",
          category: "account",
          channels: ["email", "inapp"],
          data: { configId: updatedConfig._id, name: updatedConfig.name },
        }
      )
      .catch((err) =>
        console.error("API config update notification failed:", err)
      );

    return successResponse({
      status: 200,
      message: "API config updated",
      data: updatedConfig,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to update API config";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// DELETE - remove an API config
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;
    const body: { configId: string } = await req.json();

    if (!body.configId)
      return errorResponse({ status: 400, message: "Config ID required", req });

    const user = await User.findOne({ phone });
    if (!user)
      return errorResponse({ status: 404, message: "User not found", req });

    const deletedConfig = await ApiConfig.findOneAndDelete({
      _id: body.configId,
      user: user._id,
    });

    if (!deletedConfig)
      return errorResponse({
        status: 404,
        message: "API config not found",
        req,
      });

    // Send notification
    await notificationService
      .sendNotification(
        { userId:user._id, phone: user.phone, email: user.email ,
          title: "API Key Deleted",
          message: `Your API key "${deletedConfig.name}" has been deleted successfully.`,
          type: "warning",
          category: "account",
          channels: ["email", "inapp"],
          data: { configId: deletedConfig._id, name: deletedConfig.name },
        }
      )
      .catch((err) =>
        console.error("API config deletion notification failed:", err)
      );

    return successResponse({
      status: 200,
      message: "API config deleted",
      data: deletedConfig,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to delete API config";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
