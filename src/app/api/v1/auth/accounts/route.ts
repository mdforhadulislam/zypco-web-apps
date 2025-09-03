import connectDB from "@/config/db";
import { getAuthUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
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
      role: role || "user", // Default role
    });

    await newUser.save();

    return successResponse({
      status: 201,
      message: "Account created successfully",
      data: { userId: newUser._id },
    });
  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}



export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated"
      });
    }

    // Fetch all accounts for the user
    const accounts = await User.find({}).sort({ isDefault: -1 });

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