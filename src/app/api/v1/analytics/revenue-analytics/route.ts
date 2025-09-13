// D:\New folder\zypco-web-apps\src\app\api\v1\analytics\revenue-analytics\route.ts
import mongoose from "mongoose";
import { NextRequest } from "next/server";
import connectDB from "@/config/db";
import { Order } from "@/server/models/Order.model";
import { errorResponse, successResponse } from "@/server/common/response";


/**
 * Revenue & Profitability Analytics
 * - Monthly revenue growth (monthly sums)
 * - Profit margin by courier provider (approx: revenue - handover.payment - refunds)
 * - Top 10 high-value customers (shipment count + total revenue)
 * - Refund & compensation cost percentage
 * - Payment method usage distribution
 *
 * Query params (all optional):
 *  - startDate=YYYY-MM-DD
 *  - endDate=YYYY-MM-DD
 *  - fromCountry=<countryId>
 *  - toCountry=<countryId>
 *  - courier=<handover company name>
 *  - paymentMethod=<pType>
 *  - limit=<number>
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const params = url.searchParams;

    const startDateParam = params.get("startDate");
    const endDateParam = params.get("endDate");
    const fromCountry = params.get("fromCountry");
    const toCountry = params.get("toCountry");
    const courierFilter = params.get("courier"); // handover_by.company
    const paymentMethod = params.get("paymentMethod"); // payment.pType
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
    if (fromCountry) {
      try {
        match["parcel.from"] = new mongoose.Types.ObjectId(fromCountry);
      } catch {
        match["parcel.from"] = fromCountry;
      }
    }
    if (toCountry) {
      try {
        match["parcel.to"] = new mongoose.Types.ObjectId(toCountry);
      } catch {
        match["parcel.to"] = toCountry;
      }
    }
    if (courierFilter) {
      match["handover_by.company"] = courierFilter;
    }
    if (paymentMethod) {
      match["payment.pType"] = paymentMethod;
    }

    // build pipeline
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pipeline: any[] = [];
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });

    // lookup track to compute delivery times and status
    pipeline.push({
      $lookup: {
        from: "tracks",
        localField: "trackId",
        foreignField: "trackId",
        as: "track",
      },
    });
    pipeline.push({ $addFields: { track: { $arrayElemAt: ["$track", 0] } } });

    // try to convert weight to number (may be string)
    pipeline.push({
      $addFields: {
        weightNum: {
          $convert: { input: "$parcel.weight", to: "double", onError: null, onNull: null },
        },
      },
    });

    // extract picked-up and delivered timestamps from track.history (if present)
    pipeline.push({
      $addFields: {
        _pickedAt: {
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
        _deliveredAt: {
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
            { $and: ["$_pickedAt", "$_deliveredAt"] },
            { $divide: [{ $subtract: ["$_deliveredAt", "$_pickedAt"] }, 1000 * 60 * 60] },
            null,
          ],
        },
      },
    });

    // One aggregated call with facets to get everything in one roundtrip
    pipeline.push({
      $facet: {
        // 1. Revenue totals & refunds
        revenueSummary: [
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
              totalRefunds: { $sum: { $ifNull: ["$payment.pRefunded", 0] } },
              totalOfferDiscounts: { $sum: { $ifNull: ["$payment.pOfferDiscount", 0] } },
              totalExtraCharges: { $sum: { $ifNull: ["$payment.pExtraCharge", 0] } },
              totalOrders: { $sum: 1 },
            },
          },
        ],

        // 2. Monthly revenue growth (by orderDate)
        monthlyRevenue: [
          {
            $group: {
              _id: { year: { $year: "$orderDate" }, month: { $month: "$orderDate" } },
              revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
              orders: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
          {
            $project: {
              _id: 0,
              year: "$_id.year",
              month: "$_id.month",
              revenue: 1,
              orders: 1,
            },
          },
        ],

        // 3. Profit margin by courier (approx: revenue - handover.payment - refunds_for_orders_handled_by_courier)
        marginByCourier: [
          {
            $group: {
              _id: "$handover_by.company",
              revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
              handoverCost: { $sum: { $ifNull: ["$handover_by.payment", 0] } },
              refunds: { $sum: { $ifNull: ["$payment.pRefunded", 0] } },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              courier: { $ifNull: ["$_id", "Unknown"] },
              revenue: 1,
              handoverCost: 1,
              refunds: 1,
              count: 1,
              grossProfit: { $subtract: [{ $subtract: ["$revenue", "$handoverCost"] }, "$refunds"] },
            },
          },
          {
            $project: {
              courier: 1,
              revenue: 1,
              handoverCost: 1,
              refunds: 1,
              count: 1,
              grossProfit: 1,
              profitMarginPercent: {
                $cond: [
                  { $gt: ["$revenue", 0] },
                  { $multiply: [{ $divide: ["$grossProfit", "$revenue"] }, 100] },
                  0,
                ],
              },
            },
          },
          { $sort: { revenue: -1 } },
        ],

        // 4. Payment method usage
        paymentMethods: [
          {
            $group: {
              _id: "$payment.pType",
              count: { $sum: 1 },
              totalReceived: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
            },
          },
          { $sort: { count: -1 } },
        ],

        // 5. Top customers (by shipments and revenue) - using sender.email
        topCustomers: [
          {
            $group: {
              _id: "$parcel.sender.email",
              name: { $first: "$parcel.sender.name" },
              shipments: { $sum: 1 },
              revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
            },
          },
          { $sort: { revenue: -1, shipments: -1 } },
          { $limit: Math.max(limitParam, 10) },
        ],

        // 6. Average delivery time by courier (in hours)
        avgDeliveryByCourier: [
          {
            $match: { deliveryHours: { $ne: null } },
          },
          {
            $group: {
              _id: "$handover_by.company",
              avgDeliveryHours: { $avg: "$deliveryHours" },
              p95DeliveryHours: { $avg: "$deliveryHours" }, // placeholder: Mongo can't compute p95 easily without more pipeline; keeping avg only
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              courier: { $ifNull: ["$_id", "Unknown"] },
              avgDeliveryHours: 1,
              count: 1,
            },
          },
          { $sort: { avgDeliveryHours: 1 } },
        ],

        // 7. Failed / returned shipments trend (by day)
        failedTrend: [
          {
            $match: {
              $or: [{ "track.currentStatus": "failed" }, { "track.currentStatus": "cancelled" }],
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],

        // 8. Refund & compensation - top refunded orders
        topRefunds: [
          {
            $match: { "payment.pRefunded": { $gt: 0 } },
          },
          {
            $project: {
              trackId: 1,
              refunded: "$payment.pRefunded",
              received: "$payment.pReceived",
              sender: "$parcel.sender",
              receiver: "$parcel.receiver",
              orderDate: 1,
            },
          },
          { $sort: { refunded: -1 } },
          { $limit: Math.max(limitParam, 10) },
        ],

        // 9. Revenue by destination country
        revenueByCountry: [
          {
            $group: {
              _id: "$parcel.to",
              revenue: { $sum: { $ifNull: ["$payment.pReceived", 0] } },
              count: { $sum: 1 },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: Math.max(limitParam, 20) },
          {
            $lookup: {
              from: "countries",
              localField: "_id",
              foreignField: "_id",
              as: "country",
            },
          },
          {
            $project: {
              countryId: "$_id",
              countryName: { $arrayElemAt: ["$country.name", 0] },
              revenue: 1,
              count: 1,
            },
          },
        ],
      },
    });

    const agg = await Order.aggregate(pipeline);
    const r = agg[0] || {};

    // Normalize & compute derived KPIs
    const revenueSummary = r.revenueSummary?.[0] || {
      totalRevenue: 0,
      totalRefunds: 0,
      totalOfferDiscounts: 0,
      totalExtraCharges: 0,
      totalOrders: 0,
    };

    const refundPercentage =
      revenueSummary.totalRevenue > 0
        ? (revenueSummary.totalRefunds / revenueSummary.totalRevenue) * 100
        : 0;

    const analytics = {
      revenueSummary: {
        totalRevenue: revenueSummary.totalRevenue,
        totalRefunds: revenueSummary.totalRefunds,
        totalOfferDiscounts: revenueSummary.totalOfferDiscounts,
        totalExtraCharges: revenueSummary.totalExtraCharges,
        totalOrders: revenueSummary.totalOrders,
        refundPercentage,
      },
      monthlyRevenue: r.monthlyRevenue || [],
      marginByCourier: r.marginByCourier || [],
      paymentMethods: r.paymentMethods || [],
      topCustomers: r.topCustomers || [],
      avgDeliveryByCourier: r.avgDeliveryByCourier || [],
      failedTrend: r.failedTrend || [],
      topRefunds: r.topRefunds || [],
      revenueByCountry: r.revenueByCountry || [],
      filters: {
        startDate: startDateParam,
        endDate: endDateParam,
        fromCountry,
        toCountry,
        courier: courierFilter,
        paymentMethod,
        limit: limitParam,
      },
    };

    return successResponse({
      status: 200,
      message: "Revenue analytics fetched successfully",
      data: analytics,
      req,
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Revenue Analytics Error:", err);
    return errorResponse({
      status: 500,
      message: "Failed to fetch revenue analytics",
      error: err.message || err,
      req,
    });
  }
}
