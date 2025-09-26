import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { User } from "@/server/models/User.model";
import connectDB from "@/config/db";

export interface AuthenticatedUser {
  id: string;
  role: "user" | "admin" | "moderator";
  email: string;
  phone: string;
  name: string;
  isVerified: boolean;
  isActive: boolean;
}

export interface AuthRequest extends NextRequest {
  user?: AuthenticatedUser;
}

export const authenticateToken = async (req: NextRequest): Promise<AuthenticatedUser | null> => {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return null;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    if (decoded.type !== "access") {
      return null;
    }

    await connectDB();
    
    // Fetch user from database
    const user = await User.findById(decoded.id).select("-password -refreshTokens");
    
    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      phone: user.phone,
      name: user.name,
      isVerified: user.isVerified,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error("Token authentication error:", error);
    return null;
  }
};

export const requireAuth = async (req: NextRequest): Promise<AuthenticatedUser> => {
  const user = await authenticateToken(req);
  
  if (!user) {
    throw new Error("Authentication required");
  }
  
  return user;
};

export const requireAdmin = async (req: NextRequest): Promise<AuthenticatedUser> => {
  const user = await requireAuth(req);
  
  if (user.role !== "admin") {
    throw new Error("Admin access required");
  }
  
  return user;
};

export const requireAdminOrModerator = async (req: NextRequest): Promise<AuthenticatedUser> => {
  const user = await requireAuth(req);
  
  if (user.role !== "admin" && user.role !== "moderator") {
    throw new Error("Admin or moderator access required");
  }
  
  return user;
};

export const requireVerified = async (req: NextRequest): Promise<AuthenticatedUser> => {
  const user = await requireAuth(req);
  
  if (!user.isVerified) {
    throw new Error("Email verification required");
  }
  
  return user;
};