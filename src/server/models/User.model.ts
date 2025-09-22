import bcrypt from "bcryptjs";
import crypto from "crypto"; 
import { Document, Schema, model ,models} from "mongoose";



export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
    };
  };
  nid: {
    front?: string;
    back?: string;
  };
  emailVerification: {
    code: string | null;
    expires: Date | null;
  };

  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationCode(): string;
}

// User Schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    avatar: { type: String, default:"" },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
      },
    },
    nid: {
      front: { type: String, default:"" },
      back: { type: String, default:"" },
    },
    emailVerification: {
      code: { type: String, default: null },
      expires: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare Password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate email verification code
userSchema.methods.generateVerificationCode = function () {
  const code = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-digit hex code
  this.emailVerification.code = code;
  this.emailVerification.expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry
  return code;
};

// Export User model
export const User = models.User || model<IUser>("User", userSchema);
