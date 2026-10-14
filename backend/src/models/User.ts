import { Schema, model, type Document } from "mongoose";

export type UserRole = "user" | "moderator" | "admin";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
    emailVerified: { type: Boolean, default: false, index: true },
    verificationTokenHash: { type: String, select: false },
    verificationTokenExpiresAt: { type: Date, select: false },
    lastVisitedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  lastVisitedAt?: Date | null;
  verificationTokenHash?: string;
  verificationTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const User = model<IUser>("User", UserSchema);
export default User;
