import { NextRequest, NextResponse } from "next/server";
import { User } from "@/server/models/User.model";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler } from "@/lib/utils/apiHelpers";

export const POST = createApiHandler({
  auth: { required: true },
  rateLimit: 'general'
})(async (req) => {
  try {
    await connectDB();
    
    const user = req.user!;
    const ipAddress = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Log logout
    const loginHistory = new LoginHistory({
      user: user.id,
      phone: user.phone,
      ipAddress,
      userAgent,
      success: true,
      action: 'logout',
      timestamp: new Date()
    });

    await loginHistory.save();

    // In a production environment with Redis, you would:
    // 1. Blacklist the current JWT token
    // 2. Remove refresh token from storage
    // 3. Clear any cached user sessions

    // For now, we'll just log the logout
    console.log(`User logged out: ${user.phone} from IP: ${ipAddress}`);

    return successResponse({
      req,
      status: 200,
      message: "Logged out successfully",
      data: {
        loggedOut: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Signout error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Logout failed",
      error: "An error occurred during logout"
    });
  }
});

// OPTIONS method for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}