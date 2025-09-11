import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import { Track } from "@/server/models/Track.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";

export async function GET(req: NextRequest, { params }: { params: { trackID: string } }) {
  try {
    await connectDB();
    const { trackID } = params;

    if (!Types.ObjectId.isValid(trackID)) return errorResponse({ status: 400, message: "Invalid trackID", req });

    const track = await Track.findById(trackID).lean();
    if (!track) return errorResponse({ status: 404, message: "Track not found", req });

    return successResponse({ status: 200, message: "Track fetched successfully", data: track, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch track";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { trackID: string } }) {
  try {
    await connectDB();
    const { trackID } = params;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await req.json()) as any;

    if (!Types.ObjectId.isValid(trackID)) return errorResponse({ status: 400, message: "Invalid trackID", req });

    const track = await Track.findById(trackID);
    if (!track) return errorResponse({ status: 404, message: "Track not found", req });

    // Update currentStatus
    if (body.currentStatus) {
      track.currentStatus = body.currentStatus;

      // Add to history if description exists
      const step = {
        status: body.currentStatus,
        description: body.description || "",
        location: body.location || { city: "", country: "" },
        updatedBy: body.updatedBy || null,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (track.history as any).push(step);
    }

    if (body.estimatedDelivery) track.estimatedDelivery = new Date(body.estimatedDelivery);

    await track.save();

    return successResponse({ status: 200, message: "Track updated successfully", data: track, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update track";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { trackID: string } }) {
  try {
    await connectDB();
    const { trackID } = params;

    if (!Types.ObjectId.isValid(trackID)) return errorResponse({ status: 400, message: "Invalid trackID", req });

    const deleted = await Track.findByIdAndDelete(trackID);
    if (!deleted) return errorResponse({ status: 404, message: "Track not found", req });

    return successResponse({ status: 200, message: "Track deleted successfully", req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete track";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
