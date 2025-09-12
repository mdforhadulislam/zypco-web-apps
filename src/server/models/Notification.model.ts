import { Document, Schema, Types, model, models } from "mongoose";

// Notification Interface
export interface INotification extends Document {
  user: Types.ObjectId; // User reference
  title: string; // Notification title
  message: string; // Notification message/body
  type: string; // e.g., "info", "success", "warning", "error", "promo"
  read: boolean; // Has the user read it
  sentAt: Date; // When notification was created
  createdAt: Date;
  updatedAt: Date;
}

// Notification Schema
const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, default: "" },
    message: { type: String, required: true, default: "" },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "promo"],
      default: "info",
    },
    read: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes for faster queries
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ sentAt: -1 });

// Export Notification Model
export const Notification = models.Notification || model<INotification>(
  "Notification",
  notificationSchema
);
