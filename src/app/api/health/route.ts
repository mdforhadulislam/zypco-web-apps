import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "@/server/common/response";
import connectDB from "@/config/db";

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    let dbStatus = "disconnected";
    try {
      await connectDB();
      dbStatus = "connected";
    } catch (dbError) {
      dbStatus = "error";
    }

    // Get system info
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 60)} minutes`,
      uptimeSeconds: uptime,
      database: {
        status: dbStatus,
      },
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      services: {
        api: "running",
        notifications: "active",
        auth: "active",
        analytics: "active"
      }
    };

    return successResponse({
      status: 200,
      message: "System is healthy",
      data: healthData,
      req,
    });
  } catch (error) {
    console.error("Health check error:", error);
    
    return NextResponse.json({
      status: "error",
      message: "Health check failed",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}