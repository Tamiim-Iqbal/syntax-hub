import express from "express";
import cors from "cors";

import courseRoutes from "./routes/course.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import { apiRateLimit, securityHeaders } from "./middleware/security.middleware.js";

const app = express();

// Render sits behind a reverse proxy; trust the first proxy hop so req.ip
// reflects the client IP used by the rate limiter.
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(securityHeaders);
app.use(apiRateLimit);


const configuredOrigins = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

// Keep localhost origins for development, but never add them implicitly in production.
const developmentOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

const allowedOrigins = Array.from(
  new Set(isProduction ? configuredOrigins : [...developmentOrigins, ...configuredOrigins])
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({
    success: true,
    message: "SyntaxHub API is running",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Admin-only routes
app.use("/api/admin", adminRoutes);

// Course routes
app.use("/api/courses", courseRoutes);

// Global error handler
app.use(errorHandler);

export default app;