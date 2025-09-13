// D:\New folder\zypco-web-apps\src\app\api\v1\analytics\order-analytics\route.ts
import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Order } from "@/server/models/Order.model";
import { NextRequest } from "next/server";

import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const params = url.searchParams;

    // Filters
    const startDateParam = params.get("startDate"); // orderDate start
    const endDateParam = params.get("endDate"); // orderDate end
    const toCountry = params.get("toCountry"); // Country _id (string)
    const fromCountry = params.get("fromCountry");
    const orderType = params.get("orderType"); // document | parcel | e-commerce
    const statusFilter = params.get("status"); // from track currentStatus or order fields
    const limitParam = parseInt(params.get("limit") || "10", 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match: any = {};
    if (startDateParam) {
      match.orderDate = { $gte: new Date(startDateParam) };
    }
    if (endDateParam) {
      const ed = new Date(endDateParam);
      ed.setHours(23, 59, 59, 999);
      match.orderDate = match.orderDate || {};
      match.orderDate.$lte = ed;
    }
    if (toCountry) {
      // assume toCountry is Country _id string
      try {
        match["parcel.to"] = new mongoose.Types.ObjectId(toCountry);
      } catch {
        match["parcel.to"] = toCountry;
      }
    }
    if (fromCountry) {
      try {
        match["parcel.from"] = new mongoose.Types.ObjectId(fromCountry);
      } catch {
        match["parcel.from"] = fromCountry;
      }
    }
    if (orderType) {
      match["parcel.orderType"] = orderType;
    }

    // Build aggregation pipeline

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [];
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });

    pipeline.push({
      $lookup: {
        from: "tracks",
        localField: "trackId",
        foreignField: "trackId",
        as: "track",
      },
    });

    // flatten track (may be empty)
    pipeline.push({
      $addFields: {
        track: { $arrayElemAt: ["$track", 0] },
      },
    });

    // convert weight where possible
    pipeline.push({
      $addFields: {
        // try to convert parcel.weight to double; onError -> null
        weightNum: {
          $convert: {
            input: "$parcel.weight",
            to: "double",
            onError: null,
            onNull: null,
          },
        },
      },
    });

    // compute delivery time in hours (delivered_timestamp - pickup_timestamp)
    pipeline.push({
      $addFields: {
        _pickupTimestamp: {
          $let: {
            vars: {
              picked: {
                $filter: {
                  input: { $ifNull: ["$track.history", []] },
                  cond: { $eq: ["$$this.status", "picked-up"] },
                },
              },
            },
            in: { $arrayElemAt: ["$$picked.timestamp", 0] },
          },
        },
        _deliveredTimestamp: {
          $let: {
            vars: {
              del: {
                $filter: {
                  input: { $ifNull: ["$track.history", []] },
                  cond: { $eq: ["$$this.status", "delivered"] },
                },
              },
            },
            in: { $arrayElemAt: ["$$del.timestamp", 0] },
          },
        },
      },
    });

    pipeline.push({
      $addFields: {
        deliveryHours: {
          $cond: [
            { $and: ["$_pickupTimestamp", "$_deliveredTimestamp"] },
            {
              $divide: [
                { $subtract: ["$_deliveredTimestamp", "$_pickupTimestamp"] },
                1000 * 60 * 60,
              ],
            },
            null,
          ],
        },
      },
    });

    // Now facet for all metrics in one db call
    pipeline.push({
      $facet: {
        // total orders & by type/status
        totalOrders: [{ $count: "count" }],
        ordersByType: [
          { $group: { _id: "$parcel.orderType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],

        // revenue numbers
        revenueSummary: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$payment.pReceived" },
              totalRefunds: { $sum: "$payment.pRefunded" },
              avgOrderValue: { $avg: "$payment.pReceived" },
            },
          },
        ],

        // payment method usage
        paymentMethods: [
          {
            $group: {
              _id: "$payment.pType",
              count: { $sum: 1 },
              total: { $sum: "$payment.pReceived" },
            },
          },
          { $sort: { count: -1 } },
        ],

        // top destination countries (to)
        topDestinations: [
          {
            $group: {
              _id: "$parcel.to",
              count: { $sum: 1 },
              revenue: { $sum: "$payment.pReceived" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: Math.max(limitParam, 10) },
          {
            $lookup: {
              from: "countries",
              localField: "_id",
              foreignField: "_id",
              as: "country",
            },
          },
          { $unwind: { path: "$country", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              _id: 0,
              countryId: "$_id",
              countryName: { $ifNull: ["$country.name", "$_id"] },
              count: 1,
              revenue: 1,
            },
          },
        ],

        // weight category buckets (0–0.5kg, 0.5–1kg, 1–5kg, 5kg+)
        weightBuckets: [
          {
            $bucket: {
              groupBy: "$weightNum",
              boundaries: [0, 0.5, 1, 5, Number.POSITIVE_INFINITY],
              default: "unknown",
              output: { count: { $sum: 1 } },
            },
          },
        ],

        // average delivery time by route (from->to) & by handover company
        avgDeliveryByRoute: [
          {
            $group: {
              _id: {
                from: "$parcel.from",
                to: "$parcel.to",
                handover: "$handover_by.company",
              },
              avgDeliveryHours: { $avg: "$deliveryHours" },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: Math.max(limitParam, 20) },
          {
            $lookup: {
              from: "countries",
              localField: "_id.from",
              foreignField: "_id",
              as: "fromCountry",
            },
          },
          {
            $lookup: {
              from: "countries",
              localField: "_id.to",
              foreignField: "_id",
              as: "toCountry",
            },
          },
          {
            $project: {
              _id: 0,
              fromId: "$_id.from",
              fromName: { $arrayElemAt: ["$fromCountry.name", 0] },
              toId: "$_id.to",
              toName: { $arrayElemAt: ["$toCountry.name", 0] },
              handover: "$_id.handover",
              avgDeliveryHours: 1,
              count: 1,
            },
          },
        ],

        // failed / returned shipments trend (by day)
        failedTrend: [
          {
            $match: {
              $or: [
                { "track.currentStatus": "failed" },
                { "track.currentStatus": "cancelled" },
              ],
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],

        // top customers by shipments & revenue (use parcel.sender.email)
        topCustomers: [
          {
            $group: {
              _id: "$parcel.sender.email",
              name: { $first: "$parcel.sender.name" },
              shipments: { $sum: 1 },
              revenue: { $sum: "$payment.pReceived" },
            },
          },
          { $sort: { shipments: -1, revenue: -1 } },
          { $limit: Math.max(limitParam, 10) },
        ],
      },
    });

    const agg = await Order.aggregate(pipeline);
    const r = agg[0] || {};

    // Normalize results
    const analytics = {
      totalOrders: r.totalOrders?.[0]?.count || 0,
      ordersByType: r.ordersByType || [],
      revenueSummary: r.revenueSummary?.[0] || {
        totalRevenue: 0,
        totalRefunds: 0,
        avgOrderValue: 0,
      },
      paymentMethods: r.paymentMethods || [],
      topDestinations: r.topDestinations || [],
      weightBuckets: r.weightBuckets || [],
      avgDeliveryByRoute: r.avgDeliveryByRoute || [],
      failedTrend: r.failedTrend || [],
      topCustomers: r.topCustomers || [],
      filters: {
        startDate: startDateParam,
        endDate: endDateParam,
        toCountry,
        fromCountry,
        orderType,
        status: statusFilter,
        limit: limitParam,
      },
    };

    return successResponse({
      status: 200,
      message: "Order analytics fetched successfully",
      data: analytics,
      req,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Order Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch order analytics",
      error: err.message || err,
      req,
    });
  }
}
