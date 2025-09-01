import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { ApiConfig } from "@/server/models/ApiConfig.model";
import { NextRequest } from "next/server";

// ✅ GET api-config by userId
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
   await connectDB();
  try {
    const config = await ApiConfig.findOne({ user: params.id });
    if (!config) {
      return errorResponse({
        status: 404,
        message: "API config not found for this user",
        req,
      });
    }

    return successResponse({
      status: 200,
      message: "API config fetched successfully",
      data: config,
      req,
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Failed to fetch API config",
      error,
      req,
    });
  }
}

// ✅ POST create api-config for userId
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const body = await req.json();

    // Check if already exists
    const exist = await ApiConfig.findOne({ user: params.id });
    if (exist) {
      return errorResponse({
        status: 400,
        message: "API config already exists for this user",
        req,
      });
    }

    const newConfig = await ApiConfig.create({
      ...body,
      user: params.id,
    });

    return successResponse({
      status: 201,
      message: "API config created successfully",
      data: newConfig,
      req,
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Failed to create API config",
      error,
      req,
    });
  }
}

// ✅ PUT update api-config by userId
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const body = await req.json();
    const config = await ApiConfig.findOneAndUpdate(
      { user: params.id },
      body,
      { new: true }
    );

    if (!config) {
      return errorResponse({
        status: 404,
        message: "API config not found for this user",
        req,
      });
    }

    return successResponse({
      status: 200,
      message: "API config updated successfully",
      data: config,
      req,
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Failed to update API config",
      error,
      req,
    });
  }
}

// ✅ DELETE api-config by userId
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectDB();
  try {
    const config = await ApiConfig.findOneAndDelete({ user: params.id });

    if (!config) {
      return errorResponse({
        status: 404,
        message: "API config not found for this user",
        req,
      });
    }

    return successResponse({
      status: 200,
      message: "API config deleted successfully",
      data: config,
      req,
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Failed to delete API config",
      error,
      req,
    });
  }
}