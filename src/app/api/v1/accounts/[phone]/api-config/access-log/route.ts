import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { ApiAccessLog } from "@/server/models/ApiAccessLog.model";
import { ApiConfig } from "@/server/models/ApiConfig.model";
import { User } from "@/server/models/User.model";
import { NextRequest, NextResponse } from "next/server";

interface AccessLogBody {
  apiKey: string; // ApiConfig ObjectId
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  status: number;
  success?: boolean;
  ip: string;
  requestHeaders?: Record<string, string>;
  responseTime?: number;
}

// GET - Fetch all access logs for a user or API key
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string;   }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;

    const user = await User.findOne({ phone });
    if (!user)
      return errorResponse({ status: 404, message: "User not found", req });

    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get("apiKey"); // optional query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = { user: user._id };
    if (apiKey) filter.apiKey = apiKey;

    const logs = await ApiAccessLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(100); // limit to last 100 logs

    return successResponse({
      status: 200,
      message: "Access logs fetched",
      data: logs,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch access logs";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// POST - Create a new access log
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string;   }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;
    const body: AccessLogBody = await req.json();

    const user = await User.findOne({ phone });
    if (!user)
      return errorResponse({ status: 404, message: "User not found", req });

    const apiConfig = await ApiConfig.findById(body.apiKey);
    if (!apiConfig)
      return errorResponse({
        status: 404,
        message: "API config not found",
        req,
      });

    const newLog = new ApiAccessLog({
      apiKey: apiConfig._id,
      user: user._id,
      endpoint: body.endpoint,
      method: body.method,
      status: body.status,
      success: body.success ?? (body.status >= 200 && body.status < 400),
      ip: body.ip,
      requestHeaders: body.requestHeaders || {},
      responseTime: body.responseTime || 0,
      timestamp: new Date(),
    });

    await newLog.save();

    return successResponse({
      status: 201,
      message: "Access log created",
      data: newLog,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to create access log";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
