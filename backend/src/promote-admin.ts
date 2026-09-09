import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: npm run make-admin -- user@example.com");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const user = await User.findOneAndUpdate(
      { email },
      { role: "admin" },
      { new: true }
    ).select("_id name email role");

    if (!user) {
      console.error(`No user found for ${email}`);
      process.exitCode = 1;
      return;
    }

    console.log(`✅ ${user.email} is now an admin.`);
  } catch (error) {
    console.error("❌ Failed to make admin:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void run();
