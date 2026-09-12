import { Schema, model, type Document } from "mongoose";

const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "single-language",
        "multi-language",
        "problem-solving",
        "nested",
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: String,
      required: true,
      trim: true,
    },

    /*
     * A course can have completely different structures.
     *
     * Example:
     * - JavaScript → topics + subtopics
     * - C# → topics + sections
     * - DSA → weeks + problems
     * - CSS → topics + examples + images
     *
     * So we intentionally keep the content flexible.
     */
    content: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },

    /*
     * Optional metadata for courses that support
     * multiple programming languages.
     */
    languages: {
      type: [Schema.Types.Mixed],
      default: undefined,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    // Top-level courses appear on Home/Courses. Courses created from a
    // Nested learning path can opt out and remain reachable only through
    // that learning path. Existing documents without this field are treated
    // as top-level for backward compatibility.
    isTopLevel: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export interface ICourse extends Document {
  title: string;
  slug: string;
  category: string;
  
  type:
    | "single-language"
    | "multi-language"
    | "problem-solving"
    | "nested";

  description: string;
  level: string;
  content: unknown;
  languages?: unknown[];
  isPublished: boolean;
  isTopLevel?: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

CourseSchema.index({ isPublished: 1, order: 1, createdAt: -1 });
CourseSchema.index({ slug: 1, isPublished: 1 });

const Course = model<ICourse>("Course", CourseSchema);

export default Course;