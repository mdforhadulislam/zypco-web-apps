import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Permission } from "@/server/models/Permission.model";
import { User } from "@/server/models/User.model";
import { emailService } from "@/services/emailService";
import { NextRequest } from "next/server";

/**
 * POST /api/v1/auth/signup
 * Register new user
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, phone, email, password } = await req.json();

    // Validate required fields
    if (!name || !phone || !email || !password) {
      return errorResponse({
        status: 400,
        message: "All fields are required",
        req,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser) {
      return errorResponse({
        status: 400,
        message: "User already exists",
        req,
      });
    }

    // Create user
    const newUser = new User({ name, phone, email, password });

    // Generate verification code
    const code = newUser.generateVerificationCode();
    const savedUser = await newUser.save();

    const setPermission = new Permission({
      user:savedUser._id
    })

    await setPermission.save()

    // Send verification email
    const emailSent = await emailService.sendVerificationEmail({
      email: newUser.email,
      name: newUser.name,
      code,
    });

    console.log("Verification email sent:", emailSent);

    
    return successResponse({
      status: 201,
      message: "Signup successful! Verification email sent.",
      data: {
        id: newUser._id,
        email: newUser.email,
        phone: newUser.phone,
      },
      req,
    });
  } catch (error: unknown) {
    console.error("Signup API Error:", error);

    let errorMessage = "Something went wrong";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return errorResponse({
      status: 500,
      message: errorMessage,
      error,
      req,
    });
  }
}
