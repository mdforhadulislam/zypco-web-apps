import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema, ZodError } from "zod";
import { errorResponse } from "@/server/common/response";
import DOMPurify from 'isomorphic-dompurify';

export interface ValidationConfig {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
  headers?: ZodSchema<any>;
}

export interface ValidatedRequest extends NextRequest {
  validatedData?: {
    body?: any;
    query?: any;
    params?: any;
    headers?: any;
  };
}

export class Validator {
  /**
   * Sanitize string input to prevent XSS attacks
   */
  static sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove HTML tags and script content
    let sanitized = DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [], 
      ALLOWED_ATTR: [] 
    });
    
    // Additional sanitization for specific patterns
    sanitized = sanitized
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/onload/gi, '')
      .replace(/onerror/gi, '')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    return sanitized.trim();
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Validate and sanitize request data
   */
  static async validateRequest(
    req: ValidatedRequest, 
    config: ValidationConfig
  ): Promise<{ success: boolean; response?: NextResponse }> {
    try {
      const validatedData: any = {};
      
      // Parse and validate request body
      if (config.body) {
        let body = {};
        try {
          const text = await req.text();
          if (text) {
            body = JSON.parse(text);
            body = this.sanitizeObject(body);
          }
        } catch (error) {
          return {
            success: false,
            response: errorResponse({
              req,
              status: 400,
              message: "Invalid JSON in request body",
              error: "Malformed JSON syntax"
            })
          };
        }
        
        validatedData.body = config.body.parse(body);
      }
      
      // Validate query parameters
      if (config.query) {
        const url = new URL(req.url);
        const queryObj: any = {};
        
        for (const [key, value] of url.searchParams.entries()) {
          queryObj[key] = this.sanitizeString(value);
        }
        
        validatedData.query = config.query.parse(queryObj);
      }
      
      // Validate route parameters (would need to be passed in)
      if (config.params) {
        // This would be extracted from the route in the actual handler
        // For now, we'll skip this as it's route-specific
      }
      
      // Validate headers
      if (config.headers) {
        const headerObj: any = {};
        req.headers.forEach((value, key) => {
          headerObj[key] = this.sanitizeString(value);
        });
        
        validatedData.headers = config.headers.parse(headerObj);
      }
      
      req.validatedData = validatedData;
      return { success: true };
      
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));
        
        return {
          success: false,
          response: errorResponse({
            req,
            status: 422,
            message: "Validation failed",
            error: {
              type: "ValidationError",
              errors: formattedErrors,
            }
          })
        };
      }
      
      return {
        success: false,
        response: errorResponse({
          req,
          status: 500,
          message: "Validation error",
          error: "Internal server error during validation"
        })
      };
    }
  }

  /**
   * Create middleware wrapper for validation
   */
  static middleware(config: ValidationConfig) {
    return async (req: ValidatedRequest): Promise<{ success: boolean; response?: NextResponse }> => {
      return this.validateRequest(req, config);
    };
  }
}

// Common validation schemas
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? Math.min(parseInt(val) || 20, 100) : 20),
    offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc'),
  }),

  // MongoDB ObjectId
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format"),

  // Phone number (international format)
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, "Invalid international phone format"),

  // Email
  email: z.string().email("Invalid email format").toLowerCase(),

  // Password (strong)
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number")
    .regex(/(?=.*[!@#$%^&*])/, "Password must contain at least one special character"),

  // Name validation
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),

  // Address
  address: z.string()
    .min(5, "Address must be at least 5 characters")
    .max(200, "Address must not exceed 200 characters"),

  // Coordinates
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90)    // latitude
  ]),

  // Date range
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).refine(data => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, "Start date must be before end date"),
};

// User-specific schemas
export const userSchemas = {
  register: z.object({
    name: commonSchemas.name,
    phone: commonSchemas.phone,
    email: commonSchemas.email,
    password: commonSchemas.password,
  }),

  login: z.object({
    phone: commonSchemas.phone,
    password: z.string().min(1, "Password is required"),
  }),

  updateProfile: z.object({
    name: commonSchemas.name.optional(),
    email: commonSchemas.email.optional(),
    preferences: z.object({
      notifications: z.object({
        email: z.boolean().optional(),
        sms: z.boolean().optional(),
      }).optional(),
    }).optional(),
  }),

  verifyEmail: z.object({
    code: z.string().length(6, "Verification code must be 6 characters"),
  }),

  resetPassword: z.object({
    email: commonSchemas.email,
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: commonSchemas.password,
  }),
};

// Address schemas
export const addressSchemas = {
  create: z.object({
    name: commonSchemas.name,
    label: z.string().min(2).max(50).optional(),
    addressLine: commonSchemas.address,
    area: z.string().max(100).optional(),
    subCity: z.string().max(100).optional(),
    city: z.string().min(2).max(100),
    state: z.string().max(100).optional(),
    zipCode: z.string().max(20).optional(),
    country: commonSchemas.objectId,
    phone: commonSchemas.phone.optional(),
    isDefault: z.boolean().optional().default(false),
    location: z.object({
      type: z.literal("Point"),
      coordinates: commonSchemas.coordinates,
    }).optional(),
  }),

  update: z.object({
    name: commonSchemas.name.optional(),
    label: z.string().min(2).max(50).optional(),
    addressLine: commonSchemas.address.optional(),
    area: z.string().max(100).optional(),
    subCity: z.string().max(100).optional(),
    city: z.string().min(2).max(100).optional(),
    state: z.string().max(100).optional(),
    zipCode: z.string().max(20).optional(),
    country: commonSchemas.objectId.optional(),
    phone: commonSchemas.phone.optional(),
    isDefault: z.boolean().optional(),
    location: z.object({
      type: z.literal("Point"),
      coordinates: commonSchemas.coordinates,
    }).optional(),
  }),
};

// Order schemas
export const orderSchemas = {
  create: z.object({
    parcel: z.object({
      from: commonSchemas.objectId,
      to: commonSchemas.objectId,
      sender: z.object({
        name: commonSchemas.name,
        phone: commonSchemas.phone,
        email: commonSchemas.email,
        address: z.object({
          address: commonSchemas.address,
          city: z.string().min(2),
          zipCode: z.string().optional(),
          country: commonSchemas.objectId,
        }),
      }),
      receiver: z.object({
        name: commonSchemas.name,
        phone: commonSchemas.phone,
        email: commonSchemas.email,
        address: z.object({
          address: commonSchemas.address,
          city: z.string().min(2),
          zipCode: z.string().optional(),
          country: commonSchemas.objectId,
        }),
      }),
      box: z.array(z.object({
        length: z.number().positive(),
        width: z.number().positive(),
        height: z.number().positive(),
        fragile: z.boolean().optional().default(false),
      })).min(1),
      weight: z.string().regex(/^\d+(\.\d+)?(kg|g|lb)$/, "Weight must include unit (kg/g/lb)"),
      serviceType: z.enum(["DHL Express", "FedEx", "UPS", "Aramex"]),
      priority: z.enum(["normal", "express", "super-express", "tax-paid"]),
      orderType: z.enum(["document", "parcel", "e-commerce"]),
      item: z.array(z.object({
        name: z.string().min(1),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
        totalPrice: z.number().nonnegative(),
      })).min(1),
      customerNote: z.string().max(500).optional(),
    }),
    payment: z.object({
      pType: z.string().min(1),
      pAmount: z.number().nonnegative(),
      pOfferDiscount: z.number().nonnegative().optional().default(0),
      pExtraCharge: z.number().nonnegative().optional().default(0),
      pDiscount: z.number().nonnegative().optional().default(0),
      pReceived: z.number().nonnegative(),
      pRefunded: z.number().nonnegative().optional().default(0),
    }),
  }),
};

/**
 * Middleware wrapper to apply validation to Next.js API routes
 */
export function withValidation(config: ValidationConfig) {
  return function (handler: Function) {
    return async function (req: ValidatedRequest, ...args: any[]) {
      const validationResult = await Validator.validateRequest(req, config);
      
      if (!validationResult.success && validationResult.response) {
        return validationResult.response;
      }

      return handler(req, ...args);
    };
  };
}