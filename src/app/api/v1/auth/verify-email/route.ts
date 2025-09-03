import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, code } = body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse({
        status: 404,
        message: "User not found",
        error: "NotFound",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return successResponse({
        status: 200,
        message: "Email already verified",
      });
    }

    // Verify code and expiry
    if (
      user.emailVerification.code !== code ||
      user.emailVerification.expires < new Date()
    ) {
      return errorResponse({
        status: 400,
        message: "Invalid or expired verification code",
        error: "VerificationFailed",
      });
    }

    // Update user as verified
    user.isVerified = true;
    user.emailVerification.code = null;
    user.emailVerification.expires = null;
    await user.save();

    return successResponse({
      status: 200,
      message: "Email verified successfully",
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}
