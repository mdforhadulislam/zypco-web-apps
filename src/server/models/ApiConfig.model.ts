import { Schema, model, Document, Types } from 'mongoose';

// Interface for API Config
export interface IApiConfig extends Document {
  user: Types.ObjectId;          // Linked user ID
  key: string;                   // Hashed API key
  name: string;                  // Friendly name
  allowedIPs: string[];          // Restricted IPs
  isActive: boolean;             // Active status
  expiresAt?: Date;              // Expiration date
  lastUsedAt?: Date;             // Last usage timestamp
  createdAt: Date;               // Creation timestamp (auto-added by timestamps)
  updatedAt: Date;               // Update timestamp (auto-added by timestamps)
}

// Schema definition
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
      select: false,  // Never expose hashed key in queries
    },
    name: {
      type: String,
      default: 'Default API Key',
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
  },
  { timestamps: true }  // Auto-adds createdAt/updatedAt
);

// Performance index
apiConfigSchema.index({ key: 1, isActive: 1 });

// Model export
export const ApiConfig = model<IApiConfig>('ApiConfig', apiConfigSchema);