import { Document, Schema, model } from "mongoose";

// Interface for offer details
interface IDiscountOffer {
  type: "discount";
  percentage: number;
}

interface IRateModifierOffer {
  type: "rate_modifier";
  modifier: number;
  affectedRates: string[];
}

type IOfferDetails = IDiscountOffer | IRateModifierOffer;

// Main Offer Interface
export interface IOffer extends Document {
  name: string;
  description: string;
  offerDetails: IOfferDetails;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  targetUsers: "all" | "new" | "specific_group";
  createdBy: Schema.Types.ObjectId;
}

// Sub-schema for offer details with conditional validation
// We'll define a separate type for the subdocument
interface IOfferDetailsSubdocument {
  type: "discount" | "rate_modifier";
  percentage?: number;
  modifier?: number;
  affectedRates?: string[];
}

const offerDetailsSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["discount", "rate_modifier"],
      required: true,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      required: function (this: IOfferDetailsSubdocument) {
        return this.type === "discount";
      },
    },
    modifier: {
      type: Number,
      required: function (this: IOfferDetailsSubdocument) {
        return this.type === "rate_modifier";
      },
    },
    affectedRates: {
      type: [String],
      required: function (this: IOfferDetailsSubdocument) {
        return this.type === "rate_modifier";
      },
    },
  },
  { _id: false }
);

// Main Offer Schema
const offerSchema = new Schema<IOffer>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    offerDetails: {
      type: offerDetailsSchema,
      required: true,
    },
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    targetUsers: {
      type: String,
      enum: ["all", "new", "specific_group"],
      default: "all",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Indexes for efficient querying by date and active status
offerSchema.index({ validUntil: 1, isActive: 1 });
offerSchema.index({ "offerDetails.type": 1 });

// Export the model
export const Offer = model<IOffer>("Offer", offerSchema);
