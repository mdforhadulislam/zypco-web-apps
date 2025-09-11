import { Document, Schema, Types, model } from "mongoose";

// Pickup Interface
export interface IPickup extends Document {
  user: Types.ObjectId; // User reference
  moderator?: Types.ObjectId; // Moderator/User who handled the pickup
  pickupAddress: Types.ObjectId; // Reference to Address model
  preferredDate: Date; // Preferred pickup date
  preferredTimeSlot?: string; // Optional time slot e.g., "09:00-12:00"
  status: string; // 'pending', 'scheduled', 'picked', 'cancelled'
  notes?: string; // Optional notes
  cost?: number; // Cost of pickup
  createdAt: Date;
  updatedAt: Date;
}

// Pickup Schema
const pickupSchema = new Schema<IPickup>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    moderator: { type: Schema.Types.ObjectId, ref: "User", default: null }, // optional
    pickupAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    preferredDate: { type: Date, required: true },
    preferredTimeSlot: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "scheduled", "picked", "cancelled"],
      default: "pending",
    },
    notes: { type: String, default: "" },
    cost: { type: Number, default: 0 }, // optional cost field
  },
  { timestamps: true }
);

// Indexes
pickupSchema.index({ user: 1, moderator: 1, preferredDate: 1 });
pickupSchema.index({ status: 1, preferredDate: 1 });

// Export Pickup Model
export const Pickup = model<IPickup>("Pickup", pickupSchema);
