import connectDB from "@/config/db";
import { User } from "@/server/models/User.model";
import { NextRequest, NextResponse } from "next/server";


// --- GET: fetch all users with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    // --- filters
    const role = searchParams.get("role");
    const isActive = searchParams.get("isActive");
    const isVerified = searchParams.get("isVerified");
    const search = searchParams.get("search");

    // --- pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (role) query.role = role;
    if (isActive !== null) query.isActive = isActive === "true";
    if (isVerified !== null) query.isVerified = isVerified === "true";

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // --- get users
    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    console.error("GET /accounts error:", error);
    return NextResponse.json(
        { success: false, message: "Server Error", error },
        { status: 500 }
        );
  }
}
