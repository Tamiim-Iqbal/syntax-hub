import { Router } from "express";

import {
  getCourses,
  getCourse,
  getProblemSolving,
  getProblemSolvingCategory,
  getProblem
} from "../controllers/course.controller.js";

const router = Router();

router.get("/", getCourses);

router.get("/problem-solving", getProblemSolving);

router.get("/problem-solving/:categorySlug", getProblemSolvingCategory);

router.get("/problem-solving/:categorySlug/:problemSlug", getProblem);

router.get("/:slug", getCourse);


export default router;
