import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/server/models/User.model";
import { ApiAccessLog } from "@/server/models/ApiAccessLog.model";
import connectDB from "@/config/db";
import { errorResponse } from "@/server/common/response";

export interface AuthUser {
  id: string;
  phone: string;
  email: string;
  role: "user" | "admin" | "super_admin" | "moderator";
  isActive: boolean;
  isVerified: boolean;
  permissions: string[];
}

export interface AuthRequest extends NextRequest {
  user?: AuthUser;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

// JWT Secret and Refresh Secret
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export class AuthMiddleware {
  /**
   * Extract and verify JWT token from request
   */
  static async extractToken(req: AuthRequest): Promise<string | null> {
    const authHeader = req.headers.get("Authorization");
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    
    // Check for token in cookies (for web clients)
    const tokenFromCookie = req.cookies.get("access_token")?.value;
    if (tokenFromCookie) {
      return tokenFromCookie;
    }
    
    return null;
  }

  /**
   * Verify access token and get user data
   */
  static async verifyAccessToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      await connectDB();
      const user = await User.findById(decoded.userId)
        .populate('permissions')
        .select('-password');
      
      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user._id.toString(),
        phone: user.phone,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        permissions: user.permissions || []
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate access and refresh tokens
   */
  static generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const payload = { userId, type: 'access' };
    const refreshPayload = { userId, type: 'refresh' };

    const accessToken = jwt.sign(payload, JWT_SECRET, { 
      expiresIn: ACCESS_TOKEN_EXPIRY 
    });
    
    const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { 
      expiresIn: REFRESH_TOKEN_EXPIRY 
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verify refresh token
   */
  static async verifyRefreshToken(token: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
      
      if (decoded.type !== 'refresh') {
        return null;
      }

      await connectDB();
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return null;
      }

      return decoded.userId;
    } catch (error) {
      return null;
    }
  }

  /**
   * Authentication middleware
   */
  static async authenticate(req: AuthRequest): Promise<{ success: boolean; response?: NextResponse }> {
    try {
      const token = await this.extractToken(req);
      
      if (!token) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 401,
            message: "Authentication required",
            error: "No access token provided"
          })
        };
      }

      const user = await this.verifyAccessToken(token);
      
      if (!user) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 401,
            message: "Invalid or expired token",
            error: "Authentication failed"
          })
        };
      }

      if (!user.isVerified) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 403,
            message: "Account not verified",
            error: "Please verify your email address"
          })
        };
      }

      // Log API access
      await this.logApiAccess(req, user);
      
      req.user = user;
      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        response: errorResponse({
          req,
          status: 500,
          message: "Authentication error",
          error: "Internal server error"
        })
      };
    }
  }

  /**
   * Role-based authorization
   */
  static authorize(allowedRoles: string[]) {
    return async (req: AuthRequest): Promise<{ success: boolean; response?: NextResponse }> => {
      if (!req.user) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 401,
            message: "Authentication required"
          })
        };
      }

      if (!allowedRoles.includes(req.user.role)) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 403,
            message: "Access denied",
            error: `Required role: ${allowedRoles.join(" or ")}`
          })
        };
      }

      return { success: true };
    };
  }

  /**
   * Permission-based authorization
   */
  static requirePermission(permission: string) {
    return async (req: AuthRequest): Promise<{ success: boolean; response?: NextResponse }> => {
      if (!req.user) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 401,
            message: "Authentication required"
          })
        };
      }

      if (!req.user.permissions.includes(permission) && req.user.role !== 'super_admin') {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 403,
            message: "Permission denied",
            error: `Required permission: ${permission}`
          })
        };
      }

      return { success: true };
    };
  }

  /**
   * Resource ownership validation
   */
  static async validateOwnership(
    req: AuthRequest, 
    resourceId: string, 
    resourceType: string,
    userField: string = 'user'
  ): Promise<{ success: boolean; response?: NextResponse }> {
    if (!req.user) {
      return {
        success: false,
        response: errorResponse({
          req,
          status: 401,
          message: "Authentication required"
        })
      };
    }

    // Super admin and admin can access any resource
    if (['super_admin', 'admin'].includes(req.user.role)) {
      return { success: true };
    }

    try {
      await connectDB();
      
      // Dynamic model import based on resource type
      const models = {
        order: () => import("@/server/models/Order.model").then(m => m.Order),
        address: () => import("@/server/models/Address.model").then(m => m.Address),
        notification: () => import("@/server/models/Notification.model").then(m => m.Notification),
        review: () => import("@/server/models/Review.model").then(m => m.Review),
      };

      const Model = await models[resourceType as keyof typeof models]?.();
      
      if (!Model) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 400,
            message: "Invalid resource type"
          })
        };
      }

      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 404,
            message: "Resource not found"
          })
        };
      }

      const resourceUserId = resource[userField]?.toString();
      
      if (resourceUserId !== req.user.id) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 403,
            message: "Access denied",
            error: "You can only access your own resources"
          })
        };
      }

      return { success: true };
      
    } catch (error) {
      return {
        success: false,
        response: errorResponse({
          req,
          status: 500,
          message: "Authorization error",
          error: "Failed to validate resource ownership"
        })
      };
    }
  }

  /**
   * Phone number validation for user routes
   */
  static async validatePhoneAccess(
    req: AuthRequest, 
    phone: string
  ): Promise<{ success: boolean; response?: NextResponse }> {
    if (!req.user) {
      return {
        success: false,
        response: errorResponse({
          req,
          status: 401,
          message: "Authentication required"
        })
      };
    }

    // Super admin and admin can access any user's data
    if (['super_admin', 'admin'].includes(req.user.role)) {
      return { success: true };
    }

    // Users can only access their own data
    if (req.user.phone !== phone) {
      return {
        success: false,
        response: errorResponse({
          req,
          status: 403,
          message: "Access denied",
          error: "You can only access your own account data"
        })
      };
    }

    return { success: true };
  }

  /**
   * Log API access for security monitoring
   */
  static async logApiAccess(req: AuthRequest, user: AuthUser): Promise<void> {
    try {
      await connectDB();
      
      const log = new ApiAccessLog({
        userId: user.id,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date(),
        statusCode: 200 // Will be updated by response middleware
      });

      await log.save();
    } catch (error) {
      console.error('Failed to log API access:', error);
    }
  }
}

/**
 * Middleware wrapper for Next.js API routes
 */
export function withAuth(allowedRoles?: string[], requiredPermissions?: string[]) {
  return function (handler: Function) {
    return async function (req: AuthRequest, res: NextResponse) {
      // Authenticate user
      const authResult = await AuthMiddleware.authenticate(req);
      if (!authResult.success && authResult.response) {
        return authResult.response;
      }

      // Check roles if specified
      if (allowedRoles && allowedRoles.length > 0) {
        const roleResult = await AuthMiddleware.authorize(allowedRoles)(req);
        if (!roleResult.success && roleResult.response) {
          return roleResult.response;
        }
      }

      // Check permissions if specified
      if (requiredPermissions && requiredPermissions.length > 0) {
        for (const permission of requiredPermissions) {
          const permResult = await AuthMiddleware.requirePermission(permission)(req);
          if (!permResult.success && permResult.response) {
            return permResult.response;
          }
        }
      }

      return handler(req, res);
    };
  };
}