import express from "express";
import cors from "cors";

import courseRoutes from "./routes/course.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

const allowedOrigin =
  process.env.CLIENT_URL ??
  "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
  })
);

app.use(express.json());

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