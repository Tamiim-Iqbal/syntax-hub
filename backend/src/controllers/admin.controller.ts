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

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Admin courses error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load courses",
    });
  }
};
