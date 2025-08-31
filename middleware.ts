import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// অনুমোদিত অরিজিনগুলির লিস্ট
const allowedOrigins = [
  "*",
];

export function middleware(req: NextRequest) {
  // রিকোয়েস্ট থেকে অরিজিন পাওয়া
  const origin = req.headers.get("origin");

  // প্রিফ্লাইট রিকোয়েস্ট হ্যান্ডল করা (OPTIONS method)
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });

    // যদি অরিজিন অনুমোদিত হয়
    if (allowedOrigins.includes(origin || "")) {
      response.headers.set("Access-Control-Allow-Origin", origin!);
    }

    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Max-Age", "86400"); // 24 ঘন্টা ক্যাশ

    return response;
  }

  const response = NextResponse.next();

  // যদি অরিজিন অনুমোদিত হয়
  if (allowedOrigins.includes(origin || "")) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
  }

  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  return response;
}

export const config = {
  matcher: "/api/:path*",
};