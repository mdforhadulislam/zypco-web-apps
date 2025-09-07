import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { NextRequest } from "next/server";

// GET - fetch single login history
export async function GET(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    const history = await LoginHistory.findById(id);
    if (!history) return errorResponse({ status: 404, message: "Login history not found", req });

    return successResponse({ status: 200, message: "Login history fetched", data: history, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch login history";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// PUT - update login history
export async function PUT(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const updated = await LoginHistory.findByIdAndUpdate(id, body, { new: true });
    if (!updated) return errorResponse({ status: 404, message: "Login history not found", req });

    return successResponse({ status: 200, message: "Login history updated", data: updated, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update login history";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// DELETE - remove login history
export async function DELETE(req: NextRequest, { params }: { params: { phone: string; id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    const deleted = await LoginHistory.findByIdAndDelete(id);
    if (!deleted) return errorResponse({ status: 404, message: "Login history not found", req });

    return successResponse({ status: 200, message: "Login history deleted", data: deleted, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete login history";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
