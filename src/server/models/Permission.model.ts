import { Schema, model, models, Types } from "mongoose";

/**
 * IPermission: POJO interface (do NOT extend Document here)
 * We'll use this interface as the generic for model<T>.
 */
export interface IPermission {
  user: Types.ObjectId; // reference to User
  permissions: string[]; // array of permission keys
  description?: string;
  grantedBy?: string;
  grantedAt?: Date;
  revokedAt?: Date | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Permission schema
const permissionSchema = new Schema<IPermission>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // <-- Here is the fix: use array of string type
    permissions: {
      type: [String], // correct way to declare string array for mongoose
      required: true,
      default: ["dashboard", "pickup", "order", "setting"],
    },
    description: {
      type: String,
      default: "",
    },
    grantedBy: {
      type: String,
      default: "",
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// pre-save hook (keep as-is)
permissionSchema.pre("save", function (next) {
  // `this` has type `any` inside mongoose middleware unless you type it specially
  // but function works as expected in runtime
  // mark revokedAt if isActive was turned false and revokedAt not set
 
  if (!this.isActive && !this.revokedAt) {
 
    this.revokedAt = new Date();
  }
  next();
});

// Export model (use existing models.Permission if exists)
export const Permission = models.Permission || model<IPermission>("Permission", permissionSchema);
