import crypto from "crypto";
import { Document, Schema, Types, model, models } from "mongoose";

// Interface with proper field names
export interface IApiConfig extends Document {
  user: Types.ObjectId;
  apiKey: string; // Changed from 'key' to 'apiKey' for clarity
  name: string;
  allowedIPs: string[];
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    remaining: number;
    resetTime: Date;
  };
  
  // Usage tracking
  usage: {
    totalRequests: number;
    lastRequest: Date | null;
    dailyUsage: Array<{
      date: Date;
      requests: number;
    }>;
  };
  
  // Security
  origins: string[]; // Allowed origins for CORS
  scopes: string[]; // API permissions
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  updateUsage(): Promise<void>;
  resetRateLimit(): void;
  isRateLimited(): boolean;
  isExpired(): boolean;
  validateIP(ip: string): boolean;
  generateNewKey(): string;
}

// Schema with comprehensive validation
const apiConfigSchema = new Schema<IApiConfig>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    
    apiKey: { 
      type: String, 
      required: true, 
      unique: true,
      select: false, // Don't return API key by default
      validate: {
        validator: function(v: string) {
          // API key format: zyp_live_32characters or zyp_test_32characters
          return /^zyp_(live|test)_[a-f0-9]{32}$/.test(v);
        },
        message: "Invalid API key format"
      }
    },
    
    name: { 
      type: String, 
      required: [true, "API config name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters long"],
      maxlength: [50, "Name must not exceed 50 characters"]
    },
    
    allowedIPs: { 
      type: [String], 
      default: [],
      validate: {
        validator: function(ips: string[]) {
          if (ips.length === 0) return true; // Empty array means all IPs allowed
          return ips.every(ip => {
            // Validate IPv4, IPv6, or CIDR notation
            const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
            const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
            return ipv4Regex.test(ip) || ipv6Regex.test(ip) || ip === 'localhost' || ip === '127.0.0.1';
          });
        },
        message: "Invalid IP address format in allowedIPs"
      }
    },
    
    isActive: { 
      type: Boolean, 
      default: true,
      index: true
    },
    
    expiresAt: { 
      type: Date, 
      default: null,
      validate: {
        validator: function(v: Date) {
          if (!v) return true;
          return v > new Date();
        },
        message: "Expiration date must be in the future"
      }
    },
    
    lastUsedAt: { 
      type: Date, 
      default: null 
    },
    
    usageCount: {
      type: Number,
      default: 0,
      min: 0
    },

    rateLimit: {
      windowMs: { 
        type: Number, 
        default: 60 * 1000, // 1 minute
        min: [1000, "Window must be at least 1 second"],
        max: [3600000, "Window must not exceed 1 hour"]
      },
      maxRequests: { 
        type: Number, 
        default: 60,
        min: [1, "Max requests must be at least 1"],
        max: [10000, "Max requests must not exceed 10,000"]
      },
      remaining: { 
        type: Number, 
        default: 60,
        min: 0
      },
      resetTime: { 
        type: Date, 
        required: true,
        default: () => new Date(Date.now() + 60 * 1000)
      },
    },
    
    usage: {
      totalRequests: { 
        type: Number, 
        default: 0,
        min: 0
      },
      lastRequest: { 
        type: Date, 
        default: null 
      },
      dailyUsage: [{
        date: { 
          type: Date, 
          required: true 
        },
        requests: { 
          type: Number, 
          required: true,
          min: 0
        }
      }]
    },
    
    origins: {
      type: [String],
      default: [],
      validate: {
        validator: function(origins: string[]) {
          if (origins.length === 0) return true;
          return origins.every(origin => {
            // Validate URL format or allow wildcard
            return origin === '*' || /^https?:\/\/[a-zA-Z0-9.-]+(?::[0-9]+)?$/.test(origin);
          });
        },
        message: "Invalid origin format"
      }
    },
    
    scopes: {
      type: [String],
      default: ["read"],
      enum: {
        values: ["read", "write", "admin", "analytics"],
        message: "Invalid scope. Allowed: read, write, admin, analytics"
      }
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        // Don't expose API key in JSON
        delete ret.apiKey;
        return ret;
      }
    }
  }
);

// Indexes for performance and security
apiConfigSchema.index({ user: 1, isActive: 1 });
apiConfigSchema.index({ apiKey: 1 }, { unique: true });
apiConfigSchema.index({ expiresAt: 1 }, { 
  sparse: true, 
  expireAfterSeconds: 0 // Auto-delete expired configs
});
apiConfigSchema.index({ "usage.dailyUsage.date": 1 }, { sparse: true });

// Generate secure API key before save
apiConfigSchema.pre<IApiConfig>("save", async function (next) {
  if (!this.apiKey) {
    this.generateNewKey();
  }
  
  // Ensure rate limit reset time is set
  if (!this.rateLimit.resetTime) {
    this.rateLimit.resetTime = new Date(Date.now() + this.rateLimit.windowMs);
  }
  
  // Set remaining requests if not set
  if (this.rateLimit.remaining === undefined) {
    this.rateLimit.remaining = this.rateLimit.maxRequests;
  }
  
  next();
});

// Instance method: Update usage statistics
apiConfigSchema.methods.updateUsage = async function (): Promise<void> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Update overall usage
  this.usageCount += 1;
  this.usage.totalRequests += 1;
  this.usage.lastRequest = now;
  this.lastUsedAt = now;
  
  // Update daily usage
  let dailyRecord = this.usage.dailyUsage.find((record: any) => 
    record.date.getTime() === today.getTime()
  );
  
  if (dailyRecord) {
    dailyRecord.requests += 1;
  } else {
    this.usage.dailyUsage.push({
      date: today,
      requests: 1
    });
    
    // Keep only last 30 days of usage data
    if (this.usage.dailyUsage.length > 30) {
      this.usage.dailyUsage = this.usage.dailyUsage
        .sort((a: any, b: any) => b.date.getTime() - a.date.getTime())
        .slice(0, 30);
    }
  }
  
  // Update rate limiting
  if (this.rateLimit.remaining > 0) {
    this.rateLimit.remaining -= 1;
  } else {
    // Check if rate limit window has expired
    if (this.rateLimit.resetTime < now) {
      this.resetRateLimit();
      this.rateLimit.remaining -= 1;
    }
  }
  
  await this.save();
};

// Instance method: Reset rate limit
apiConfigSchema.methods.resetRateLimit = function (): void {
  this.rateLimit.remaining = this.rateLimit.maxRequests;
  this.rateLimit.resetTime = new Date(Date.now() + this.rateLimit.windowMs);
};

// Instance method: Check if rate limited
apiConfigSchema.methods.isRateLimited = function (): boolean {
  const now = new Date();
  
  // Reset if window has expired
  if (this.rateLimit.resetTime < now) {
    this.resetRateLimit();
    return false;
  }
  
  return this.rateLimit.remaining <= 0;
};

// Instance method: Check if API config is expired
apiConfigSchema.methods.isExpired = function (): boolean {
  return this.expiresAt ? this.expiresAt < new Date() : false;
};

// Instance method: Validate IP address
apiConfigSchema.methods.validateIP = function (clientIP: string): boolean {
  // If no IP restrictions, allow all
  if (!this.allowedIPs || this.allowedIPs.length === 0) {
    return true;
  }
  
  return this.allowedIPs.some(allowedIP => {
    if (allowedIP === clientIP) return true;
    
    // Handle CIDR notation (basic implementation)
    if (allowedIP.includes('/')) {
      const [network, prefixLength] = allowedIP.split('/');
      // This is a simplified implementation - in production, use a proper CIDR library
      return clientIP.startsWith(network.split('.').slice(0, Math.floor(parseInt(prefixLength) / 8)).join('.'));
    }
    
    return false;
  });
};

// Instance method: Generate new API key
apiConfigSchema.methods.generateNewKey = function (): string {
  const environment = process.env.NODE_ENV === 'production' ? 'live' : 'test';
  const randomBytes = crypto.randomBytes(16).toString('hex');
  this.apiKey = `zyp_${environment}_${randomBytes}`;
  return this.apiKey;
};

// Static method: Find active API config by key
apiConfigSchema.statics.findByApiKey = async function(apiKey: string) {
  const config = await this.findOne({
    apiKey,
    isActive: true
  }).populate('user', 'name email phone role isActive isVerified');
  
  if (!config) {
    throw new Error('Invalid API key');
  }
  
  if (config.isExpired()) {
    throw new Error('API key has expired');
  }
  
  return config;
};

// Static method: Clean up old usage data
apiConfigSchema.statics.cleanupUsageData = async function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.updateMany(
    {},
    {
      $pull: {
        "usage.dailyUsage": {
          date: { $lt: thirtyDaysAgo }
        }
      }
    }
  );
};

// Export model
export const ApiConfig = models.ApiConfig || model<IApiConfig>("ApiConfig", apiConfigSchema);