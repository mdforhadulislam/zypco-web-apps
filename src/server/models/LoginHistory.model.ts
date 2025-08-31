import { Schema, model, Document } from 'mongoose';
import { User } from './User.model'; // Import User model

// Interface for LoginHistory document
interface ILoginHistory extends Document {
  user: typeof User.prototype._id; // Reference to User model
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  reason?: string; // Reason for failure (e.g., "Incorrect password")
}

// LoginHistory schema
const loginHistorySchema = new Schema<ILoginHistory>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required']
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required']
  },
  success: {
    type: Boolean,
    required: [true, 'Success status is required']
  },
  reason: {
    type: String,
    default: null
  }
}, { timestamps: true });

// Export the model
export const LoginHistory = model<ILoginHistory>('LoginHistory', loginHistorySchema);