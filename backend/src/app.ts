import express from "express";
import cors from "cors";

import courseRoutes from "./routes/course.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import errorHandler from "./middleware/error.middleware.js";
import { apiRateLimit, securityHeaders } from "./middleware/security.middleware.js";

const app = express();

app.disable("x-powered-by");
app.use(securityHeaders);
app.use(apiRateLimit);

const configuredOrigins = (process.env.CLIENT_URL ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Local development defaults. CLIENT_URL can add/override production origins.
const allowedOrigins = Array.from(
  new Set([
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    ...configuredOrigins,
  ])
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