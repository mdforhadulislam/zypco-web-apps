import { Document, Schema, Types, model, models } from "mongoose";

export interface IAddress extends Document {
  user: Types.ObjectId ; // Linked User
  name: string; // Person Name
  label?: string; // e.g., "Home", "Office"
  addressLine: string; // Street Address
  area?: string; // Neighborhood / Area
  subCity?: string; // Sub-city / Locality
  city: string; // City
  state?: string; // State / Province
  zipCode?: string; // Postal / ZIP Code
  country: Types.ObjectId; // Linked Country
  phone?: string; // Optional Contact Number
  isDefault: boolean; // Default Address?
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date; // Soft delete
  isDeleted: boolean; // Soft delete flag
}

const addressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    label: { type: String, trim: true, default: "Home" },
    addressLine: { type: String, required: true, trim: true },
    area: { type: String, trim: true, default: "" },
    subCity: { type: String, trim: true, default: "" },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true, default: "" },
    zipCode: { type: String, trim: true, default: "" },
    country: { type: Schema.Types.ObjectId, ref: "Country", required: true },
    phone: { type: String, trim: true, default: "" },
    isDefault: { type: Boolean, default: false },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",required: false,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false,
        default: [1, 1],
        
      },
    },
  },
  { timestamps: true }
);
addressSchema.index({ user: 1, isDefault: -1 });
addressSchema.index({ country: 1, state: 1, city: 1, subCity: 1 });
addressSchema.index({ area: 1 });

addressSchema.pre<IAddress>("save", async function (next) {
  if (this.isDefault) {
    await (this.constructor as typeof Address).updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

export const Address = models.Address || model<IAddress>("Address", addressSchema);
