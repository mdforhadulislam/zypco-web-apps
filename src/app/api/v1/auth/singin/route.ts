import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import { LoginHistory } from "@/server/models/LoginHistory.model";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return errorResponse({
        status: 400,
        message: "Email/Phone and password are required",
        req: request
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!user) {
      return errorResponse({
        status: 404,
        message: "User not found",
        req: request
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse({
        status: 403,
        message: "Account is disabled",
        req: request
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Log failed login attempt
      await LoginHistory.create({
        user: user._id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
        reason: 'incorrect_password'
      });

      return errorResponse({
        status: 401,
        message: "Invalid credentials",
        req: request
      });
    }

    // Update user login details
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    // Log successful login
    await LoginHistory.create({
      user: user._id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Prepare user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar || '',
      isVerified: user.isVerified,
      preferences: user.preferences
    };

    return successResponse({
      status: 200,
      message: "Login successful",
      data: { user: userData, token },
      req: request
    });

  } catch (error: unknown) {
    console.error("Signin Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal Server Error",
      error,
      req: request
    });
  }
}