import connectDB from "@/config/db";
import { Country } from "@/server/models/Country.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { NextRequest } from "next/server";
 
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const search = url.searchParams.get("search");
    const name = url.searchParams.get("name");
    const code = url.searchParams.get("code");
    const zone = url.searchParams.get("zone");
    const timezone = url.searchParams.get("timezone");
    const phoneCode = url.searchParams.get("phoneCode");
    const isActiveParam = url.searchParams.get("isActive");
    const createdFrom = url.searchParams.get("createdFrom");
    const createdTo = url.searchParams.get("createdTo");

    const sortBy = (url.searchParams.get("sortBy") || "createdAt").trim();
    const sortOrder = (url.searchParams.get("sortOrder") || "desc").toLowerCase() === "asc" ? 1 : -1;

    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10));
    const skip = (page - 1) * limit;

    // Build query object
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (typeof isActiveParam === "string") {
      if (isActiveParam.toLowerCase() === "true") query.isActive = true;
      else if (isActiveParam.toLowerCase() === "false") query.isActive = false;
    }

    if (name) query.name = { $regex: name, $options: "i" };
    if (code) query.code = code.toUpperCase();
    if (zone) query.zone = { $regex: zone, $options: "i" };
    if (timezone) query.timezone = { $regex: timezone, $options: "i" };
    if (phoneCode) query.phoneCode = { $regex: phoneCode, $options: "i" };

    if (createdFrom || createdTo) {
      query.createdAt = {};
      if (createdFrom) {
        const d = new Date(createdFrom);
        if (!isNaN(d.getTime())) query.createdAt.$gte = d;
      }
      if (createdTo) {
        const d = new Date(createdTo);
        if (!isNaN(d.getTime())) query.createdAt.$lte = d;
      }
      // clean empty object
      if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
    }

    if (search) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: "i" } },
        { code: { $regex: s, $options: "i" } },
        { zone: { $regex: s, $options: "i" } },
        { phoneCode: { $regex: s, $options: "i" } },
      ];
    }

    // Validate sortBy allowed fields (prevent injection / invalid field)
    const allowedSortFields = new Set(["name", "code", "createdAt", "updatedAt", "zone"]);
    const finalSortBy = allowedSortFields.has(sortBy) ? sortBy : "createdAt";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortObj: any = {};
    sortObj[finalSortBy] = sortOrder;

    const total = await Country.countDocuments(query);

    const countries = await Country.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    return successResponse({
      status: 200,
      message: "Countries fetched successfully",
      data: countries,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch countries";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

/**
 * POST - create a new country
 * Body fields: name (required), code (required), phoneCode?, flagUrl?, timezone?, zone?, isActive?
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body?.name || !body?.code) {
      return errorResponse({ status: 400, message: "Both 'name' and 'code' are required", req });
    }

    // Normalize code to uppercase
    body.code = String(body.code).trim().toUpperCase();
    if (body.name) body.name = String(body.name).trim();

    // Prevent duplicate (by code or name)
    const existing = await Country.findOne({
      $or: [{ code: body.code }, { name: new RegExp(`^${body.name}$`, "i") }],
    });

    if (existing) {
      return errorResponse({
        status: 409,
        message: "Country with same code or name already exists",
        req,
      });
    }

    const country = new Country({
      name: body.name,
      code: body.code,
      phoneCode: body.phoneCode ?? null,
      flagUrl: body.flagUrl ?? null,
      timezone: body.timezone ?? null,
      zone: body.zone ?? null,
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    });

    await country.save();

    return successResponse({
      status: 201,
      message: "Country created successfully",
      data: country,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create country";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}