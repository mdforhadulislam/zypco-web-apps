import { Schema, model, Document, Types } from "mongoose";

// Pickup Interface
export interface IPickup extends Document {
  user: Types.ObjectId;            // User reference
  order: Types.ObjectId;           // Linked order
  pickupAddress: Types.ObjectId;   // Reference to Address model
  preferredDate: Date;             // Preferred pickup date
  preferredTimeSlot?: string;      // Optional time slot e.g., "09:00-12:00"
  status: string;                  // 'pending', 'scheduled', 'picked', 'cancelled'
  notes?: string;                  // Optional notes
  createdAt: Date;
  updatedAt: Date;
}

// Pickup Schema
const pickupSchema = new Schema<IPickup>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    pickupAddress: { type: Schema.Types.ObjectId, ref: "Address", required: true },
    preferredDate: { type: Date, required: true },
    preferredTimeSlot: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "scheduled", "picked", "cancelled"],
      default: "pending",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes
pickupSchema.index({ user: 1, order: 1 });
pickupSchema.index({ status: 1, preferredDate: 1 });

// Export Pickup Model
export const Pickup = model<IPickup>("Pickup", pickupSchema);