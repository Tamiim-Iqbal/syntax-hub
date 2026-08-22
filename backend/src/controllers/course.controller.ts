import type { Request, Response } from "express";

import {
  getAllCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../services/course.service.js";

export const getCourses = async (
  _req: Request,
  res: Response
) => {
  try {
    const courses = await getAllCourses();

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

export const getCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const { slug } = req.params;

    const course = await getCourseBySlug(slug);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get course error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

export const createNewCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const course = await createCourse(req.body);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

export const updateExistingCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const course = await updateCourse(id, req.body);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: course,
    });
  } catch (error) {
    console.error("Update course error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

export const removeCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const course = await deleteCourse(id);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Delete course error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};