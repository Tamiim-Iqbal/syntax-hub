import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  console.error("❌ API Error:", error);

  // MongoDB duplicate key error
  if (error?.code === 11000) {
    res.status(409).json({
      success: false,
      message: "A course with this slug already exists",
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

export default errorHandler;
