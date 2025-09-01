import { Schema, model, Document, Types, Model } from 'mongoose';

// Interface for API Access Log
export interface IApiAccessLog extends Document {
  apiKey: Types.ObjectId;       // Reference to ApiConfig
  user?: Types.ObjectId;        // Optional reference to User
  endpoint: string;            // API route accessed
  method: string;              // HTTP method (GET, POST, etc.)
  status: number;              // HTTP response status code
  ip: string;                  // Request IP address
  timestamp: Date;             // Time of access
  createdAt: Date;             // Document creation time
  updatedAt: Date;            // Document update time
}

// Schema definition
const apiAccessLogSchema = new Schema<IApiAccessLog>(
  {
    apiKey: {
      type: Schema.Types.ObjectId,
      ref: 'ApiConfig',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    endpoint: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// Performance indexes
apiAccessLogSchema.index({ apiKey: 1, timestamp: -1 }); // Sort descending by timestamp
apiAccessLogSchema.index({ user: 1, timestamp: -1 });   // For user-specific queries

// Model export
export const ApiAccessLog = (model<IApiAccessLog>('ApiAccessLog', apiAccessLogSchema) as Model<IApiAccessLog>) || model<IApiAccessLog>('ApiAccessLog', apiAccessLogSchema);