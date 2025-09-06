import { NextRequest, NextResponse } from "next/server";
import { AuthMiddleware, AuthRequest } from "@/lib/middleware/auth";
import { rateLimiters } from "@/lib/middleware/rateLimit";
import { Validator, ValidationConfig, ValidatedRequest } from "@/lib/middleware/validation";
import { successResponse, errorResponse } from "@/server/common/response";

export interface ApiConfig {
  auth?: {
    required?: boolean;
    roles?: string[];
    permissions?: string[];
  };
  validation?: ValidationConfig;
  rateLimit?: keyof typeof rateLimiters;
  customRateLimit?: any;
}

export interface ApiHandler {
  (req: AuthRequest & ValidatedRequest): Promise<NextResponse>;
}

/**
 * API Route wrapper with middleware support
 */
export function createApiHandler(config: ApiConfig = {}) {
  return function (handlers: { [method: string]: ApiHandler }) {
    return async function (req: NextRequest, context?: { params?: any }) {
      const method = req.method;
      const handler = handlers[method];
      
      if (!handler) {
        return errorResponse({
          req,
          status: 405,
          message: "Method not allowed",
          error: `Method ${method} is not supported for this endpoint`
        });
      }

      try {
        const extendedReq = req as AuthRequest & ValidatedRequest;

        // Add route params to request if available
        if (context?.params) {
          (extendedReq as any).params = context.params;
        }

        // Apply rate limiting
        if (config.rateLimit || config.customRateLimit) {
          const rateLimiter = config.customRateLimit || rateLimiters[config.rateLimit!];
          const rateLimitResult = await rateLimiter.middleware()(extendedReq);
          
          if (!rateLimitResult.success && rateLimitResult.response) {
            return rateLimitResult.response;
          }
        }

        // Apply authentication
        if (config.auth?.required !== false) {
          const authResult = await AuthMiddleware.authenticate(extendedReq);
          if (!authResult.success && authResult.response) {
            return authResult.response;
          }

          // Check roles
          if (config.auth?.roles?.length) {
            const roleResult = await AuthMiddleware.authorize(config.auth.roles)(extendedReq);
            if (!roleResult.success && roleResult.response) {
              return roleResult.response;
            }
          }

          // Check permissions
          if (config.auth?.permissions?.length) {
            for (const permission of config.auth.permissions) {
              const permResult = await AuthMiddleware.requirePermission(permission)(extendedReq);
              if (!permResult.success && permResult.response) {
                return permResult.response;
              }
            }
          }
        }

        // Apply validation
        if (config.validation) {
          const validationResult = await Validator.validateRequest(extendedReq, config.validation);
          if (!validationResult.success && validationResult.response) {
            return validationResult.response;
          }
        }

        // Execute handler
        const response = await handler(extendedReq);
        
        // Add rate limit headers if available
        if ((extendedReq as any).rateLimitInfo) {
          const rateLimitInfo = (extendedReq as any).rateLimitInfo;
          response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
          response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitInfo.resetTime / 1000).toString());
        }

        return response;

      } catch (error) {
        console.error('API handler error:', error);
        
        return errorResponse({
          req,
          status: 500,
          message: "Internal server error",
          error: process.env.NODE_ENV === 'development' 
            ? error instanceof Error ? error.message : String(error)
            : "An unexpected error occurred"
        });
      }
    };
  };
}

/**
 * Helper for paginated responses
 */
export function createPaginatedResponse(data: {
  items: any[];
  total: number;
  page: number;
  limit: number;
  sort?: string;
  order?: string;
}) {
  const totalPages = Math.ceil(data.total / data.limit);
  const hasNext = data.page < totalPages;
  const hasPrevious = data.page > 1;

  return {
    items: data.items,
    pagination: {
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages,
      hasNext,
      hasPrevious,
      nextPage: hasNext ? data.page + 1 : null,
      previousPage: hasPrevious ? data.page - 1 : null,
    },
    sort: {
      field: data.sort,
      order: data.order || 'desc',
    }
  };
}

/**
 * Helper for extracting pagination params from query
 */
export function extractPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const offset = (page - 1) * limit;
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

  return { page, limit, offset, sort, order };
}

/**
 * Helper for extracting filter params from query
 */
export function extractFilterParams(searchParams: URLSearchParams, allowedFilters: string[]) {
  const filters: Record<string, any> = {};

  allowedFilters.forEach(filter => {
    const value = searchParams.get(filter);
    if (value !== null) {
      // Handle boolean filters
      if (value === 'true' || value === 'false') {
        filters[filter] = value === 'true';
      }
      // Handle array filters (comma-separated)
      else if (value.includes(',')) {
        filters[filter] = { $in: value.split(',') };
      }
      // Handle regular string filters
      else {
        filters[filter] = value;
      }
    }
  });

  return filters;
}

/**
 * Helper for extracting date range params
 */
export function extractDateRangeParams(searchParams: URLSearchParams) {
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  const dateFilter: any = {};

  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }
  
  if (endDate) {
    dateFilter.$lte = new Date(endDate);
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : undefined;
}

/**
 * Helper for MongoDB aggregation pipelines
 */
export function createAggregationPipeline(options: {
  match?: any;
  sort?: any;
  skip?: number;
  limit?: number;
  lookup?: Array<{
    from: string;
    localField: string;
    foreignField: string;
    as: string;
  }>;
  project?: any;
}) {
  const pipeline: any[] = [];

  // Match stage
  if (options.match) {
    pipeline.push({ $match: options.match });
  }

  // Lookup stages
  if (options.lookup) {
    options.lookup.forEach(lookup => {
      pipeline.push({ $lookup: lookup });
    });
  }

  // Sort stage
  if (options.sort) {
    pipeline.push({ $sort: options.sort });
  }

  // Skip stage
  if (options.skip) {
    pipeline.push({ $skip: options.skip });
  }

  // Limit stage
  if (options.limit) {
    pipeline.push({ $limit: options.limit });
  }

  // Project stage
  if (options.project) {
    pipeline.push({ $project: options.project });
  }

  return pipeline;
}

/**
 * Helper for generating tracking IDs
 */
export function generateTrackingId(): string {
  const prefix = 'ZYP';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Generate random sequence number
  const sequence = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${prefix}${year}${month}${day}${sequence}`;
}

/**
 * Helper for sanitizing sensitive data in responses
 */
export function sanitizeUser(user: any) {
  if (!user) return null;
  
  const { password, emailVerification, ...sanitized } = user.toObject ? user.toObject() : user;
  return sanitized;
}

/**
 * Helper for creating search queries
 */
export function createSearchQuery(searchTerm: string, searchFields: string[]) {
  if (!searchTerm) return {};
  
  const searchRegex = new RegExp(searchTerm, 'i');
  
  return {
    $or: searchFields.map(field => ({
      [field]: searchRegex
    }))
  };
}

/**
 * Helper for validating ObjectIds
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Helper for formatting error messages
 */
export function formatValidationErrors(errors: any[]): string {
  return errors.map(err => `${err.field}: ${err.message}`).join(', ');
}

/**
 * Helper for generating secure random codes
 */
export function generateSecureCode(length: number = 6): string {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  
  return result;
}

/**
 * Helper for calculating distance between coordinates
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
}

/**
 * Helper for formatting currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

/**
 * Helper for formatting dates
 */
export function formatDate(date: Date, locale: string = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}