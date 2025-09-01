import { Schema, model, Document, Types, Model } from 'mongoose';
import crypto from 'crypto';
import shortid from 'shortid';
import { User } from './User.model'; // Import User model

// Interface
export interface IApiConfig extends Document {
  user: Types.ObjectId;          // Linked user ID
  key: string;                   // Auto-generated API key
  name: string;                  // Auto-set from user's name
  allowedIPs: string[];          // Restricted IPs
  isActive: boolean;             // Active status
  expiresAt?: Date;              // Expiration date
  lastUsedAt?: Date;             // Last usage timestamp
  rateLimit: {
    windowMs: number;            // Time window in ms
    maxRequests: number;         // Max requests per window
    remaining: number;           // Remaining requests in current window
    resetTime?: Date;            // When window resets
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const apiConfigSchema = new Schema<IApiConfig>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      select: false,  // Do not expose in queries
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },
    allowedIPs: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    rateLimit: {
      windowMs: { type: Number, default: 60 * 1000 }, // 1 min
      maxRequests: { type: Number, default: 60 },
      remaining: { type: Number, default: 60 },
      resetTime: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Auto-generate key and set name before save
apiConfigSchema.pre<IApiConfig>('save', async function(next) {
  // Generate key if missing
  if (!this.key) this.key = crypto.randomBytes(32).toString('hex');

  // Auto-set name from user's name if empty
  if (!this.name && this.user) {
    const userDoc = await User.findById(this.user).select('name');
    if (userDoc) {
      this.name = `${userDoc.name}'s API Key`;
    } else {
      this.name = `API-Key-${shortid.generate()}`;
    }
  }

  // Initialize rate limit resetTime if null
  if (!this.rateLimit.resetTime) {
    this.rateLimit.resetTime = new Date(Date.now() + this.rateLimit.windowMs);
  }

  next();
});

// Auto-update lastUsedAt on save if needed
apiConfigSchema.methods.updateUsage = function() {
  this.lastUsedAt = new Date();
  if (this.rateLimit.remaining > 0) {
    this.rateLimit.remaining -= 1;
  } else if (this.rateLimit.resetTime && this.rateLimit.resetTime < new Date()) {
    // Reset rate limit window
    this.rateLimit.remaining = this.rateLimit.maxRequests - 1;
    this.rateLimit.resetTime = new Date(Date.now() + this.rateLimit.windowMs);
  }
};

// Indexes
apiConfigSchema.index({ key: 1, isActive: 1 });
apiConfigSchema.index({ user: 1 });

// Export model
export const ApiConfig = (model<IApiConfig>('ApiConfig', apiConfigSchema) as Model<IApiConfig>) || model<IApiConfig>('ApiConfig', apiConfigSchema);