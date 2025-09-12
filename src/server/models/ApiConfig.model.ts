import crypto from "crypto";
import { Document, Schema, Types, model, models } from "mongoose";
import shortid from "shortid";
import { User } from "./User.model"; // Import User model

// Interface
export interface IApiConfig extends Document {
  user: Types.ObjectId;
  key: string;
  name: string;
  allowedIPs: string[];
  isActive: boolean;
  expiresAt?: Date;
  lastUsedAt?: Date;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    remaining: number;
    resetTime?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const apiConfigSchema = new Schema<IApiConfig>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    key: { type: String, required: true, unique: true, select: false },
    name: { type: String, default: null, trim: true },
    allowedIPs: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
    lastUsedAt: { type: Date, default: null },
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
apiConfigSchema.pre<IApiConfig>("save", async function (next) {
  if (!this.key) this.key = crypto.randomBytes(32).toString("hex");
  if (!this.name && this.user) {
    const userDoc = await User.findById(this.user).select("name");
    this.name = userDoc
      ? `${userDoc.name}'s API Key`
      : `API-Key-${shortid.generate()}`;
  }
  if (!this.rateLimit.resetTime) {
    this.rateLimit.resetTime = new Date(Date.now() + this.rateLimit.windowMs);
  }
  next();
});

// Auto-update lastUsedAt on save if needed
apiConfigSchema.methods.updateUsage = function () {
  this.lastUsedAt = new Date();
  if (this.rateLimit.remaining > 0) {
    this.rateLimit.remaining -= 1;
  } else {
    const now = new Date();
    if (this.rateLimit.resetTime && this.rateLimit.resetTime < now) {
      this.rateLimit.remaining = this.rateLimit.maxRequests - 1;
      this.rateLimit.resetTime = new Date(
        now.getTime() + this.rateLimit.windowMs
      );
    }
  }
};

// Indexes
apiConfigSchema.index({ key: 1, isActive: 1 }, { unique: true });
apiConfigSchema.index({ user: 1 });
apiConfigSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Export model
export const ApiConfig = models.ApiConfig || model<IApiConfig>("ApiConfig", apiConfigSchema);
