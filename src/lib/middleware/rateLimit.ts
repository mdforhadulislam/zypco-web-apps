import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/server/common/response";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
  remaining: number;
}

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export class RateLimiter {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      windowMs: config.windowMs,
      maxRequests: config.maxRequests,
      message: config.message || "Too many requests, please try again later",
      skipSuccessfulRequests: config.skipSuccessfulRequests || false,
      skipFailedRequests: config.skipFailedRequests || false,
      keyGenerator: config.keyGenerator || this.defaultKeyGenerator,
    };
  }

  private defaultKeyGenerator(req: NextRequest): string {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const endpoint = req.nextUrl.pathname;
    const method = req.method;
    return `${ip}:${method}:${endpoint}`;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }

  async checkRateLimit(req: NextRequest): Promise<{
    success: boolean;
    rateLimitInfo: RateLimitInfo;
    response?: NextResponse;
  }> {
    this.cleanupExpiredEntries();

    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const windowStart = now;
    const windowEnd = now + this.config.windowMs;

    let rateLimitData = rateLimitStore.get(key);

    if (!rateLimitData || now > rateLimitData.resetTime) {
      rateLimitData = {
        count: 0,
        resetTime: windowEnd,
      };
    }

    rateLimitData.count++;
    rateLimitStore.set(key, rateLimitData);

    const rateLimitInfo: RateLimitInfo = {
      count: rateLimitData.count,
      resetTime: rateLimitData.resetTime,
      remaining: Math.max(0, this.config.maxRequests - rateLimitData.count),
    };

    if (rateLimitData.count > this.config.maxRequests) {
      const retryAfter = Math.ceil((rateLimitData.resetTime - now) / 1000);
      
      const response = errorResponse({
        req,
        status: 429,
        message: this.config.message,
        error: "Rate limit exceeded",
        meta: {
          rateLimitInfo: {
            limit: this.config.maxRequests,
            remaining: 0,
            resetTime: rateLimitData.resetTime,
            retryAfter,
          },
        },
      });

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', this.config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', '0');
      response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitData.resetTime / 1000).toString());
      response.headers.set('Retry-After', retryAfter.toString());

      return {
        success: false,
        rateLimitInfo,
        response,
      };
    }

    return {
      success: true,
      rateLimitInfo,
    };
  }

  // Middleware wrapper
  middleware() {
    return async (req: NextRequest): Promise<{ success: boolean; response?: NextResponse }> => {
      const result = await this.checkRateLimit(req);
      
      if (!result.success && result.response) {
        return {
          success: false,
          response: result.response,
        };
      }

      // Add rate limit info to request for use in response
      (req as any).rateLimitInfo = result.rateLimitInfo;
      
      return { success: true };
    };
  }
}

// Predefined rate limiters for different endpoints
export const rateLimiters = {
  // Authentication endpoints
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: "Too many authentication attempts, please try again in 15 minutes",
  }),

  // General API endpoints
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: "Too many requests, please slow down",
  }),

  // Order creation (more restrictive)
  orderCreation: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    message: "Too many orders created, please wait before creating more",
  }),

  // File upload endpoints
  upload: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: "Too many upload requests, please wait",
  }),

  // Public endpoints (tracking, health check)
  public: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200,
    message: "Too many requests to public endpoint",
  }),

  // Admin endpoints
  admin: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 500,
    message: "Admin rate limit exceeded",
  }),

  // Contact form submissions
  contact: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: "Too many contact form submissions, please try again later",
  }),

  // Password reset requests
  passwordReset: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: "Too many password reset requests, please try again later",
  }),
};

/**
 * Middleware wrapper to apply rate limiting to Next.js API routes
 */
export function withRateLimit(rateLimiter: RateLimiter) {
  return function (handler: Function) {
    return async function (req: NextRequest, ...args: any[]) {
      const rateLimitResult = await rateLimiter.middleware()(req);
      
      if (!rateLimitResult.success && rateLimitResult.response) {
        return rateLimitResult.response;
      }

      return handler(req, ...args);
    };
  };
}

/**
 * Get rate limit info for adding to responses
 */
export function addRateLimitHeaders(response: NextResponse, req: NextRequest): void {
  const rateLimitInfo = (req as any).rateLimitInfo as RateLimitInfo;
  
  if (rateLimitInfo) {
    response.headers.set('X-RateLimit-Limit', '100'); // Default, should be dynamic
    response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitInfo.resetTime / 1000).toString());
  }
}