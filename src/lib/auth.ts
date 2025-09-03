import { User } from "@/server/models/User.model";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function getAuthUser(req: NextRequest) {
  try {
    // Get token from headers (e.g., Authorization header)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Fetch user from database
    const user = await User.findById(decoded.userId).select("-password");
    return user;
  } catch (error) {
    return null;
  }
}
