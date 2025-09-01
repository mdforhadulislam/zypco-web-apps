// src/app/api/v1/auth/singup/route.ts
import { NextRequest } from "next/server"; 
import { User } from "@/server/models/User.model";
import { successResponse, errorResponse } from "@/server/common/response";
import connectDB from "@/config/db";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, phone, email, password } = body ?? {};

    if (!name || !phone || !email || !password) {
      return errorResponse({ status: 400, message: "name, phone, email and password are required", req });
    }

    // check phone or email already used
    const existing = await User.findOne({ $or: [{ phone }, { email }] });
    if (existing) {
      return errorResponse({ status: 409, message: "Phone or email already registered", req });
    }

    // Create user (let model's pre-save hash password)
    const userDoc = await User.create({
      name,
      phone,
      email,
      password, // plain -> model will hash
      role: "user",
      isActive: true,
      isVerified: false,
    });

    // hide password in response
    const user = await User.findById(userDoc._id).select("-password");

    return successResponse({ status: 201, message: "Signup successful", data: { user }, req });
  } catch (err) {
    return errorResponse({ status: 500, message: "Signup failed", error: err, req });
  }
}