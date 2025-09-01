import connectDB from "@/config/db";
import { verifyToken } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { Address } from "@/server/models/Address.model";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

const isAdminOrModerator = (user: unknown): boolean => {
  return (
    (typeof user === "object" &&
      user !== null &&
      "role" in user &&
      (user as { role?: string }).role === "admin") ||
    (user as { role?: string }).role === "moderator"
  );
};

export async function GET(request: NextRequest) {
  try {
        await connectDB();
    // Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return errorResponse({
        status: 401,
        message: authResult.message ?? "Unauthorized",
        req: request,
      });
    }

    let addresses;

    // Admins can see all addresses, regular users only their own
    if (isAdminOrModerator(await User.findById(authResult.userId))) {
      addresses = await Address.find()
        .populate("user", "name email") // Show user info for admin/moderator
        .populate("country")
        .sort({ isDefault: -1, createdAt: -1 });
    } else {
      addresses = await Address.find({ user: authResult.userId })
        .populate("country")
        .sort({ isDefault: -1, createdAt: -1 });
    }

    return successResponse({
      status: 200,
      message: "Addresses retrieved successfully",
      data: { addresses },
      req: request,
    });
  } catch (error: unknown) {
    console.error("Address Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request,
    });
  }
}
