import { Document, Schema, Types, model, models } from "mongoose";

// Interface for API Access Log
export interface IApiAccessLog extends Document {
  apiKey: Types.ObjectId; // Reference to ApiConfig
  user?: Types.ObjectId; // Optional reference to User
  endpoint: string; // API route accessed
  method: string; // HTTP method (GET, POST, etc.)
  status: number; // HTTP response status code
  success: boolean; // Quick success/failure flag
  ip: string; // Request IP address
  requestHeaders?: Record<string, string>; // Optional headers info
  responseTime?: number; // Response time in ms
  timestamp: Date; // Time of access
  createdAt: Date; // Document creation time
  updatedAt: Date; // Document update time
}

// Schema definition
const apiAccessLogSchema = new Schema<IApiAccessLog>(
  {
    apiKey: { type: Schema.Types.ObjectId, ref: "ApiConfig", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    endpoint: { type: String, required: true },
    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },
    status: { type: Number, required: true },
    success: { type: Boolean, required: true, default: true },
    ip: { type: String, required: true },
    requestHeaders: { type: Schema.Types.Mixed, default: {} },
    responseTime: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for fast queries
apiAccessLogSchema.index({ apiKey: 1, timestamp: -1 });
apiAccessLogSchema.index({ user: 1, timestamp: -1 });
apiAccessLogSchema.index({ endpoint: 1, status: 1, timestamp: -1 });
apiAccessLogSchema.index({ success: 1, timestamp: -1 });

// Export Model
export const ApiAccessLog = models.ApiAccessLog || model<IApiAccessLog>(
  "ApiAccessLog",
  apiAccessLogSchema
);
