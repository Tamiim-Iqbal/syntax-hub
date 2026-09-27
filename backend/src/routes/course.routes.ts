import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";

import {
  getCourses,
  getCoursePreviewController,
  getCourse,
  getProblemSolving,
  getProblemSolvingCategory,
  getProblem,
  getSearchIndex
} from "../controllers/course.controller.js";

const router = Router();

router.get("/", getCourses);
router.get("/preview/:slug", getCoursePreviewController);

// Search index contains only published course content.
router.get("/search-index", getSearchIndex);
router.get("/problem-solving", getProblemSolving);
router.get("/problem-solving/:categorySlug", getProblemSolvingCategory);
router.get("/problem-solving/:categorySlug/:problemSlug", requireAuth, getProblem);
router.get("/:slug", requireAuth, getCourse);


export default router;
