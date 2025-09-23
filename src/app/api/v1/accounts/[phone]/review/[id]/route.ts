import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Review, IReview } from "@/server/models/Review.model";
import { User } from "@/server/models/User.model";
import { NextRequest, NextResponse } from "next/server";

// GET - fetch a single review
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string, id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone, id } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const review = await Review.findOne({ _id: id, user: user._id }).populate("user").lean();
    if (!review) return errorResponse({ status: 404, message: "Review not found", req });

    return successResponse({ status: 200, message: "Review fetched", data: review, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch review";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// PUT - update a review
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string, id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone, id } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const body: Partial<IReview> = await req.json();

    const updatedReview = await Review.findOneAndUpdate(
      { _id: id, user: user._id },
      { $set: body },
      { new: true }
    );

    if (!updatedReview) return errorResponse({ status: 404, message: "Review not found", req });

    return successResponse({ status: 200, message: "Review updated", data: updatedReview, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to update review";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// DELETE - remove a review
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string, id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { phone, id } = await params;

    const user = await User.findOne({ phone });
    if (!user) return errorResponse({ status: 404, message: "User not found", req });

    const deletedReview = await Review.findOneAndDelete({ _id: id, user: user._id });
    if (!deletedReview) return errorResponse({ status: 404, message: "Review not found", req });

    return successResponse({ status: 200, message: "Review deleted", data: deletedReview, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to delete review";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}