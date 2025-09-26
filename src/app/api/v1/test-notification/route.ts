import { NextRequest } from "next/server";
import { createPublicHandler } from "@/server/common/apiWrapper";
import { successResponse, errorResponse } from "@/server/common/response";

export const POST = createPublicHandler(async ({ req }) => {
  try {
    const body = await req.json();
    
    const testResponse = {
      message: "Test notification endpoint working",
      receivedData: body,
      timestamp: new Date().toISOString(),
      notificationSent: true,
      emailSent: true
    };

    return successResponse({
      status: 200,
      message: "Test notification processed successfully",
      data: testResponse,
      req,
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Test notification failed",
      error,
      req,
    });
  }
});