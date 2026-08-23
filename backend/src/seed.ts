import "dotenv/config";
import mongoose from "mongoose";

import Course from "./models/Course.js";
import { courses } from "./data/courses.js";

const seedCourses = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    console.log("🍃 MongoDB connected");

    // Remove existing courses before seeding
    await Course.deleteMany({});

    console.log("🗑️ Existing courses removed");

    const coursesToInsert = courses.map((course, index) => ({
      title: course.title,
      slug: course.slug,
      category: course.category,
      type: course.type,
      description: course.description,
      level: course.level,

      content:
        "content" in course
          ? course.content
          : "topics" in course
            ? {
              topics: course.topics,
            }
            : undefined,

      languages:
        "languages" in course
          ? course.languages
          : undefined,

      isPublished: true,
      order: index + 1,
    }));

    const insertedCourses =
      await Course.insertMany(coursesToInsert);

    console.log(
      `✅ ${insertedCourses.length} courses inserted successfully`
    );

    await mongoose.disconnect();

    console.log("🔌 MongoDB disconnected");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

seedCourses();