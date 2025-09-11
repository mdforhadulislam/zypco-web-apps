import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import { Order } from "@/server/models/Order.model";
import { successResponse, errorResponse } from "@/server/common/response";
import { Types } from "mongoose";

type GetQuery = {
  trackId?: string;
  priority?: string;
  orderType?: string;
  from?: string;
  to?: string;
  createdFrom?: string;
  createdTo?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
};
 
function validateAndFixItems(items: any[]): { valid: boolean; message?: string } {
  if (!Array.isArray(items)) return { valid: false, message: "parcel.item must be an array" };

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (!it || typeof it !== "object") return { valid: false, message: `parcel.item[${i}] invalid` };

    if (!it.name || typeof it.name !== "string" || !it.name.trim()) {
      return { valid: false, message: `parcel.item[${i}].name is required` };
    }

    if (it.quantity == null || Number.isNaN(Number(it.quantity)) || Number(it.quantity) <= 0) {
      return { valid: false, message: `parcel.item[${i}].quantity must be a positive number` };
    }

    if (it.unitPrice == null || Number.isNaN(Number(it.unitPrice)) || Number(it.unitPrice) < 0) {
      return { valid: false, message: `parcel.item[${i}].unitPrice must be a non-negative number` };
    }

    // Ensure totalPrice exists and is correct
    const qty = Number(it.quantity);
    const unit = Number(it.unitPrice);
    const computed = qty * unit;
    // if totalPrice missing or differs, set it to computed
    if (it.totalPrice == null || Number(it.totalPrice) !== computed) {
      it.totalPrice = computed;
    }
  }

  return { valid: true };
}
 
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const q: GetQuery = Object.fromEntries(url.searchParams.entries());

    const page = Math.max(1, parseInt(q.page || "1", 10));
    const limit = Math.max(1, Math.min(200, parseInt(q.limit || "10", 10))); // cap limit to 200
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (q.trackId) {
      // allow both exact and partial (if user wants)
      const t = q.trackId.trim();
      if (t.includes("*") || t.includes("%")) {
        // convert wildcard to regex
        const pattern = t.replace(/\*/g, ".*").replace(/%/g, ".*");
        query.trackId = { $regex: pattern, $options: "i" };
      } else {
        query.trackId = t;
      }
    }

    if (q.priority) query["parcel.priority"] = q.priority;
    if (q.orderType) query["parcel.orderType"] = q.orderType;
    

    if (q.createdFrom || q.createdTo) {
      query.createdAt = {};
      if (q.createdFrom) {
        const d = new Date(q.createdFrom);
        if (!isNaN(d.getTime())) query.createdAt.$gte = d;
      }
      if (q.createdTo) {
        const d = new Date(q.createdTo);
        if (!isNaN(d.getTime())) query.createdAt.$lte = d;
      }
      if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
    }

    if (q.search) {
      const s = q.search.trim();
      query.$or = [
        { trackId: { $regex: s, $options: "i" } },
        { "parcel.sender.name": { $regex: s, $options: "i" } },
        { "parcel.receiver.name": { $regex: s, $options: "i" } },
      ];
    }

    // Sorting
    const allowedSortFields = new Set(["createdAt", "orderDate", "trackId", "parcel.priority"]);
    const sortBy = allowedSortFields.has(q.sortBy || "") ? (q.sortBy as string) : "createdAt";
    const sortOrder = (q.sortOrder || "desc").toLowerCase() === "asc" ? 1 : -1;
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).sort(sortObj).skip(skip).limit(limit).lean();

    return successResponse({
      status: 200,
      message: "Orders fetched successfully",
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to fetch orders";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}

/**
 * POST - create a new order
 * Required: parcel (with from, to, weight)
 * Optional: payment (if not provided we create a sensible default)
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = (await req.json()) as any;

    // Validate parcel existence
    if (!body || !body.parcel || typeof body.parcel !== "object") {
      return errorResponse({ status: 400, message: "Parcel information is required", req });
    }

    const parcel = body.parcel as Record<string, any>;

    // Validate required parcel fields
    if (!parcel.from) {
      return errorResponse({ status: 400, message: "parcel.from is required", req });
    }
    if (!parcel.to) {
      return errorResponse({ status: 400, message: "parcel.to is required", req });
    }
    if (!parcel.weight && parcel.weight !== 0) {
      return errorResponse({ status: 400, message: "parcel.weight is required", req });
    }

    // If items provided, validate each
    if (parcel.item) {
      const validation = validateAndFixItems(parcel.item);
      if (!validation.valid) {
        return errorResponse({ status: 400, message: validation.message || "Invalid parcel.item", req });
      }
      // propagate fixed items back
      body.parcel.item = parcel.item;
    }

    // If payment not provided, create default
    if (!body.payment || typeof body.payment !== "object") {
      body.payment = {
        pType: "not-set",
        pAmount: 0,
        pOfferDiscount: 0,
        pExtraCharge: 0,
        pDiscount: 0,
        pReceived: 0,
        pRefunded: 0,
      };
    } else {
      // coerce numeric fields
      const numericFields = ["pAmount", "pOfferDiscount", "pExtraCharge", "pDiscount", "pReceived", "pRefunded"];
      for (const f of numericFields) {
        if (body.payment[f] == null || Number.isNaN(Number(body.payment[f]))) {
          body.payment[f] = 0;
        } else {
          body.payment[f] = Number(body.payment[f]);
        }
      }
      if (!body.payment.pType) body.payment.pType = "not-set";
    }

    // Construct order document and save
    const order = new Order(body);
    await order.save();

    return successResponse({
      status: 201,
      message: "Order created successfully",
      data: order,
      req,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create order";
    return errorResponse({ status: 500, message: msg, error, req });
  }
}