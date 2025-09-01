import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const allowedOrigins = ["*"];

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    if (allowedOrigins.includes(origin || "")) {
      response.headers.set("Access-Control-Allow-Origin", origin!);
    }
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");
    return response;
  }
  const response = NextResponse.next();
  if (allowedOrigins.includes(origin || "")) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
  }
  response.headers.set("Access-Control-Allow-Methods","GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers","Content-Type, Authorization");
  return response;
}
export const config = {matcher: "/api/:path*",};
