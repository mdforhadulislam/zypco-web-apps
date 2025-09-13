// D:\New folder\zypco-web-apps\src\app\api\v1\analytics\countries-analytics\route.ts 

import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import { Country } from "@/server/models/Country.model";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    // 1️⃣ Total countries count
    const totalCountries = await Country.countDocuments();

    // 2️⃣ Active vs Inactive countries
    const activeInactiveBreakdown = await Country.aggregate([
      {
        $group: {
          _id: "$isActive",
          count: { $sum: 1 },
        },
      },
    ]);

    // 3️⃣ Zone-wise country count
    const zoneBreakdown = await Country.aggregate([
      {
        $group: {
          _id: "$zone",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 4️⃣ Timezone distribution
    const timezoneBreakdown = await Country.aggregate([
      {
        $group: {
          _id: "$timezone",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const analytics = {
      totalCountries,
      activeInactiveBreakdown,
      zoneBreakdown,
      timezoneBreakdown,
    };

    return successResponse({
      status: 200,
      message: "Country analytics fetched successfully",
      data: analytics,
      req,
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Country Analytics Error:", error);
    return errorResponse({
      status: 500,
      message: "Failed to fetch country analytics",
      error,
      req,
    });
  }
}
