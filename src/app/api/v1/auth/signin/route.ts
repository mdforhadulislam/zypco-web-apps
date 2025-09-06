import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/server/models/User.model";
import { LoginHistory } from "@/server/models/LoginHistory.model";
import connectDB from "@/config/db";
import { successResponse, errorResponse } from "@/server/common/response";
import { createApiHandler } from "@/lib/utils/apiHelpers";
import { userSchemas } from "@/lib/middleware/validation";
import { AuthMiddleware } from "@/lib/middleware/auth";
import { notificationService } from "@/services/notificationService";

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export const POST = createApiHandler({
  auth: { required: false },
  validation: { body: userSchemas.login },
  rateLimit: 'auth'
})(async (req) => {
  try {
    await connectDB();
    
    const { phone, password } = req.validatedData!.body;
    const ipAddress = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Find user by phone
    const user = await User.findOne({ phone }).select('+password');
    
    if (!user) {
      // Log failed attempt
      await logLoginAttempt(null, phone, ipAddress, userAgent, false, 'User not found');
      
      return errorResponse({
        req,
        status: 401,
        message: "Invalid phone number or password",
        error: "Authentication failed"
      });
    }

    // Check if account is locked
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
      
      return errorResponse({
        req,
        status: 423,
        message: "Account temporarily locked",
        error: `Too many failed attempts. Try again in ${remainingTime} minutes.`
      });
    }

    // Check if account is active
    if (!user.isActive) {
      await logLoginAttempt(user._id, phone, ipAddress, userAgent, false, 'Account inactive');
      
      return errorResponse({
        req,
        status: 403,
        message: "Account deactivated",
        error: "Your account has been deactivated. Please contact support."
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      
      // Lock account if too many attempts
      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION);
        
        // Send security alert
        await notificationService.sendAuthNotification(
          { phone: user.phone, email: user.email, name: user.name },
          'account_locked'
        );
      }
      
      await user.save();
      await logLoginAttempt(user._id, phone, ipAddress, userAgent, false, 'Invalid password');
      
      return errorResponse({
        req,
        status: 401,
        message: "Invalid phone number or password",
        error: "Authentication failed"
      });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT tokens
    const tokens = AuthMiddleware.generateTokens(user._id.toString());

    // Log successful login
    await logLoginAttempt(user._id, phone, ipAddress, userAgent, true);

    // Send login notification if from new location/device
    const isNewDevice = await checkNewDevice(user._id, userAgent, ipAddress);
    if (isNewDevice) {
      await notificationService.sendAuthNotification(
        { phone: user.phone, email: user.email, name: user.name },
        'login_alert'
      );
    }

    return successResponse({
      req,
      status: 200,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          preferences: user.preferences,
          lastLogin: user.lastLogin
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: process.env.JWT_EXPIRES_IN || "15m"
        }
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    
    return errorResponse({
      req,
      status: 500,
      message: "Login failed",
      error: "An error occurred during authentication"
    });
  }
});

/**
 * Log login attempt
 */
async function logLoginAttempt(
  userId: any,
  phone: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  failureReason?: string
): Promise<void> {
  try {
    const loginHistory = new LoginHistory({
      user: userId,
      phone,
      ipAddress,
      userAgent,
      success,
      failureReason,
      timestamp: new Date()
    });

    await loginHistory.save();
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
}

/**
 * Check if this is a new device/location
 */
async function checkNewDevice(
  userId: any,
  userAgent: string,
  ipAddress: string
): Promise<boolean> {
  try {
    const recentLogin = await LoginHistory.findOne({
      user: userId,
      success: true,
      userAgent,
      ipAddress,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    return !recentLogin;
  } catch (error) {
    console.error('Failed to check device history:', error);
    return false;
  }
}

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