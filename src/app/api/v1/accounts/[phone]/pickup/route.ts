import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Pickup, IPickup } from "@/server/models/Pickup.model";
import { User } from "@/server/models/User.model";
import { NextRequest, NextResponse } from "next/server";

// GET - fetch all pickups for a user with filters & pagination
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { user: user._id };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.preferredDate = {};
      if (startDate) query.preferredDate.$gte = new Date(startDate);
      if (endDate) query.preferredDate.$lte = new Date(endDate);
    }

    const total = await Pickup.countDocuments(query);

    const pickups: IPickup[] = await Pickup.find(query)
      .sort({ preferredDate: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse({
      status: 200,
      message: "Pickups fetched",
      data: pickups,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      req,
    });
  } catch (error: unknown) {
    console.log(error);
    
    const msg = error instanceof Error ? error.message : "Failed to fetch pickups";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// POST - create a new pickup for a user
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const body: Partial<IPickup> = await req.json();

    const newPickup = new Pickup({
      ...body,
      user: user._id,
    });

    await newPickup.save();

    return successResponse({
      status: 201,
      message: "Pickup created successfully",
      data: newPickup,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create pickup";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
