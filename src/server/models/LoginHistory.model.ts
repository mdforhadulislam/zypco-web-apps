import { Schema, model, Document, Model, Types } from 'mongoose';

// Interface for LoginHistory document
export interface ILoginHistory extends Document {
  user?: Types.ObjectId;           // Reference to User model (optional for failed attempts)
  phone: string;                   // Phone number attempted
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  action?: string;                 // 'login' or 'logout'
  failureReason?: string;          // Reason for failure
  location?: {                     // Geo location (if available)
    country?: string;
    city?: string;
    region?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// LoginHistory schema
const loginHistorySchema = new Schema<ILoginHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    phone: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    success: { type: Boolean, required: true },
    action: { 
      type: String, 
      enum: ["login", "logout"], 
      default: "login" 
    },
    failureReason: { type: String, default: null },
    location: {
      country: { type: String, default: null },
      city: { type: String, default: null },
      region: { type: String, default: null }
    }
  },
  { timestamps: true }
);

// Indexes for efficient querying
loginHistorySchema.index({ user: 1, timestamp: -1 });
loginHistorySchema.index({ phone: 1, timestamp: -1 });
loginHistorySchema.index({ ipAddress: 1, timestamp: -1 });
loginHistorySchema.index({ success: 1, timestamp: -1 });
loginHistorySchema.index({ timestamp: -1 }); // For cleanup queries

// TTL index to auto-delete old records after 6 months
loginHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 15552000 }); // 180 days

// Export LoginHistory model
export const LoginHistory =
  (model<ILoginHistory>('LoginHistory', loginHistorySchema) as Model<ILoginHistory>) ||
  model<ILoginHistory>('LoginHistory', loginHistorySchema);