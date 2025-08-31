import connectDB from "@/config/db";
import { sendVerificationEmail } from "@/lib/emailService";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, phone, email, password } = body;

    // Validate required fields
    if (!name || !phone || !email || !password) {
      return errorResponse({
        status: 400,
        message: "All fields are required",
        req: request,
        meta: { missingFields: ["name", "phone", "email", "password"] },
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return errorResponse({
        status: 409,
        message: "User with this email or phone already exists",
        req: request,
        meta: { conflictField: existingUser.email ? "email" : "phone" },
      });
    }

    // Create new user
    const newUser = new User({
      name,
      phone,
      email,
      password, // Will be hashed automatically
      role: "user",
      isActive: true,
      isVerified: false,
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        language: "en",
      },
    });

    // Generate verification token
    const verificationToken = newUser.generateEmailVerificationToken();

    // Save user to database
    await newUser.save();

    // Prepare verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

    // Send verification email
    await sendVerificationEmail(email, name, verificationUrl);

    return successResponse({
      status: 201,
      message:
        "User registered successfully. Please check your email for verification.",
      data: { userId: newUser._id },
      req: request,
      meta: { operation: "user_signup" },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return errorResponse({
      status: 500,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
      req: request,
    });
  }
}
