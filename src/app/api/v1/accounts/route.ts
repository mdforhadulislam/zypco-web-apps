import connectDB from "@/config/db";
import { User } from "@/server/models/User.model";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/middleware/auth";

interface UserQuery {
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  $or?: Array<{
    name?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
    phone?: { $regex: string; $options: string };
  }>;
}

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// GET: fetch all users with filters (Admin only)
export async function GET(req: NextRequest) {
  try {
    // Verify authentication and admin role
    const authResult = await verifyAuth(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(req.url);

    // Input validation and sanitization
    const role = searchParams.get("role");
    const isActiveParam = searchParams.get("isActive");
    const isVerifiedParam = searchParams.get("isVerified");
    const search = searchParams.get("search");

    // Validate role if provided
    if (role && !['user', 'admin', 'moderator'].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role parameter" },
        { status: 400 }
      );
    }

    // Pagination with limits
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const paginationParams: PaginationParams = { page, limit, skip };

    // Build query with proper typing
    const query: UserQuery = {};

    if (role) query.role = role;
    if (isActiveParam !== null) query.isActive = isActiveParam === "true";
    if (isVerifiedParam !== null) query.isVerified = isVerifiedParam === "true";

    if (search) {
      // Sanitize search input to prevent regex injection
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: "i" } },
        { email: { $regex: sanitizedSearch, $options: "i" } },
        { phone: { $regex: sanitizedSearch, $options: "i" } },
      ];
    }

    // Execute queries with proper error handling
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -refreshToken") // Exclude sensitive data
        .skip(paginationParams.skip)
        .limit(paginationParams.limit)
        .sort({ createdAt: -1 })
        .lean(),
      User.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      page: paginationParams.page,
      limit: paginationParams.limit,
      total,
      totalPages: Math.ceil(total / paginationParams.limit),
      data: users,
    });

  } catch (error) {
    console.error("GET /accounts error:", error);
    
    // Don't expose internal error details
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}