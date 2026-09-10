import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = Number(process.env.PORT) || 5050;
const HOST = "0.0.0.0";

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, HOST, () => {
    const displayHost = process.env.NODE_ENV === "production" ? HOST : "localhost";
    console.log(`🚀 SyntaxHub API running on http://${displayHost}:${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log("✅ HTTP server closed.");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("❌ Forced shutdown after timeout.");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((error) => {
  console.error("❌ Failed to start SyntaxHub API:", error);
  process.exit(1);
});
