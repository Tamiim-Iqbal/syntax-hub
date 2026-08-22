import express from "express";
import cors from "cors";

import courseRoutes from "./routes/course.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "SyntaxHub API is running",
  });
});

// Course routes
app.use("/api/courses", courseRoutes);

// Global error handler
app.use(errorHandler);

export default app;