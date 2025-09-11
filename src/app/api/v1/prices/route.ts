import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import { Price } from "@/server/models/Price.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";

type GetQuery = {
  from?: string;
  to?: string;
  rateName?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
};

// Helper: validate rates

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateRates(rates: any[]): { valid: boolean; message: string } {
  if (!Array.isArray(rates)) return { valid: false, message: "rate must be an array" };
  for (let i = 0; i < rates.length; i++) {
    const r = rates[i];
    if (!r.name || typeof r.name !== "string") return { valid: false, message: `rate[${i}].name is required` };
    if (r.profitPercentage == null || isNaN(Number(r.profitPercentage))) return { valid: false, message: `rate[${i}].profitPercentage must be a number` };
    if (r.gift == null || isNaN(Number(r.gift))) return { valid: false, message: `rate[${i}].gift must be a number` };
    if (r.price && typeof r.price !== "object") return { valid: false, message: `rate[${i}].price must be an object` };
  }
  return { valid: true, message: "Valid" };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const q: GetQuery = Object.fromEntries(url.searchParams.entries());

    const page = Math.max(1, parseInt(q.page || "1", 10));
    const limit = Math.max(1, Math.min(200, parseInt(q.limit || "20", 10)));
    const skip = (page - 1) * limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (q.from && Types.ObjectId.isValid(q.from)) query.from = new Types.ObjectId(q.from);
    if (q.to && Types.ObjectId.isValid(q.to)) query.to = new Types.ObjectId(q.to);
    if (q.rateName) query["rate.name"] = { $regex: q.rateName, $options: "i" };
    if (q.search) {
      const s = q.search.trim();
      query.$or = [
        { "from.country": { $regex: s, $options: "i" } },
        { "to.country": { $regex: s, $options: "i" } },
      ];
    }

    const allowedSortFields = new Set(["createdAt", "updatedAt", "from", "to"]);
    const sortBy = allowedSortFields.has(q.sortBy || "") ? q.sortBy : "createdAt";
    const sortOrder = (q.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;

    const total = await Price.countDocuments(query);
    const prices = await Price.find(query)
  .sort({ [sortBy as string]: sortOrder })
  .skip(skip)
  .limit(limit)
  .lean();

    return successResponse({
      status: 200,
      message: "Prices fetched successfully",
      data: prices,
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch prices";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = (await req.json()) as any;

    if (!body.from || !Types.ObjectId.isValid(body.from)) return errorResponse({ status: 400, message: "from is required", req });
    if (!body.to || !Types.ObjectId.isValid(body.to)) return errorResponse({ status: 400, message: "to is required", req });

    if (!body.rate || !Array.isArray(body.rate)) return errorResponse({ status: 400, message: "rate array is required", req });

    const validation = validateRates(body.rate);
    if (!validation.valid) return errorResponse({ status: 400, message: validation.message, req });

    const price = new Price(body);
    await price.save();

    return successResponse({ status: 201, message: "Price created successfully", data: price, req });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create price";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}
