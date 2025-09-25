import { User } from "@/server/models/User.model";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import connectDB from "@/config/db";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
}

export interface TokenPayload {
  id: string;
  role: string;
  type?: string;
  iat?: number;
  exp?: number;
}

/**
 * Extract JWT token from request headers or cookies
 */
export function extractToken(req: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  // Check cookies as fallback
  const tokenFromCookie = req.cookies.get("access_token")?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  return null;
}

/**
 * Get authenticated user from request
 * Updated to be consistent with new auth system
 */
export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    const token = extractToken(req);
    if (!token) {
      return null;
    }

    // Verify JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET environment variable not configured");
      return null;
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
    
    // Validate token structure
    if (!decoded.id || !decoded.role) {
      console.error("Invalid token structure - missing id or role");
      return null;
    }

    // Ensure it's an access token (if type is specified)
    if (decoded.type && decoded.type !== 'access') {
      console.error("Invalid token type - expected access token");
      return null;
    }

    // Connect to database and fetch user
    await connectDB();
    const user = await User.findById(decoded.id)
      .select("-password -refreshTokens -emailVerification.code -registrationIP")
      .lean();

    if (!user) {
      console.error("User not found for token");
      return null;
    }

    // Validate user status
    if (!user.isActive) {
      console.error("User account is inactive");
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
      avatar: user.avatar || undefined,
    };

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Access token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid access token format");
    } else {
      console.error("Authentication error:", error);
    }
    return null;
  }
}

/**
 * Verify user has required role
 */
export async function verifyRole(req: NextRequest, allowedRoles: string[]): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const user = await getAuthUser(req);
  
  if (!user) {
    return {
      success: false,
      message: "Authentication required"
    };
  }

  if (!allowedRoles.includes(user.role)) {
    return {
      success: false,
      user,
      message: `Access denied. Required role: ${allowedRoles.join(" or ")}`
    };
  }

  return {
    success: true,
    user
  };
}

/**
 * Verify user account is verified
 */
export async function requireVerifiedUser(req: NextRequest): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const user = await getAuthUser(req);
  
  if (!user) {
    return {
      success: false,
      message: "Authentication required"
    };
  }

  if (!user.isVerified) {
    return {
      success: false,
      user,
      message: "Account verification required. Please verify your email address."
    };
  }

  return {
    success: true,
    user
  };
}

/**
 * Check if user owns a resource by phone number
 */
export async function verifyPhoneOwnership(req: NextRequest, phone: string): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const user = await getAuthUser(req);
  
  if (!user) {
    return {
      success: false,
      message: "Authentication required"
    };
  }

  // Admin users can access any user's data
  if (['admin', 'super_admin'].includes(user.role)) {
    return {
      success: true,
      user
    };
  }

  // Regular users can only access their own data
  if (user.phone !== phone) {
    return {
      success: false,
      user,
      message: "Access denied. You can only access your own account data."
    };
  }

  return {
    success: true,
    user
  };
}

/**
 * Generate client-side auth headers for API requests
 */
export function getAuthHeaders(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Check if token is expired (client-side helper)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    // Check if token expires in next 30 seconds (for preemptive refresh)
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    const bufferTime = 30 * 1000; // 30 seconds
    
    return expirationTime <= (currentTime + bufferTime);
  } catch {
    return true;
  }
}

/**
 * Decode token payload without verification (client-side helper)
 */
export function decodeTokenPayload(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Validate API key format (client-side helper)
 */
export function validateApiKeyFormat(apiKey: string): boolean {
  // API key format: zyp_live_32characters or zyp_test_32characters
  return /^zyp_(live|test)_[a-f0-9]{32}$/.test(apiKey);
}

/**
 * Get user permissions based on role (helper function)
 */
export function getUserPermissions(role: string): string[] {
  const permissions = {
    user: ['read:own', 'write:own'],
    moderator: ['read:own', 'write:own', 'read:orders', 'moderate:content'],
    admin: ['read:all', 'write:all', 'delete:all', 'manage:users', 'view:analytics'],
    super_admin: ['*'] // All permissions
  };

  return permissions[role as keyof typeof permissions] || permissions.user;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: AuthUser, permission: string): boolean {
  const userPermissions = getUserPermissions(user.role);
  
  // Super admin has all permissions
  if (userPermissions.includes('*')) {
    return true;
  }
  
  // Check specific permission
  return userPermissions.includes(permission);
}

/**
 * Format user for client response (remove sensitive data)
 */
export function formatUserForClient(user: any): AuthUser {
  return {
    id: user._id?.toString() || user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    avatar: user.avatar || undefined,
  };
}

/**
 * Validate user session and return user data
 * This is a comprehensive auth check function
 */
export async function validateSession(req: NextRequest): Promise<{
  success: boolean;
  user?: AuthUser;
  error?: string;
  needsRefresh?: boolean;
}> {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return {
        success: false,
        error: "No authentication token provided"
      };
    }

    // Check if token is expired before verification
    if (isTokenExpired(token)) {
      return {
        success: false,
        error: "Access token has expired",
        needsRefresh: true
      };
    }

    const user = await getAuthUser(req);
    
    if (!user) {
      return {
        success: false,
        error: "Invalid authentication token",
        needsRefresh: true
      };
    }

    return {
      success: true,
      user
    };

  } catch (error) {
    console.error("Session validation error:", error);
    return {
      success: false,
      error: "Session validation failed",
      needsRefresh: true
    };
  }
}