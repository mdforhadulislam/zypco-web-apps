import { Schema, model, models, Document, Types } from "mongoose";

interface ILoginHistory extends Document {
  user?: Types.ObjectId;
  phone: string;
  ipAddress: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  action: "login" | "logout" | "failed_login" | "password_reset" | "account_lock";
  timestamp: Date;
  sessionId?: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

const LocationSchema = new Schema({
  country: { type: String },
  city: { type: String },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  }
}, { _id: false });

const DeviceInfoSchema = new Schema({
  browser: { type: String },
  os: { type: String },
  device: { type: String }
}, { _id: false });

const LoginHistorySchema = new Schema<ILoginHistory>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
    index: true,
  },
  phone: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  ipAddress: {
    type: String,
    required: true,
    index: true,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: false,
    index: true,
  },
  failureReason: {
    type: String,
    enum: [
      "Invalid password",
      "User not found", 
      "Account deactivated",
      "Account locked",
      "Email not verified",
      "Invalid phone format",
      "Missing credentials",
      "Rate limited",
      "Server error",
      "Invalid token",
      "Token expired",
      "Other"
    ],
    required: function(this: ILoginHistory) {
      return !this.success;
    }
  },
  action: {
    type: String,
    enum: ["login", "logout", "failed_login", "password_reset", "account_lock"],
    required: true,
    default: "login",
    index: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  sessionId: {
    type: String,
    trim: true,
    index: true,
  },
  location: LocationSchema,
  deviceInfo: DeviceInfoSchema,
}, {
  timestamps: false, // We're using custom timestamp field
  versionKey: false,
});

// Indexes for better query performance
LoginHistorySchema.index({ timestamp: -1 });
LoginHistorySchema.index({ success: 1, timestamp: -1 });
LoginHistorySchema.index({ user: 1, timestamp: -1 });
LoginHistorySchema.index({ ipAddress: 1, timestamp: -1 });
LoginHistorySchema.index({ phone: 1, success: 1 });
LoginHistorySchema.index({ action: 1, timestamp: -1 });

// Compound indexes for analytics queries
LoginHistorySchema.index({ success: 1, action: 1, timestamp: -1 });
LoginHistorySchema.index({ ipAddress: 1, success: 1, timestamp: -1 });

// Static methods for analytics
LoginHistorySchema.statics = {
  // Get login success rate for a time period
  async getSuccessRate(startDate: Date, endDate: Date) {
    const result = await this.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
          action: { $in: ["login", "failed_login"] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: { $sum: { $cond: ["$success", 1, 0] } }
        }
      },
      {
        $project: {
          successRate: { 
            $multiply: [
              { $divide: ["$successful", "$total"] }, 
              100
            ] 
          }
        }
      }
    ]);
    
    return result[0]?.successRate || 0;
  },

  // Get most active IPs
  async getTopIPs(limit: number = 10, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: "$ipAddress",
          totalAttempts: { $sum: 1 },
          successful: { $sum: { $cond: ["$success", 1, 0] } },
          failed: { $sum: { $cond: ["$success", 0, 1] } },
          uniqueUsers: { $addToSet: "$user" }
        }
      },
      {
        $project: {
          ipAddress: "$_id",
          totalAttempts: 1,
          successful: 1,
          failed: 1,
          uniqueUsers: { $size: "$uniqueUsers" },
          successRate: { 
            $multiply: [
              { $divide: ["$successful", "$totalAttempts"] }, 
              100
            ] 
          }
        }
      },
      { $sort: { totalAttempts: -1 } },
      { $limit: limit }
    ]);
  },

  // Get suspicious activities
  async getSuspiciousActivities(threshold: number = 5) {
    const recentDate = new Date();
    recentDate.setHours(recentDate.getHours() - 24); // Last 24 hours
    
    return this.aggregate([
      {
        $match: {
          timestamp: { $gte: recentDate },
          success: false
        }
      },
      {
        $group: {
          _id: {
            ipAddress: "$ipAddress",
            phone: "$phone"
          },
          failedAttempts: { $sum: 1 },
          reasons: { $addToSet: "$failureReason" },
          firstAttempt: { $min: "$timestamp" },
          lastAttempt: { $max: "$timestamp" }
        }
      },
      {
        $match: {
          failedAttempts: { $gte: threshold }
        }
      },
      { $sort: { failedAttempts: -1 } }
    ]);
  }
};

// Middleware to clean old entries (optional - for data retention)
LoginHistorySchema.pre('save', function() {
  // Add any pre-save logic here
  if (!this.timestamp) {
    this.timestamp = new Date();
  }
});

// Virtual for formatted timestamp
LoginHistorySchema.virtual('formattedTimestamp').get(function(this: ILoginHistory) {
  return this.timestamp.toLocaleString();
});

// Method to check if login attempt was recent
LoginHistorySchema.methods.isRecent = function(this: ILoginHistory, minutes: number = 5) {
  const now = new Date();
  const diffInMinutes = (now.getTime() - this.timestamp.getTime()) / (1000 * 60);
  return diffInMinutes <= minutes;
};

// Export the model
export const LoginHistory = models.LoginHistory || model<ILoginHistory>("LoginHistory", LoginHistorySchema);
export type { ILoginHistory };