import { Document, Schema, model } from "mongoose";

interface IPriceCategory {
  gm500?: number;
  gm1000?: number;
  gm1500?: number;
  gm2000?: number;
  gm2500?: number;
  gm3000?: number;
  gm3500?: number;
  gm4000?: number;
  gm4500?: number;
  gm5000?: number;
  gm5500?: number;
  kg6to10?: number;
  kg11to20?: number;
  kg21to30?: number;
  kg31to40?: number;
  kg41to50?: number;
  kg51to80?: number;
  kg81to100?: number;
  kg101to500?: number;
  kg501to1000?: number;
}

interface IRate {
  name: string; // যেমন premium / affordable / economy
  profitPercentage: number;
  gift: number;
  price: IPriceCategory;
}

export interface IPrice extends Document {
  from: { id: string; country: string };
  to: { id: string; country: string };
  rate: IRate[];
  createdAt: Date;
  updatedAt: Date;
}

const priceCategorySchema = new Schema<IPriceCategory>(
  {
    gm500: { type: Number, default: NaN },
    gm1000: { type: Number, default: NaN },
    gm1500: { type: Number, default: NaN },
    gm2000: { type: Number, default: NaN },
    gm2500: { type: Number, default: NaN },
    gm3000: { type: Number, default: NaN },
    gm3500: { type: Number, default: NaN },
    gm4000: { type: Number, default: NaN },
    gm4500: { type: Number, default: NaN },
    gm5000: { type: Number, default: NaN },
    gm5500: { type: Number, default: NaN },
    kg6to10: { type: Number, default: NaN },
    kg11to20: { type: Number, default: NaN },
    kg21to30: { type: Number, default: NaN },
    kg31to40: { type: Number, default: NaN },
    kg41to50: { type: Number, default: NaN },
    kg51to80: { type: Number, default: NaN },
    kg81to100: { type: Number, default: NaN },
    kg101to500: { type: Number, default: NaN },
    kg501to1000: { type: Number, default: NaN },
  },
  { _id: false }
);

const rateSchema = new Schema<IRate>(
  {
    name: { type: String, required: true, trim: true },
    profitPercentage: { type: Number, required: true, default: 15 },
    gift: { type: Number, required: true, default: 15 },
    price: { type: priceCategorySchema, default: {} },
  },
  { _id: false }
);

const priceSchema = new Schema<IPrice>(
  {
    from: { type: Schema.Types.ObjectId, ref: "Country", default: null },
    to: { type: Schema.Types.ObjectId, ref: "Country", default: null },
    rate: { type: [rateSchema], default: [] },
  },
  { timestamps: true }
);

priceSchema.index({ "from.country": 1, "to.country": 1 });
priceSchema.index({ "rate.name": 1 });
priceSchema.index({ createdAt: -1 });
// priceSchema.index({ "rate.price.gm500": 1, "rate.price.kg6to10": 1 }); // Example index for specific price fields

// Export Price Model
export const Price = model<IPrice>("Price", priceSchema);
