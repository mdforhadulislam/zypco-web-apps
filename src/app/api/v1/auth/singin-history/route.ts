// app/api/v1/auth/singin-history/route.ts
import connectDB from "@/config/db";
import { errorResponse, successResponse } from "@/server/common/response";
import {LoginHistory} from "@/server/models/LoginHistory.model";
import { getAuthUser } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const user = await getAuthUser(req);
    if (!user) {
      return errorResponse({
        status: 401,
        message: "Unauthorized",
        error: "NotAuthenticated"
      });
    }

    // Fetch login histories for the user
    const histories = await LoginHistory.find({ user: user._id }).sort({ timestamp: -1 });

    return successResponse({
      status: 200,
      message: "Login histories fetched",
      data: { histories },
    });

  } catch (error) {
    return errorResponse({
      status: 500,
      message: "Server error",
    });
  }
}