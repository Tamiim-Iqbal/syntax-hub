import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

const Home = lazy(() => import("./pages/Home"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
const ProblemSolving = lazy(() => import("./pages/ProblemSolving"));
const ProblemCategory = lazy(() => import("./pages/ProblemCategory"));
const ProblemDetails = lazy(() => import("./pages/ProblemDetails"));

function RouteLoader() {
  return (
    <div className="route-loader" role="status" aria-live="polite">
      <span className="route-loader-spinner" aria-hidden="true" />
      <span>Loading...</span>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/problem-solving" element={<ProblemSolving />} />
            <Route path="/courses/problem-solving/:categorySlug/:problemSlug" element={<ProblemDetails />} />
            <Route path="/courses/problem-solving/:categorySlug" element={<ProblemCategory />} />
            <Route path="/courses/:slug" element={<CourseDetails />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
