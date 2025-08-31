import { Schema, model, Document, Types } from "mongoose";

// Address Interface
export interface IAddress extends Document {
  user: Types.ObjectId;           // User reference
  name: string;                   // Name of the person at this address
  label?: string;                 // e.g., "Home", "Office"
  addressLine: string;            // Street address
  area?: string;                  // Neighborhood / area
  subCity?: string;               // Sub-city / locality
  city: string;                   // City
  state?: string;                 // State / Province
  zipCode?: string;               // Postal code
  country: Types.ObjectId;        // Country reference
  phone?: string;                 // Optional phone number
  isDefault: boolean;             // Default address flag
  createdAt: Date;
  updatedAt: Date;
}

// Address Schema
const addressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },   // New field: Name
    label: { type: String, default: "" },
    addressLine: { type: String, required: true },
    area: { type: String, default: "" },
    subCity: { type: String, default: "" },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: Schema.Types.ObjectId, ref: "Country", required: true },
    phone: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes for faster queries
addressSchema.index({ user: 1, isDefault: -1 });
addressSchema.index({ country: 1, state: 1, city: 1, subCity: 1 });
addressSchema.index({ area: 1 });

// Export Address Model
export const Address = model<IAddress>("Address", addressSchema);