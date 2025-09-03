// app/api/v1/auth/accounts/[phone]/route.ts
import connectDB from "@/config/db";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated",
      });
    }

    // Find user by phone
    const targetUser = await User.findOne({ phone: params.phone });
    if (!targetUser) {
      return errorResponse({
        status: 404,
        message: "User not found",
        error: "NotFound",
      });
    }

    // Check permission (own account or admin)
    if (user.role !== "admin" || user.phone !== targetUser.phone) {
      return errorResponse({
        status: 403,
        message: "Forbidden",
        error: "PermissionDenied",
      });
    }

    // Fetch all accounts for the user
    const accounts = await User.find({ user: targetUser._id });

    return successResponse({
      status: 200,
      message: "Accounts fetched successfully",
      data: { accounts },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated",
      });
    }

    const body = await req.json();
    const { name, phone, email, password, role } = body;

    // Find and update account
    const updatedAccount = await User.findOneAndUpdate(
      { phone: params.phone },
      {
        name,
        phone,
        email,
        password,
        role,
      },
      { new: true }
    );

    if (!updatedAccount) {
      return errorResponse({
        status: 404,
        message: "Account not found",
        error: "NotFound",
      });
    }

    return successResponse({
      status: 200,
      message: "Account updated successfully",
      data: { account: updatedAccount },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { phone: string } }
) {
  try {
    await connectDB();

    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated",
      });
    }

    // Soft delete (deactivate) account
    const deletedAccount = await User.findOneAndUpdate(
      { phone: params.phone },
      { isActive: false },
      { new: true }
    );

    if (!deletedAccount) {
      return errorResponse({
        status: 404,
        message: "Account not found",
        error: "NotFound",
      });
    }

    return successResponse({
      status: 200,
      message: "Account deactivated successfully",
      data: { account: deletedAccount },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}
