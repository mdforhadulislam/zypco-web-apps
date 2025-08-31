import { Schema, model, Document, Types } from "mongoose";

// Contact Interface
export interface IContact extends Document {
  name: string;                     // Name of the person contacting
  email: string;                    // Email address
  phone?: string;                   // Optional phone number
  message: string;                  // The actual message
  status: string;                   // 'new', 'in-progress', 'resolved'
  category: string;                 // 'inquiry', 'complaint', 'feedback', 'support'
  priority: string;                 // 'low', 'normal', 'high'
  isRead: boolean;                  // Has admin read this contact
  replies: {                         // Admin replies
    message: string;
    responder: Types.ObjectId;       // User reference (admin)
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Contact Schema
const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true, 
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
    },
    phone: { type: String, default: "" },
    message: { type: String, required: true },

    status: { 
      type: String, 
      enum: ["new", "in-progress", "resolved"], 
      default: "new" 
    },

    category: { 
      type: String, 
      enum: ["inquiry","complaint","feedback","support"], 
      default: "inquiry" 
    },

    priority: { 
      type: String, 
      enum: ["low","normal","high"], 
      default: "normal" 
    },

    isRead: { type: Boolean, default: false },

    replies: [
      {
        message: { type: String, required: true },
        responder: { type: Schema.Types.ObjectId, ref: "User", required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

// Indexes
contactSchema.index({ status: 1, createdAt: -1 });
contactSchema.index({ email: 1 });

// Export Contact Model
export const Contact = model<IContact>("Contact", contactSchema);