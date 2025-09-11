import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Blog } from "@/server/models/Blog.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// ==========================
// GET - fetch single blog
// =========================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid blog ID", req });
    }

    const blog = await Blog.findById(id)
      .populate("author", "name email")
      .populate("relatedService", "name");

    if (!blog)
      return errorResponse({ status: 404, message: "Blog not found", req });

    return successResponse({
      status: 200,
      message: "Blog fetched successfully",
      data: blog,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch blog";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// ==========================
// PUT - update blog
// ==========================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid blog ID", req });
    }

    const blog = await Blog.findByIdAndUpdate(id, body, { new: true });

    if (!blog)
      return errorResponse({ status: 404, message: "Blog not found", req });

    return successResponse({
      status: 200,
      message: "Blog updated successfully",
      data: blog,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to update blog";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// ==========================
// DELETE - remove blog
// ==========================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{  id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid blog ID", req });
    }

    const blog = await Blog.findByIdAndDelete(id);

    if (!blog)
      return errorResponse({ status: 404, message: "Blog not found", req });

    return successResponse({
      status: 200,
      message: "Blog deleted successfully",
      data: blog,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to delete blog";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
