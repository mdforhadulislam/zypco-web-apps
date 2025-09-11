import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Contact, IContact } from "@/server/models/Contact.model";
import { NextRequest } from "next/server";

// ==========================
// GET - fetch all contacts
// ==========================
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const status = url.searchParams.get("status"); // filter by status
    const category = url.searchParams.get("category"); // filter by category
    const priority = url.searchParams.get("priority"); // filter by priority

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const contacts: IContact[] = await Contact.find(query)
      .sort({ createdAt: -1 })
      .populate("replies.responder", "name email");

    return successResponse({
      status: 200,
      message: "Contacts fetched successfully",
      data: contacts,
      meta: { total: contacts.length },
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch contacts";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// ==========================
// POST - create new contact
// ==========================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.email || !body.message) {
      return errorResponse({
        status: 400,
        message: "Name, email and message are required",
        req,
      });
    }

    const newContact = await Contact.create(body);

    return successResponse({
      status: 201,
      message: "Contact created successfully",
      data: newContact,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to create contact";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
