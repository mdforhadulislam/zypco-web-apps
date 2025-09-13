import { Schema, model, models, Document } from "mongoose";

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  category: "account" | "order" | "payment" | "system" | "security";
  channels: ("email" | "sms" | "inapp")[];
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["success", "error", "info", "warning"],
      default: "info",
    },
    category: {
      type: String,
      enum: ["account", "order", "payment", "system", "security"],
      default: "system",
    },
    channels: {
      type: [String],
      enum: ["email", "sms", "inapp"],
      default: ["inapp"],
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);


// Indexes for faster queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

// Export Notification Model
export const Notification = models.Notification || model<INotification>(
  "Notification",
  notificationSchema
);
