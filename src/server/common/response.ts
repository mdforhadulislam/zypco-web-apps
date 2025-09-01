import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

type DebugInfo = {
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  platform: string;
};

type BasePayload = {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
  path?: string;
  method?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  env?: string;
  debugInfo?: DebugInfo;
  data?: unknown;
  error?: unknown;
  meta?: Record<string, unknown>;
};

type SuccessOptions = {
  req?: NextRequest;
  status?: number;
  message: string;
  data?: unknown;
  debug?: boolean;
  meta?: Record<string, unknown>;
};

type ErrorOptions = {
  req?: NextRequest;
  status?: number;
  message: string;
  error?: unknown;
  debug?: boolean;
  meta?: Record<string, unknown>;
};

const getIpFromRequest = (req: NextRequest): string => {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  
  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp;
  
  const connectionIp = req.headers.get("x-remote-addr");
  if (connectionIp) return connectionIp;
  
  return "unknown";
};

function buildPayload(options: {
  req?: NextRequest;
  status: number;
  message: string;
  data?: unknown;
  error?: unknown;
  debug?: boolean;
  meta?: Record<string, unknown>;
}): BasePayload {
  const { req, status, message, data, error, debug, meta } = options;
  const now = Date.now();
  
  const payload: BasePayload = {
    status: status.toString(),
    message,
    timestamp: new Date(now).toISOString(),
    uptime: process.uptime(),
  };
  
  if (data !== undefined) payload.data = data;
  if (error !== undefined && error !== null) payload.error = error;
  if (meta !== undefined) payload.meta = meta;
  
  if (req) {
    payload.path = req.nextUrl.pathname;
    payload.method = req.method;
    payload.requestId = uuidv4();
    payload.userAgent = req.headers.get("user-agent") || "unknown";
    payload.ip = getIpFromRequest(req);
  }
  
  if (debug) {
    payload.env = process.env.NODE_ENV;
    payload.debugInfo = {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      platform: process.platform,
    };
  }
  
  return payload; 
}

export function successResponse(options: SuccessOptions) {
  const { status = 200, message, data = {}, req, debug = true, meta } = options;
  const payload = buildPayload({ status, message, data, req, debug, meta });
  return NextResponse.json(payload, { status });
}

export function errorResponse(options: ErrorOptions) {
  const { status = 500, message, error, req, debug = true, meta } = options;
  const payload = buildPayload({ status, message, error, req, debug, meta });
  return NextResponse.json(payload, { status });
}