// src/app/api/v1/auth/refresh-token/route.tsx
import connectDB from "@/config/db";
import { successResponse } from "@/server/common/response";
import { User } from "@/server/models/User.model";
import jwt, { Secret } from "jsonwebtoken";

const REFRESH_TOKEN_EXPIRES = "7d"; // 7 days

export async function POST(req: Request) {
  try {
    await connectDB();
    const { accessToken } = await req.json();

    if (!accessToken) {
      return successResponse({ message: "Access token required", status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any;
    console.log(process.env.JWT_SECRET);
    try {
      payload = jwt.verify(accessToken, process.env.JWT_SECRET as Secret);

      console.log("JWT verified:", payload);
    } catch (err) {
      console.log("JWT verification error:", err);
      return successResponse({
        message: "Invalid or expired access token",
        status: 401,
      });
    }
    // Find user

    const user = await User.findOne({ _id: payload.id });
    console.log(user);

    if (!user) {
      return successResponse({ message: "User not found", status: 404 });
    }

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as Secret,
      { expiresIn: 7 * 24 * 60 * 60  }
    );

    return successResponse({
      message: "Refresh token generated",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
        role: user.role,
        token: refreshToken,
      },
      status: 200,
    });
  } catch (err) {
    console.log(err);

    return successResponse({ message: "Server error", status: 500 });
  }
}
