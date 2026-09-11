import type { NextFunction, Request, Response } from "express";

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const AUTH_MAX_REQUESTS = 12;

// Prevent expired IP buckets from accumulating forever in a long-running process.
const cleanupBuckets = () => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

export const securityHeaders = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
};

export const apiRateLimit = (req: Request, res: Response, next: NextFunction) => {
  const isAuthEndpoint = req.path.startsWith("/api/auth/");
  const maxRequests = isAuthEndpoint ? AUTH_MAX_REQUESTS : MAX_REQUESTS;
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const bucket = buckets.get(key);

  // Occasional cleanup keeps the in-memory limiter bounded.
  if (buckets.size > 1000) {
    cleanupBuckets();
  }

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }

  if (bucket.count >= maxRequests) {
    res.status(429).json({
      success: false,
      message: "Too many requests. Please try again shortly.",
    });
    return;
  }

  bucket.count += 1;
  next();
};
