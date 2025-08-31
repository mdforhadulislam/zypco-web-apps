import { Schema, model, Document, Types } from "mongoose";

// Review Interface
export interface IReview extends Document {
  user: Types.ObjectId;        // User reference
  rating: number;              // 1-5 rating
  comment: string;             // Review comment/body
  isVerified: boolean;         // Verified purchase or not
  isFeatured: boolean;         // Featured review by admin
  helpfulCount: number;        // How many users found this helpful
  status: string;              // e.g., 'pending', 'approved', 'rejected'
  createdAt: Date;
  updatedAt: Date;
}

// Review Schema
const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, default: "" },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    helpfulCount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

// Indexes
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1, createdAt: -1 });
reviewSchema.index({ status: 1 });

// Export Review Model
export const Review = model<IReview>("Review", reviewSchema);