import { NextRequest } from "next/server";
import jwt from "jsonwebtoken"; 

interface JwtPayload {
  _id: string;
  role: string;
  // add other fields if needed
}

export async function verifyToken(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: true,
        message: "No valid authorization header provided"
      };
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token using secret from environment variables
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (typeof decoded === "object" && decoded !== null) {
      return {
        error: false,
        userId: decoded._id,
        role: decoded.role
      };
    } else {
      return {
        error: true,
        message: "Invalid token payload"
      };
    }

  } catch (error: unknown) {
    let errorMessage = "Invalid or expired token";

    if (typeof error === "object" && error !== null && "name" in error) {
      const err = error as { name: string };
      if (err.name === 'JsonWebTokenError') {
        errorMessage = "Malformed token";
      } else if (err.name === 'TokenExpiredError') {
        errorMessage = "Token has expired";
      }
    }
    
    return {
      error: true,
      message: errorMessage
    };
  }
}