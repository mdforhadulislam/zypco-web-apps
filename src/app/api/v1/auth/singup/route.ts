// app/api/v1/auth/signup/route.ts
import connectDB from "@/config/db";
import { sendVerificationEmail } from "@/lib/email";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, phone, email, password } = body;

    // Validate input
    if (!name || !phone || !email || !password) {
      return errorResponse({
        status: 400,
        message: "All fields are required",
        error: "ValidationError",
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return errorResponse({
        status: 409,
        message: "User already exists",
        error: "DuplicateEntry",
      });
    }

    // Create new user
    const newUser = new User({
      name,
      phone,
      email,
      password,
      role: "user", // Default role
      isVerified: false, // Initially unverified
    });

    // Generate verification code
    const verificationCode = newUser.generateVerificationCode();
    
    // Save user to DB
    await newUser.save();

    // Send verification email
    await sendVerificationEmail(newUser.email, verificationCode);

    return successResponse({
      status: 201,
      message: "User registered successfully. Please verify your email.",
      data: { userId: newUser._id },
    });

  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}