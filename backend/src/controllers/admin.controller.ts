import type { Response } from "express";
import type { AuthRequest } from "../types/auth.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

export const getAdminOverview = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const [users, courses, publishedCourses, admins] =
      await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Course.countDocuments({ isPublished: true }),
        User.countDocuments({ role: "admin" }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        users,
        courses,
        publishedCourses,
        admins,
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load admin overview",
    });
  }
};

export const getAdminUsers = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const users = await User.find()
      .select("_id name email role createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load users",
    });
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: unknown };

    if (typeof id !== "string" || (role !== "user" && role !== "admin")) {
      res.status(400).json({
        success: false,
        message: "Valid user ID and role are required",
      });
      return;
    }

    if (req.user?.id === id && role !== "admin") {
      res.status(400).json({
        success: false,
        message: "You cannot remove your own admin role",
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { returnDocument: "after", runValidators: true }
    )
      .select("_id name email role createdAt updatedAt")
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "User role updated",
      data: user,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
};

export const getAdminCourses = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const courses = await Course.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // Admin CMS receives a stable, normalized shape regardless of whether
    // legacy content was stored under content.* or returned as a derived
    // top-level field by an older API version.
    const data = courses.map((course: any) => {
      const content = course?.content && typeof course.content === "object"
        ? course.content
        : {};

      if (course.type === "nested") {
        const nestedCourses = Array.isArray(content.courses)
          ? content.courses
          : Array.isArray(course.nestedCourses)
            ? course.nestedCourses
            : [];

        // Always resolve legacy nested references against the actual course
        // documents. Older data can contain a slug in `_id` (for example
        // `web-development`) instead of MongoDB's ObjectId. The admin CMS
        // must still be able to select and manage those courses.
        const byId = new Map(courses.map((item: any) => [String(item._id), item]));
        const bySlug = new Map(courses.map((item: any) => [String(item.slug), item]));
        const resolvedCourses = nestedCourses
          .map((ref: any, index: number) => {
            const refId = String(ref?._id ?? ref?.id ?? ref?.courseId ?? "");
            const refSlug = String(ref?.slug ?? "");
            const child = byId.get(refId) ?? bySlug.get(refSlug) ?? bySlug.get(refId);
            if (!child) return null;
            return {
              _id: String(child._id),
              type: child.type,
              title: child.title,
              slug: child.slug,
              category: child.category,
              description: child.description,
              level: child.level,
              topicsCount: child.type === "nested"
                ? (Array.isArray((child.content as any)?.courses) ? (child.content as any).courses.length : 0)
                : child.type === "problem-solving"
                  ? (Array.isArray((child.content as any)?.categories)
                    ? (child.content as any).categories.reduce((sum: number, item: any) => sum + (Array.isArray(item?.problems) ? item.problems.length : 0), 0)
                    : 0)
                  : child.type === "multi-language"
                    ? (Array.isArray((child.content as any)?.languages)
                      ? (child.content as any).languages.reduce((sum: number, item: any) => sum + (Array.isArray(item?.topics) ? item.topics.length : 0), 0)
                      : 0)
                    : (Array.isArray((child.content as any)?.topics) ? (child.content as any).topics.length : 0),
              order: Number(ref?.order ?? child.order ?? index + 1),
            };
          })
          .filter(Boolean)
          .sort((a: any, b: any) => a.order - b.order);

        return {
          ...course,
          nestedCourses: resolvedCourses,
          topicsCount: resolvedCourses.length,
          content: { ...content, courses: resolvedCourses },
        };
      }

      if (course.type === "problem-solving") {
        const categories = Array.isArray(content.categories)
          ? content.categories
          : Array.isArray((content as any).problemSolvingCategories)
            ? (content as any).problemSolvingCategories
            : Array.isArray(course.problemSolvingCategories)
              ? course.problemSolvingCategories
              : [];
        const topicsCount = categories.reduce(
          (total: number, category: any) =>
            total + (Array.isArray(category?.problems) ? category.problems.length : 0),
          0
        );
        return {
          ...course,
          problemSolvingCategories: categories,
          topicsCount,
          content: { ...content, categories },
        };
      }

      if (course.type === "single-language") {
        const topics = Array.isArray(content.topics) ? content.topics : [];
        return { ...course, topics, topicsCount: topics.length, content: { ...content, topics } };
      }

      if (course.type === "multi-language") {
        const languages = Array.isArray(content.languages) && content.languages.length
          ? content.languages
          : Array.isArray(course.languages) ? course.languages : [];
        const topicsCount = languages.reduce(
          (total: number, language: any) =>
            total + (Array.isArray(language?.topics) ? language.topics.length : 0),
          0
        );
        return { ...course, languages, topicsCount, content: { ...content, languages } };
      }

      return course;
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load courses",
    });
  }
};

