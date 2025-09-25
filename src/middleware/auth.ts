import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "@/server/models/User.model";
import { ApiAccessLog } from "@/server/models/ApiAccessLog.model";
import connectDB from "@/config/db";
import { errorResponse } from "@/server/common/response";

export interface AuthUser {
  id: string;
  phone: string;
  email: string;
  name: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  isVerified: boolean;
  permissions?: string[];
}

export interface AuthRequest extends NextRequest {
  user?: AuthUser;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

// JWT Secrets - consistent with updated auth system
const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

export interface TokenPayload extends JwtPayload {
  id: string;
  role: string;
  type?: string;
}

export class AuthMiddleware {
  /**
   * Extract and verify JWT token from request
   */
  static async extractToken(req: AuthRequest): Promise<string | null> {
    // Priority: Authorization header > cookies
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    
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
   * Verify access token and get user data - Updated for consistency
   */
  static async verifyAccessToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
      
      // Validate token structure
      if (!decoded.id || !decoded.role) {
        return null;
      }
      
      // Ensure it's an access token (if type is specified)
      if (decoded.type && decoded.type !== 'access') {
        return null;
      }
      
      await connectDB();
      const user = await User.findById(decoded.id)
        .select('-password -refreshTokens -emailVerification.code')
        .lean();
      
      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user._id.toString(),
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        permissions: [] // Add permissions logic if needed
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Generate access and refresh tokens - Updated structure
   */
  static generateTokens(userId: string, role: string): { accessToken: string; refreshToken: string } {
    const accessPayload: TokenPayload = { 
      id: userId, 
      role, 
      type: 'access' 
    };
    
    const refreshPayload: TokenPayload = { 
      id: userId, 
      role, 
      type: 'refresh' 
    };

    const accessToken = jwt.sign(accessPayload, JWT_SECRET, { 
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'zypco-api',
      audience: 'zypco-client'
    });
    
    const refreshToken = jwt.sign(refreshPayload, REFRESH_TOKEN_SECRET, { 
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'zypco-api',
      audience: 'zypco-client'
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verify refresh token - Updated for consistency
   */
  static async verifyRefreshToken(token: string): Promise<{ userId: string; role: string } | null> {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
      
      // Validate token structure and type
      if (!decoded.id || !decoded.role || (decoded.type && decoded.type !== 'refresh')) {
        return null;
      }

      await connectDB();
      const user = await User.findById(decoded.id).select('isActive refreshTokens');
      
      if (!user || !user.isActive) {
        return null;
      }

      // Optionally check if refresh token exists in user's stored tokens
      if (user.refreshTokens && !user.refreshTokens.includes(token)) {
        return null;
      }

      return { 
        userId: decoded.id, 
        role: decoded.role 
      };
    } catch (error) {
      console.error('Refresh token verification failed:', error);
      return null;
    }
  }

  /**
   * Authentication middleware
   */
  static async authenticate(req: AuthRequest): Promise<{ success: boolean; user?: AuthUser; response?: NextResponse }> {
    try {
      const token = await this.extractToken(req);
      
      if (!token) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 401,
            message: "Authentication required - No access token provided"
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
            message: "Invalid or expired access token"
          })
        };
      }

      if (!user.isVerified) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 403,
            message: "Account not verified - Please verify your email address"
          })
        };
      }

      // Log API access for security monitoring
      await this.logApiAccess(req, user);
      
      req.user = user;
      return { success: true, user };
      
    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        response: errorResponse({
          req,
          status: 500,
          message: "Internal authentication error"
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
            message: "Authentication required for authorization"
          })
        };
      }

      if (!allowedRoles.includes(req.user.role)) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 403,
            message: "Access denied - Insufficient permissions",
            details: `Required role: ${allowedRoles.join(" or ")}`
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
            message: "Authentication required for permission check"
          })
        };
      }

      const hasPermission = req.user.permissions?.includes(permission) || 
                           ['admin', 'super_admin'].includes(req.user.role);

      if (!hasPermission) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 403,
            message: "Permission denied",
            details: `Required permission: ${permission}`
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
          message: "Authentication required for ownership validation"
        })
      };
    }

    // Admin users can access any resource
    if (['admin', 'super_admin'].includes(req.user.role)) {
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
        pickup: () => import("@/server/models/Pickup.model").then(m => m.Pickup),
        apiconfig: () => import("@/server/models/ApiConfig.model").then(m => m.ApiConfig),
      };

      const Model = await models[resourceType as keyof typeof models]?.();
      
      if (!Model) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 400,
            message: "Invalid resource type for ownership validation"
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
            message: "Access denied - You can only access your own resources"
          })
        };
      }

      return { success: true };
      
    } catch (error) {
      console.error('Ownership validation error:', error);
      return {
        success: false,
        response: errorResponse({
          req,
          status: 500,
          message: "Failed to validate resource ownership"
        })
      };
    }
  }

  /**
   * Phone number validation for user routes
   */
  static async validatePhoneAccess(req: AuthRequest, phone: string): Promise<{ success: boolean; response?: NextResponse }> {
    if (!req.user) {
      return {
        success: false,
        response: errorResponse({
          req,
          status: 401,
          message: "Authentication required for phone validation"
        })
      };
    }

    // Admin users can access any user's data
    if (['admin', 'super_admin'].includes(req.user.role)) {
      return { success: true };
    }

    // Users can only access their own data
    if (req.user.phone !== phone) {
      return {
        success: false,
        response: errorResponse({
          req,
          status: 403,
          message: "Access denied - You can only access your own account data"
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
      
      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
      
      const log = new ApiAccessLog({
        userId: user.id,
        endpoint: req.nextUrl.pathname,
        method: req.method,
        ip: clientIP,
        userAgent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date(),
        statusCode: 200 // Will be updated by response middleware if available
      });

      await log.save();
    } catch (error) {
      console.error('Failed to log API access:', error);
      // Don't throw error - logging should not break API functionality
    }
  }

  /**
   * Validate API key for external integrations
   */
  static async validateApiKey(req: NextRequest): Promise<{ success: boolean; user?: AuthUser; response?: NextResponse }> {
    try {
      const apiKey = req.headers.get('X-API-Key') || req.headers.get('x-api-key');
      
      if (!apiKey) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 401,
            message: "API key required"
          })
        };
      }

      await connectDB();
      
      // Import ApiConfig model
      const { ApiConfig } = await import("@/server/models/ApiConfig.model");
      
      const config = await ApiConfig.findOne({ 
        apiKey, 
        isActive: true 
      }).populate('user', 'name email phone role isActive isVerified');
      
      if (!config) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 401,
            message: "Invalid API key"
          })
        };
      }

      if (config.isExpired()) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 401,
            message: "API key has expired"
          })
        };
      }

      if (config.isRateLimited()) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 429,
            message: "API key rate limit exceeded"
          })
        };
      }

      // Validate IP if restrictions are set
      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
      
      if (!config.validateIP(clientIP)) {
        return {
          success: false,
          response: errorResponse({
            req,
            status: 403,
            message: "IP address not allowed"
          })
        };
      }

      // Update API usage
      await config.updateUsage();

      const user: AuthUser = {
        id: config.user._id.toString(),
        name: config.user.name,
        phone: config.user.phone,
        email: config.user.email,
        role: config.user.role,
        isActive: config.user.isActive,
        isVerified: config.user.isVerified,
        permissions: config.scopes
      };

      return { success: true, user };

    } catch (error) {
      console.error('API key validation error:', error);
      return {
        success: false,
        response: errorResponse({
          req,
          status: 500,
          message: "API key validation failed"
        })
      };
    }
  }
}

/**
 * Middleware wrapper for Next.js API routes
 */
export function withAuth(allowedRoles?: string[], requiredPermissions?: string[]) {
  return function (handler: (req: AuthRequest, res: NextResponse) => Promise<NextResponse>) {
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

/**
 * Simple verification function for use in API routes
 */
export async function verifyAuth(req: NextRequest): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const authRequest = req as AuthRequest;
  const result = await AuthMiddleware.authenticate(authRequest);
  
  if (!result.success) {
    return { 
      success: false, 
      message: "Authentication failed" 
    };
  }

  return { 
    success: true, 
    user: result.user 
  };
}