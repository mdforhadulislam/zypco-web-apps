import connectDB from "@/config/db";
import { User } from "@/server/models/User.model";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/middleware/auth";
import { errorResponse, successResponse } from "@/server/common/response";

interface UpdateUserBody {
  name?: string;
  email?: string;
  role?: "user" | "admin" | "moderator";
  isActive?: boolean;
  isVerified?: boolean;
}

// PUT: Update account information by phone (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ phone: string }> }
): Promise<NextResponse>  {
  try {
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return errorResponse({ status: 401, message: "Unauthorized", req });
    }

    await connectDB();

    const { phone } = await params;
    if (!phone) {
      return errorResponse({ status: 400, message: "Phone parameter is required", req });
    }

    const body: UpdateUserBody = await req.json();

    // Validate role if provided
    if (body.role && !["user", "admin", "moderator"].includes(body.role)) {
      return errorResponse({ status: 400, message: "Invalid role", req });
    }

    // Ensure at least one field is provided for update
    if (!body.name && !body.email && !body.role && body.isActive === undefined && body.isVerified === undefined) {
      return errorResponse({ status: 400, message: "No update fields provided", req });
    }

    const updatedUser = await User.findOneAndUpdate(
      { phone },
      { $set: body },
      { new: true, runValidators: true }
    ).select("-password -refreshToken").lean();

    if (!updatedUser) {
      return errorResponse({ status: 404, message: "User not found", req });
    }

    return successResponse({ status: 200, message: "User updated successfully", data: updatedUser, req });

  } catch (error) {
    console.error("PUT /accounts/[phone] error:", error);
    return errorResponse({ status: 500, message: "Internal server error", error, req });
  }
}
