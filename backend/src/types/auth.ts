import type { Request } from "express";
import type { UserRole } from "../models/User.js";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthRequest = Request & {
  user?: AuthUser;
};
