import { Router } from "express";

import {
  getCourses,
  getCourse,
  getProblemSolving,
  getProblemSolvingCategory,
  getProblem,
  createNewCourse,
  updateExistingCourse,
  removeCourse,
} from "../controllers/course.controller.js";

const router = Router();

router.get("/", getCourses);

router.get("/problem-solving", getProblemSolving);

router.get("/problem-solving/:categorySlug", getProblemSolvingCategory);

router.get("/problem-solving/:categorySlug/:problemSlug", getProblem);

router.get("/:slug", getCourse);

router.post("/", createNewCourse);

router.put("/:id", updateExistingCourse);

router.delete("/:id", removeCourse);

export default router;
