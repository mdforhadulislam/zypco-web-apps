import { Schema, model, Document, Model, Types } from 'mongoose';
import { User } from './User.model'; // Import User model

// Interface for LoginHistory document
export interface ILoginHistory extends Document {
  user: Types.ObjectId;            // Reference to User model
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;                 // Reason for failure
  attemptNumber: number;           // Consecutive failed attempts
  createdAt: Date;
  updatedAt: Date;
}

// LoginHistory schema
const loginHistorySchema = new Schema<ILoginHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
    success: { type: Boolean, required: true },
    reason: { type: String, default: null },
    attemptNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Pre-save hook to update user's lastLogin and loginCount
loginHistorySchema.pre<ILoginHistory>('save', async function (next) {
  if (this.success) {
    await User.findByIdAndUpdate(this.user, {
      $set: { lastLogin: this.timestamp },
      $inc: { loginCount: 1 }
    });
    // Reset attemptNumber on successful login
    this.attemptNumber = 1;
  } else {
    // Increment attemptNumber for failed login
    const lastAttempt = await model<ILoginHistory>('LoginHistory')
      .findOne({ user: this.user })
      .sort({ timestamp: -1 });
    this.attemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;
  }
  next();
});

// Indexes for fast analytics queries
loginHistorySchema.index({ user: 1, success: 1, timestamp: -1 });
loginHistorySchema.index({ success: 1, timestamp: -1 });

// Export LoginHistory model
export const LoginHistory =
  (model<ILoginHistory>('LoginHistory', loginHistorySchema) as Model<ILoginHistory>) ||
  model<ILoginHistory>('LoginHistory', loginHistorySchema);