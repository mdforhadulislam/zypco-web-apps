import { models } from "mongoose";
import { Document, Schema, Types, model } from "mongoose";

// Blog Interface
export interface IBlog extends Document {
  title: string;
  slug: string; // URL-friendly slug
  content: string;
  image?: string;
  author: Types.ObjectId;
  category: string; // service, news, update, promotion
  tags?: string[]; // SEO tags / keywords
  relatedService?: Types.ObjectId;
  status: string; // draft, review, published, archived
  isPublished: boolean;
  views: number;
  likes: number;
  dislikes: number;
  reactions?: {
    // Optional: social reactions
    [key: string]: number; // e.g., { love: 5, wow: 2, sad: 1 }
  };
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Blog Schema
const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    content: { type: String, required: true },
    image: { type: String, default: "" },

    author: { type: Schema.Types.ObjectId, ref: "User", required: true },

    category: {
      type: String,
      enum: ["service", "news", "update", "promotion"],
      default: "service",
    },

    tags: [{ type: String }], // SEO keywords

    relatedService: { type: Schema.Types.ObjectId, ref: "Service" },

    status: {
      type: String,
      enum: ["draft", "review", "published", "archived"],
      default: "draft",
    },

    isPublished: { type: Boolean, default: true },

    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    reactions: { type: Schema.Types.Mixed, default: {} },

    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

// Slug auto-generation from title
blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, "-");
  }
  next();
});

// Index for search & filter
blogSchema.index({ title: "text", content: "text", tags: 1 });
blogSchema.index({ category: 1, createdAt: -1 });

// Export Blog Model
export const Blog = models.Blog || model<IBlog>("Blog", blogSchema);
