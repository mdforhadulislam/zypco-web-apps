import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Address } from "@/server/models/Address.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // --- Query Params for Filtering ---
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country"); // filter by country
    const city = searchParams.get("city"); // filter by city
    const startDate = searchParams.get("startDate"); // YYYY-MM-DD
    const endDate = searchParams.get("endDate"); // YYYY-MM-DD

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match: any = {};
    if (country) match.country = country;
    if (city) match.city = city;
    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = new Date(startDate);
      if (endDate) match.createdAt.$lte = new Date(endDate);
    }

    // --- Aggregation Pipeline ---
    const analytics = await Address.aggregate([
      { $match: match },
      {
        $facet: {
          totalAddresses: [{ $count: "count" }],

          activeVsDeleted: [
            { $group: { _id: "$isDeleted", count: { $sum: 1 } } },
            {
              $project: {
                _id: 0,
                status: {
                  $cond: [{ $eq: ["$_id", true] }, "Deleted", "Active"],
                },
                count: 1,
              },
            },
          ],

          defaultVsNonDefault: [
            { $group: { _id: "$isDefault", count: { $sum: 1 } } },
            {
              $project: {
                _id: 0,
                type: {
                  $cond: [{ $eq: ["$_id", true] }, "Default", "Non-default"],
                },
                count: 1,
              },
            },
          ],

          countryDistribution: [
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          cityDistribution: [
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],

          growthTrend: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
              $project: {
                year: "$_id.year",
                month: "$_id.month",
                count: 1,
                _id: 0,
              },
            },
          ],
        },
      },
    ]);

    return successResponse({
      status: 200,
      message: "Address analytics fetched successfully",
      data: analytics[0],
      req,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return errorResponse({
      status: 500,
      message: "Failed to fetch address analytics",
      error: error.message,
      req,
    });
  }
}
