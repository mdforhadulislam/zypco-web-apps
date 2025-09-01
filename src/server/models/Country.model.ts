import { Schema, model, Document, Model } from "mongoose";

// Interface
export interface ICountry extends Document {
  name: string;           // Full country name, e.g., "Bangladesh"
  code: string;           // ISO 2-letter code, e.g., "BD"
  phoneCode?: string;     // Country dialing code, e.g., "+880"
  flagUrl?: string;       // Optional flag image URL
  timezone?: string;      // Default timezone, e.g., "Asia/Dhaka"
  zone?: string;          // Optional zone/region, e.g., "South Asia"
  isActive: boolean;      // Enable/disable country
  deactivatedAt?: Date;   // If country is deactivated
  deactivatedReason?: string; // Reason for deactivation
  createdAt: Date;
  updatedAt: Date;
}

// Schema
const countrySchema = new Schema<ICountry>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    phoneCode: {
      type: String,
      default: null,
    },
    flagUrl: {
      type: String,
      default: null,
    },
    timezone: {
      type: String,
      default: null,
    },
    zone: {
      type: String,
      default: null, // optional, e.g., "South Asia", "Europe"
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    deactivatedReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index for fast lookup
countrySchema.index({ name: 1 });
countrySchema.index({ code: 1 });
countrySchema.index({ zone: 1 }); // optional zone index for faster filtering

// Export model
export const Country = (model<ICountry>("Country") as Model<ICountry>) || model<ICountry>("Country", countrySchema);