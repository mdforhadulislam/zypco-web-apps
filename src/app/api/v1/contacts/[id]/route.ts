import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Contact } from "@/server/models/Contact.model";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

// ==========================
// GET - fetch single contact
// ==========================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid contact ID", req });
    }

    const contact = await Contact.findById(id).populate(
      "replies.responder",
      "name email"
    );
    if (!contact) {
      return errorResponse({ status: 404, message: "Contact not found", req });
    }

    return successResponse({
      status: 200,
      message: "Contact fetched successfully",
      data: contact,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch contact";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// ==========================
// PUT - update contact
// ==========================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid contact ID", req });
    }

    const body = await req.json();
    const updatedContact = await Contact.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updatedContact) {
      return errorResponse({ status: 404, message: "Contact not found", req });
    }

    return successResponse({
      status: 200,
      message: "Contact updated successfully",
      data: updatedContact,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to update contact";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// ==========================
// DELETE - remove contact
// ==========================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await connectDB();

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return errorResponse({ status: 400, message: "Invalid contact ID", req });
    }

    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return errorResponse({ status: 404, message: "Contact not found", req });
    }

    return successResponse({
      status: 200,
      message: "Contact deleted successfully",
      data: deletedContact,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to delete contact";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
