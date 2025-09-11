import connectDB from "@/config/db";
import { Blog, IBlog } from "@/server/models/Blog.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { NextRequest } from "next/server";

// =========================
// POST - Create Blog
// =========================
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const blog = new Blog(body);
    await blog.save();

    return successResponse({
      status: 201,
      message: "Blog created successfully",
      data: blog,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create blog";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

// =========================
// GET - Fetch All Blogs
// =========================
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const isPublished = url.searchParams.get("isPublished");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (isPublished !== null) query.isPublished = isPublished === "true";

    if (search) {
      query.$or = [
        { title: new RegExp(search, "i") },
        { content: new RegExp(search, "i") },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const total = await Blog.countDocuments(query);

    const blogs: IBlog[] = await Blog.find(query)
      .populate("author", "name email")
      .populate("relatedService", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse({
      status: 200,
      message: "Blogs fetched successfully",
      data: blogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch blogs";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
