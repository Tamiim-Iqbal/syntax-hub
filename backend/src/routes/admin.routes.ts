import { Router } from "express";
import {
  getAdminCourses,
  getAdminOverview,
  getAdminUsers,
  updateUserRole,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import {
  createNewCourse,
  updateExistingCourse,
  removeCourse,
} from "../controllers/course.controller.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/overview", getAdminOverview);
router.get("/users", getAdminUsers);
router.patch("/users/:id/role", updateUserRole);
router.get("/courses", getAdminCourses);

router.post("/courses", createNewCourse);
router.put("/courses/:id", updateExistingCourse);
router.delete("/courses/:id", removeCourse);

export default router;
