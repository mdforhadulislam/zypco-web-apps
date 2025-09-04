import { Model } from "mongoose";
import { Document, Schema, model } from "mongoose";

// Address Sub-schema
const addressSchema = new Schema({
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  zipCode: { type: String, default: "" },
  country: { type: Schema.Types.ObjectId, ref: "Country", default: null },
});

// User Info Sub-schema (sender / receiver)
const userInfoSchema = new Schema({
  name: { type: String, default: "" },
  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  address: { type: addressSchema, default: () => ({}) },
});

// Product Sub-schema (single product)
const listSchema = new Schema({
  name: { type: String, required: true, default: "" },
  quantity: { type: Number, required: true, default: 1 },
  unitPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },
});

// Box Sub-schema (each box with dimensions + fragile)
const boxSchema = new Schema({
  length: { type: Number, default: 0 },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  fragile: { type: Boolean, default: false },
});

// Parcel Sub-schema
const parcelSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "Country", default: null },
  to: { type: Schema.Types.ObjectId, ref: "Country", default: null },
  sender: { type: userInfoSchema, default: () => ({}) },
  receiver: { type: userInfoSchema, default: () => ({}) },
  box: { type: [boxSchema], default: [] },
  weight: { type: String, required: true },
  serviceType: { type: String, default: "" },
  priority: {
    type: String,
    enum: ["normal", "express", "super-express", "tax-paid"],
    default: "normal",
  },
  orderType: {
    type: String,
    enum: ["document", "parcel", "e-commerce"],
    default: "parcel",
  },
  item: { type: [listSchema], default: () => [] },
  customerNote: { type: String, default: "" },
});

// Payment Sub-schema
const paymentSchema = new Schema({
  pType: { type: String, required: true, default: "" },
  pAmount: { type: Number, required: true, default: 0 },
  pOfferDiscount: { type: Number, required: true, default: 0 },
  pExtraCharge: { type: Number, required: true, default: 0 },
  pDiscount: { type: Number, required: true, default: 0 },
  pReceived: { type: Number, required: true, default: 0 },
  pRefunded: { type: Number, required: true, default: 0 },
});

// Handover Sub-schema
const handoverSchema = new Schema({
  company: { type: String, default: "" },
  tracking: { type: String, default: "" },
  payment: { type: Number, default: 0 },
});

// Main Order Interface
export interface IOrder extends Document {
  parcel: typeof parcelSchema;
  orderDate: Date;
  payment: typeof paymentSchema;
  trackId: string;
  handover_by: typeof handoverSchema;
  createdAt: Date;
  updatedAt: Date;
}

// Main Order Schema
const orderSchema = new Schema<IOrder>(
  {
    parcel: { type: parcelSchema, required: true },
    orderDate: { type: Date, default: Date.now, required: true },

    payment: { type: paymentSchema, required: true },
    trackId: { type: String, required: true, unique: true },
    handover_by: { type: handoverSchema, required: true, default: () => ({}) },
  },
  { timestamps: true }
);

// Export Order Model
export const Order = (model<IOrder>("Order") as Model<IOrder>) || model<IOrder>("Order", orderSchema);

