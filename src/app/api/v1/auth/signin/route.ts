import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { User } from "@/server/models/User.model";
import { notificationService } from "@/services/notificationService";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { Types } from "mongoose";
import { NextRequest } from "next/server";

type SigninBody = {
  phone?: string;
  password?: string;
};

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = (await req.json()) as SigninBody;
    const { phone, password } = body;

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Validate input
    if (!phone || !password) {
      await LoginHistory.create({
        phone: phone || "",
        ipAddress,
        userAgent,
        success: false,
        failureReason: "Missing phone or password",
        timestamp: new Date(),
      });

      return errorResponse({
        status: 400,
        message: "Phone and password are required",
        req,
      });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      await LoginHistory.create({
        user: null,
        phone,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "User not found",
        timestamp: new Date(),
      });

      return errorResponse({
        status: 404,
        message: "User not found",
        req,
      });
    }

    // Check if active
    if (!user.isActive) {
      await LoginHistory.create({
        user: user._id,
        phone,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "Account deactivated",
        timestamp: new Date(),
      });

      return errorResponse({
        status: 403,
        message: "User account is deactivated",
        req,
      });
    }

    // Check if verified
    if (!user.isVerified) {
      await LoginHistory.create({
        user: user._id,
        phone,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "Email not verified",
        timestamp: new Date(),
      });

      return errorResponse({
        status: 403,
        message: "Email not verified. Please verify your account first",
        req,
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await LoginHistory.create({
        user: user._id,
        phone,
        ipAddress,
        userAgent,
        success: false,
        failureReason: "Invalid password",
        timestamp: new Date(),
      });

      return errorResponse({
        status: 401,
        message: "Invalid password",
        req,
      });
    }

    // Successful login
    await LoginHistory.create({
      user: user._id,
      phone,
      ipAddress,
      userAgent,
      success: true,
      action: "login",
      timestamp: new Date(),
    });

const userId = user._id as Types.ObjectId; // cast _id to ObjectId
const token: string = jwt.sign(
  { id: userId.toString(), role: user.role },
  process.env.JWT_SECRET as Secret,
  { expiresIn: 7 * 24 * 60 * 60 } // 7 days
);

    // Send login notification (non-blocking)
    notificationService
      .sendAuthNotification(
        { phone: user.phone, email: user.email, name: user.name },
        "login_alert"
      )
      .catch((err) => console.error("Failed to send login alert:", err));

    // Prepare response
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      ...(token && { token }),
    };

    return successResponse({
      status: 200,
      message: "Signin successful",
      data: responseData,
      req,
    });
  } catch (error: unknown) {
    console.error("Signin API Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";

    // Attempt to log failed attempt
    try {
      await LoginHistory.create({
        phone: "unknown",
        ipAddress: "unknown",
        userAgent: "unknown",
        success: false,
        failureReason: errorMessage,
        timestamp: new Date(),
      });
    } catch {
      // ignore
    }

    return errorResponse({
      status: 500,
      message: errorMessage,
      error,
      req,
    });
  }
}
