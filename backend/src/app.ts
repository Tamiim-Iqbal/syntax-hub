import express from "express";
import cors from "cors";

import courseRoutes from "./routes/course.routes.js";

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

export default app;