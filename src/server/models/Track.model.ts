import { Document, Model, model, Schema, Types } from "mongoose";
 
const trackingStepSchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        "created",
        "pickup-pending",
        "picked-up",
        "in-transit",
        "arrived-at-hub",
        "customs-clearance",
        "out-for-delivery",
        "delivered",
        "failed",
        "cancelled",
      ],
      default: "created",
      required: true,
    },
    location: {
      city: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    description: { type: String, default: "" }, // e.g., "Package scanned at Dhaka Hub"
    updatedBy: { type: Types.ObjectId, ref: "User", default: null }, // staff/admin who updated
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);
 
export interface ITrack extends Document {
  order: Types.ObjectId; // Reference to Order
  trackId: string;       // Auto-generated from Order
  currentStatus: string; // latest status
  history: (typeof trackingStepSchema)[];
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}
 
const trackSchema = new Schema<ITrack>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    trackId: { type: String, required: true, unique: true },
    currentStatus: {
      type: String,
      enum: [
        "created",
        "pickup-pending",
        "picked-up",
        "in-transit",
        "arrived-at-hub",
        "customs-clearance",
        "out-for-delivery",
        "delivered",
        "failed",
        "cancelled",
      ],
      default: "created",
    },
    history: { type: [trackingStepSchema], default: [] },
    estimatedDelivery: { type: Date, default: null },
  },
  { timestamps: true }
);
 
trackSchema.pre("validate", async function (next) {
  if (!this.trackId && this.order) {
    // Import Order model dynamically
    const { Order } = await import("./Order.model");

    const orderDoc = await Order.findById(this.order);
    if (orderDoc) {
      this.trackId = orderDoc.trackId;
    }
  }
  next();
});
 
trackSchema.index({ trackId: 1 });
trackSchema.index({ currentStatus: 1 });

// Export Track Model
export const Track = (model<ITrack>("Track") as Model<ITrack>) || model<ITrack>("Track", trackSchema);