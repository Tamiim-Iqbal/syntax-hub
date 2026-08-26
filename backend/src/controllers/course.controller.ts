import type { Request, Response } from "express";

import {
  getAllCourses,
  getCourseBySlug,
  getProblemSolvingCourse,
  getProblemCategory,
  getProblemBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../services/course.service.js";

import {
  validateCreateCourse,
  validateUpdateCourse,
} from "../validators/course.validator.js";

/* =========================================
   ERROR HELPERS
========================================= */

type MongoDuplicateError = {
  code: 11000;
};

const isMongoDuplicateError = (
  error: unknown
): error is MongoDuplicateError => {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return false;
  }

  return (
    "code" in error &&
    error.code === 11000
  );
};

/* =========================================
   GET ALL COURSES
========================================= */

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
    console.error(
      "Get courses error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

/* =========================================
   GET COURSE
========================================= */

export const getCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const { slug } = req.params;

    if (typeof slug !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid course slug",
      });

      return;
    }

    const course =
      await getCourseBySlug(slug);

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
    console.error(
      "Get course error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

/* =========================================
   CREATE COURSE
========================================= */

export const createNewCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const validation =
      validateCreateCourse(req.body);

    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });

      return;
    }

    const course =
      await createCourse(req.body);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error: unknown) {
    console.error(
      "Create course error:",
      error
    );

    if (isMongoDuplicateError(error)) {
      res.status(409).json({
        success: false,
        message:
          "A course with this slug already exists",
      });

      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
};

/* =========================================
   UPDATE COURSE
========================================= */

export const updateExistingCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });

      return;
    }

    const validation =
      validateUpdateCourse(req.body);

    if (!validation.valid) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });

      return;
    }

    const course =
      await updateCourse(id, req.body);

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
  } catch (error: unknown) {
    console.error(
      "Update course error:",
      error
    );

    if (isMongoDuplicateError(error)) {
      res.status(409).json({
        success: false,
        message:
          "A course with this slug already exists",
      });

      return;
    }

    res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
};

/* =========================================
   DELETE COURSE
========================================= */

export const removeCourse = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });

      return;
    }

    const course =
      await deleteCourse(id);

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
    console.error(
      "Delete course error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};

/* =========================================
   PROBLEM SOLVING COURSE
========================================= */

export const getProblemSolving = async (
  _req: Request,
  res: Response
) => {
  try {
    const course =
      await getProblemSolvingCourse();

    if (!course) {
      res.status(404).json({
        success: false,
        message:
          "Problem Solving course not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error(
      "Get problem solving course error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch problem solving course",
    });
  }
};

/* =========================================
   PROBLEM CATEGORY
========================================= */

export const getProblemSolvingCategory =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { categorySlug } =
        req.params;

      if (
        typeof categorySlug !== "string"
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid category",
        });

        return;
      }

      const category =
        await getProblemCategory(
          categorySlug
        );

      if (!category) {
        res.status(404).json({
          success: false,
          message:
            "Problem category not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error(
        "Get problem solving category error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch problem category",
      });
    }
  };

/* =========================================
   GET PROBLEM
========================================= */

export const getProblem = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      categorySlug,
      problemSlug,
    } = req.params;

    if (
      typeof categorySlug !== "string" ||
      typeof problemSlug !== "string"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Invalid problem parameters",
      });

      return;
    }

    const problem =
      await getProblemBySlug(
        categorySlug,
        problemSlug
      );

    if (!problem) {
      res.status(404).json({
        success: false,
        message: "Problem not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (error) {
    console.error(
      "Get problem error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch problem",
    });
  }
};