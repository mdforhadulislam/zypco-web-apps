// D:\New folder\zypco-web-apps\src\app\api\v1\offers\route.ts
import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Offer } from "@/server/models/Offer.model";
import { NextRequest } from "next/server";

type GetQuery = {
  isActive?: string;
  targetUsers?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const q: GetQuery = Object.fromEntries(url.searchParams.entries());

    const page = Math.max(1, parseInt(q.page || "1"));
    const limit = Math.max(1, Math.min(200, parseInt(q.limit || "20")));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (q.isActive !== undefined) query.isActive = q.isActive === "true";
    if (q.targetUsers) query.targetUsers = q.targetUsers;
    if (q.search) {
      const s = q.search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { description: { $regex: s, $options: "i" } },
      ];
    }

    const allowedSortFields = new Set([
      "createdAt",
      "validFrom",
      "validUntil",
      "name",
    ]);
    const sortBy = allowedSortFields.has(q.sortBy || "")
      ? (q.sortBy as string)
      : "createdAt";
    const sortOrder = (q.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

    const total = await Offer.countDocuments(query);
    const offers = await Offer.find(query)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse({
      status: 200,
      message: "Offers fetched successfully",
      data: offers,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to fetch offers";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name)
      return errorResponse({ status: 400, message: "name is required", req });
    if (!body.description)
      return errorResponse({
        status: 400,
        message: "description is required",
        req,
      });
    if (!body.offerDetails)
      return errorResponse({
        status: 400,
        message: "offerDetails is required",
        req,
      });
    if (!body.validFrom)
      return errorResponse({
        status: 400,
        message: "validFrom is required",
        req,
      });
    if (!body.validUntil)
      return errorResponse({
        status: 400,
        message: "validUntil is required",
        req,
      });
    if (!body.createdBy)
      return errorResponse({
        status: 400,
        message: "createdBy is required",
        req,
      });

    const offer = new Offer({
      name: body.name,
      description: body.description,
      offerDetails: body.offerDetails,
      isActive: body.isActive ?? true,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
      targetUsers: body.targetUsers || "all",
      createdBy: body.createdBy,
    });

    await offer.save();

    return successResponse({
      status: 201,
      message: "Offer created successfully",
      data: offer,
      req,
    });
  } catch (error: unknown) {
    const msg =
      error instanceof Error ? error.message : "Failed to create offer";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
