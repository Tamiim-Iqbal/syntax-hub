import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const checks = [
  ["Course preview route is public", read("backend/src/routes/course.routes.ts"), 'router.get("/preview/:slug", getCoursePreviewController);'],
  ["Full course route requires auth", read("backend/src/routes/course.routes.ts"), 'router.get("/:slug", requireAuth, getCourse);'],
  ["Problem details require auth", read("backend/src/routes/course.routes.ts"), 'router.get("/problem-solving/:categorySlug/:problemSlug", requireAuth, getProblem);'],
  ["Problem solving course is public", read("backend/src/routes/course.routes.ts"), 'router.get("/problem-solving", getProblemSolving);'],
  ["Problem category is public", read("backend/src/routes/course.routes.ts"), 'router.get("/problem-solving/:categorySlug", getProblemSolvingCategory);'],
  ["Admin route is protected", read("backend/src/routes/admin.routes.ts"), "requireAuth"],
  ["Homepage route exists", read("src/App.tsx"), '<Route path="/" element={<Home />} />'],
  ["Courses route exists", read("src/App.tsx"), '<Route path="/courses" element={<Courses />} />'],
  ["404 fallback exists", read("src/App.tsx"), '<Route path="*" element={<NotFound />} />'],
  ["Global error boundary exists", read("src/App.tsx"), "<AppErrorBoundary>"],
];

let failed = 0;
for (const [name, file, needle] of checks) {
  const ok = file.includes(needle);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed += 1;
}

if (failed) {
  console.error(`\n${failed} smoke check(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${checks.length} smoke checks passed.`);

// Regression checks for Nested + Problem Solving response normalization.
const courseService = read("src/services/courseService.ts");
const backendCourseService = read("backend/src/services/course.service.ts");

const regressionChecks = [
  ["Nested public response supports top-level nestedCourses", courseService, "course.nestedCourses"],
  ["Problem solving public response supports top-level problemSolvingCategories", courseService, "course.problemSolvingCategories"],
  ["Nested preview resolves child courses from MongoDB", backendCourseService, "const children = ids.length || slugs.length"],
  ["Nested preview can resolve children by slug", backendCourseService, "bySlug.get(String(ref?.slug ?? \"\"))"],
  ["Problem solving lookup uses course type", backendCourseService, 'Course.findOne({ type: "problem-solving", isPublished: true })'],
  ["Top-level public course list excludes nested-only courses", backendCourseService, 'isTopLevel: { $ne: false }'],
  ["Problem solving card count derives from category problem arrays", backendCourseService, "category?.problems) ? category.problems.length : 0"],
  ["Nested child creation defaults to a normal course", read("src/pages/AdminDashboard.tsx"), 'openCreateCourse("single-language", false)'],
];

for (const [name, file, needle] of regressionChecks) {
  const ok = file.includes(needle);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failed += 1;
}

if (failed) {
  console.error(`\n${failed} smoke check(s) failed.`);
  process.exit(1);
}
console.log(`All ${checks.length + regressionChecks.length} smoke checks passed.`);
