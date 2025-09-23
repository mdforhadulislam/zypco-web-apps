import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { ApiAccessLog } from "@/server/models/ApiAccessLog.model";
import { User } from "@/server/models/User.model";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// GET - fetch a single access log by id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string; id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone,id } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid log ID", req });

    const log = await ApiAccessLog.findOne({ _id: id, user: user._id }).populate("ApiConfig").populate("user").lean();
    if (!log) return errorResponse({ status: 404, message: "Access log not found", req });

    return successResponse({ status: 200, message: "Access log fetched", data: log, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch access log";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// DELETE - soft delete or remove a log
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string; id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone, id } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid log ID", req });

    const log = await ApiAccessLog.findOneAndDelete({ _id: id, user: user._id });
    if (!log) return errorResponse({ status: 404, message: "Access log not found", req });

    return successResponse({ status: 200, message: "Access log deleted", data: log, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete access log";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// PUT - optional: update a log (e.g., mark success/failure manually)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string; id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone,id } = await params;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
    const body: Partial<ApiAccessLog> = await req.json();

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    if (!Types.ObjectId.isValid(id)) return errorResponse({ status: 400, message: "Invalid log ID", req });

    const updatedLog = await ApiAccessLog.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: body },
      { new: true }
    );

    if (!updatedLog) return errorResponse({ status: 404, message: "Access log not found", req });

    return successResponse({ status: 200, message: "Access log updated", data: updatedLog, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update access log";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}