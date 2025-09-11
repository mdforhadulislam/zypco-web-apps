import connectDB from "@/config/db";
import { Country } from "@/server/models/Country.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { NextRequest } from "next/server";
import { Types } from "mongoose";

/**
 * GET - fetch a single country by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid country ID", req });
    }

    const country = await Country.findById(id).lean();
    if (!country) {
      return errorResponse({ status: 404, message: "Country not found", req });
    }

    return successResponse({
      status: 200,
      message: "Country fetched successfully",
      data: country,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch country";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

/**
 * PUT - update a country by ID
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid country ID", req });
    }

    const body = await req.json();

    if (body.code) body.code = String(body.code).trim().toUpperCase();
    if (body.name) body.name = String(body.name).trim();

    const updated = await Country.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return errorResponse({ status: 404, message: "Country not found", req });
    }

    return successResponse({
      status: 200,
      message: "Country updated successfully",
      data: updated,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to update country";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

/**
 * DELETE - remove a country by ID
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid country ID", req });
    }

    const deleted = await Country.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse({ status: 404, message: "Country not found", req });
    }

    return successResponse({
      status: 200,
      message: "Country deleted successfully",
      data: deleted,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to delete country";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}