// app/api/v1/auth/signin/route.ts
import connectDB from "@/config/db";
import { sendLoginAlertEmail } from "@/lib/email";
import { errorResponse, successResponse } from "@/server/common/response";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import { Notification } from "@/server/models/Notification.model";
import { User } from "@/server/models/User.model";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { identifier, password } = body;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return errorResponse({
        status: 401,
        message: "Invalid credentials",
        error: "AuthenticationFailed"
      });
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return errorResponse({
        status: 401,
        message: "Invalid credentials",
        error: "AuthenticationFailed"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Create login history record
    const loginHistory = new LoginHistory({
      user: user._id,
      success: true,
      ipAddress: req.headers.get("x-forwarded-for") || "",
      userAgent: req.headers.get("user-agent"),
    });
    await loginHistory.save();

    // Create notification for successful login
    const notification = new Notification({
      user: user._id,
      title: "Login Successful",
      message: "You have logged in to your account.",
      type: "success",
    });
    await notification.save();

    // Send login alert email (if enabled in preferences)
    if (user.preferences.notifications.email) {
      await sendLoginAlertEmail(user.email, user.name);
    }

    return successResponse({
      status: 200,
      message: "Logged in successfully",
      data: { 
        token, 
        user: { 
          id: user._id, 
          name: user.name, 
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          avatar: user.avatar
        }
      },
    });

  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}