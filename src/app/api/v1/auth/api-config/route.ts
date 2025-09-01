import connectDB from "@/config/db";
import { verifyToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { ApiConfig } from "@/server/models/ApiConfig.model";
import { NextRequest } from "next/server";
 
export async function GET(request: NextRequest) {
  try {
        await connectDB();
    // Verify token
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Unauthorized",
        req: request,
      });
    }

    // Role check (only admin, moderator allowed)
    if (!["admin", "moderator"].includes(authResult.role as string)) {
      return errorResponse({
        status: 403,
        message: "Forbidden: You do not have access to this resource",
        req: request,
      });
    }

    // Fetch configs
    const configs = await ApiConfig.find().populate("user", "name email role");

    return successResponse({
      status: 200,
      message: "API configs retrieved successfully",
      data: { configs },
      req: request,
    });
  } catch (error) {
    console.error("API Config GET Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request,
    });
  }
}