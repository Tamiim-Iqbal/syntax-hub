import type {
  ErrorRequestHandler,
} from "express";

const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  next
) => {
  console.error(
    "❌ API Error:",
    error
  );

  // Keep Express error-handler signature
  void next;

  // MongoDB duplicate key error
  if (error?.code === 11000) {
    res.status(409).json({
      success: false,
      message:
        "A course with this slug already exists",
    });

    return;
  }

  res.status(500).json({
    success: false,
    message:
      "Internal server error",
  });
};

export default errorHandler;