import bcrypt from "bcryptjs";
import crypto from "crypto"; 
import { Document, Schema, model, models } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  isVerified: boolean;
  avatar?: string;
  
  // Security fields
  loginAttempts?: number;
  lockUntil?: Date;
  lastLogin?: Date;
  refreshTokens?: string[];
  registrationIP?: string;
  
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisibility: "public" | "private";
      dataSharing: boolean;
    };
  };
  
  nid: {
    front?: string;
    back?: string;
    verified?: boolean;
  };
  
  emailVerification: {
    code: string | null;
    expires: Date | null;
    attempts?: number;
  };

  // Profile completion
  profileCompletion: {
    basicInfo: boolean;
    contactVerified: boolean;
    identityVerified: boolean;
    percentage: number;
  };

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationCode(): string;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
  updateProfileCompletion(): void;
}

// User Schema with comprehensive validation
const userSchema = new Schema<IUser>(
  {
    name: { 
      type: String, 
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name must not exceed 50 characters"],
      match: [/^[a-zA-Z\s\-.']+$/, "Name contains invalid characters"]
    },
    
    phone: { 
      type: String, 
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          return /^\+?[1-9]\d{7,14}$/.test(v);
        },
        message: "Invalid phone number format"
      }
    },
    
    email: { 
      type: String, 
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email must not exceed 254 characters"],
      validate: {
        validator: function(v: string) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: "Invalid email format"
      }
    },
    
    password: { 
      type: String, 
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      maxlength: [128, "Password must not exceed 128 characters"],
      select: false, // Don't return password by default
      validate: {
        validator: function(v: string) {
          // Only validate on new passwords (not on existing hashed ones)
          if (this.isNew || this.isModified('password')) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
          }
          return true;
        },
        message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      }
    },
    
    role: {
      type: String,
      enum: {
        values: ["user", "admin", "moderator"],
        message: "Role must be either user, admin, or moderator"
      },
      default: "user",
    },
    
    isActive: { 
      type: Boolean, 
      default: true,
      index: true
    },
    
    isVerified: { 
      type: Boolean, 
      default: false,
      index: true
    },
    
    avatar: { 
      type: String, 
      default: null,
      validate: {
        validator: function(v: string) {
          if (!v) return true;
          return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: "Avatar must be a valid image URL"
      }
    },

    // Security fields
    loginAttempts: {
      type: Number,
      default: 0,
      max: 10
    },
    
    lockUntil: {
      type: Date,
      default: null
    },
    
    lastLogin: {
      type: Date,
      default: null
    },
    
    refreshTokens: {
      type: [String],
      default: [],
      validate: {
        validator: function(tokens: string[]) {
          return tokens.length <= 5; // Max 5 concurrent sessions
        },
        message: "Maximum 5 concurrent sessions allowed"
      }
    },
    
    registrationIP: {
      type: String,
      default: null
    },

    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      privacy: {
        profileVisibility: {
          type: String,
          enum: ["public", "private"],
          default: "public"
        },
        dataSharing: { type: Boolean, default: false }
      }
    },
    
    nid: {
      front: { 
        type: String, 
        default: null,
        validate: {
          validator: function(v: string) {
            if (!v) return true;
            return /^https?:\/\/.+\.(jpg|jpeg|png|pdf)$/i.test(v);
          },
          message: "NID front must be a valid image or PDF URL"
        }
      },
      back: { 
        type: String, 
        default: null,
        validate: {
          validator: function(v: string) {
            if (!v) return true;
            return /^https?:\/\/.+\.(jpg|jpeg|png|pdf)$/i.test(v);
          },
          message: "NID back must be a valid image or PDF URL"
        }
      },
      verified: { type: Boolean, default: false }
    },
    
    emailVerification: {
      code: { 
        type: String, 
        default: null,
        select: false // Don't return verification code
      },
      expires: { 
        type: Date, 
        default: null 
      },
      attempts: {
        type: Number,
        default: 0,
        max: 5 // Max 5 verification attempts
      }
    },

    profileCompletion: {
      basicInfo: { type: Boolean, default: false },
      contactVerified: { type: Boolean, default: false },
      identityVerified: { type: Boolean, default: false },
      percentage: { 
        type: Number, 
        default: 0,
        min: 0,
        max: 100
      }
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        // Remove sensitive fields from JSON output
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.emailVerification.code;
        delete ret.registrationIP;
        return ret;
      }
    }
  }
);

// Indexes for performance and uniqueness
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ isVerified: 1, isActive: 1 });
userSchema.index({ lockUntil: 1 }, { sparse: true });
userSchema.index({ "emailVerification.expires": 1 }, { sparse: true, expireAfterSeconds: 0 });

// Password hashing with stronger rounds
userSchema.pre("save", async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified("password")) return next();
  
  try {
    // Use higher rounds for better security (12 rounds)
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Update profile completion on save
userSchema.pre("save", function (next) {
  this.updateProfileCompletion();
  next();
});

// Instance method: Compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Instance method: Generate secure verification code
userSchema.methods.generateVerificationCode = function (): string {
  // Generate cryptographically secure 6-digit code
  const code = crypto.randomInt(100000, 999999).toString(); // 6 digits
  this.emailVerification.code = code;
  this.emailVerification.expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry
  this.emailVerification.attempts = 0; // Reset attempts
  return code;
};

// Instance method: Check if account is locked
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Instance method: Increment login attempts and lock if necessary
userSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // Max 5 failed attempts before locking for 15 minutes
  const maxAttempts = 5;
  const lockTime = 15 * 60 * 1000; // 15 minutes

  this.loginAttempts = (this.loginAttempts || 0) + 1;

  if (this.loginAttempts >= maxAttempts) {
    this.lockUntil = new Date(Date.now() + lockTime);
  }

  await this.save();
};

// Instance method: Reset login attempts
userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  await this.save();
};

// Instance method: Update profile completion
userSchema.methods.updateProfileCompletion = function (): void {
  let completion = 0;

  // Basic info (name, email, phone) - 40%
  if (this.name && this.email && this.phone) {
    this.profileCompletion.basicInfo = true;
    completion += 40;
  }

  // Contact verified (email + phone) - 40%
  if (this.isVerified) {
    this.profileCompletion.contactVerified = true;
    completion += 40;
  }

  // Identity verified (NID) - 20%
  if (this.nid.verified) {
    this.profileCompletion.identityVerified = true;
    completion += 20;
  }

  this.profileCompletion.percentage = completion;
};

// Static method: Find by credentials
userSchema.statics.findByCredentials = async function(identifier: string, password: string) {
  // Allow login with either email or phone
  const user = await this.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
    isActive: true
  }).select("+password");

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return user;
};

// Static method: Clean expired verification codes
userSchema.statics.cleanExpiredVerifications = async function() {
  return this.updateMany(
    { "emailVerification.expires": { $lt: new Date() } },
    { 
      $unset: { 
        "emailVerification.code": 1,
        "emailVerification.expires": 1
      },
      $set: { "emailVerification.attempts": 0 }
    }
  );
};

// Export User model
export const User = models.User || model<IUser>("User", userSchema);