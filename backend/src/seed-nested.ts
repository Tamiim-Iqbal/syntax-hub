import "dotenv/config";
import connectDB from "./config/db.js";
import Course from "./models/Course.js";

const run = async () => {
  await connectDB();

  await Course.findOneAndUpdate(
    { slug: "nested" },
    {
      $setOnInsert: {
        title: "Nested",
        slug: "nested",
        category: "Learning Path",
        type: "nested",
        description: "Learn large topics through structured courses and technologies.",
        level: "Beginner",
        content: {
          courses: [
            {
              _id: "web-development",
              title: "Web Development",
              slug: "web-development",
              category: "Web Development",
              description: "A structured path for learning modern web development.",
              level: "Beginner",
              topicsCount: 0
            }
          ]
        },
        isPublished: true,
        order: 999
      }
    },
    { upsert: true, returnDocument: "after" }
  );

  console.log("✅ Nested course is ready. Existing courses were not modified.");
  process.exit(0);
};

run().catch((error) => {
  console.error("❌ Failed to seed nested course:", error);
  process.exit(1);
});
