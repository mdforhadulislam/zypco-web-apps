import { Document, Model, Schema, Types, model } from "mongoose";

// Interface for User Permission document
export interface IPermission extends Document {
  user: Types.ObjectId; // Reference to User
  permissions: string[]; // Array of permissions (e.g., ['read:users', 'write:products'])
  description?: string; // Optional description for clarity
  grantedBy: Types.ObjectId; // Admin who granted the permissions
  grantedAt: Date;
  revokedAt?: Date; // If permissions are revoked
  isActive: boolean;
}

// User Permission Schema
const permissionSchema = new Schema<IPermission>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    description: {
      type: String,
      default: "",
    },
    grantedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Pre-save hook to handle revocation logic
permissionSchema.pre("save", function (next) {
  if (!this.isActive && !this.revokedAt) {
    this.revokedAt = new Date();
  }
  next();
});

// Export the model
export const Permission = (model<IPermission>("Permission") as Model<IPermission>) || model<IPermission>("Permission", permissionSchema);
