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
