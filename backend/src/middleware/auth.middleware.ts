import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../types/auth.js";
import { verifyToken } from "../services/auth.service.js";

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ success: false, message: "Authentication required" });
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }

  req.user = user;
  next();
};
