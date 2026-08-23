import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import ProblemSolving from "./pages/ProblemSolving";
import ProblemCategory from "./pages/ProblemCategory";
import ProblemDetails from "./pages/ProblemDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          <Route
            path="/courses"
            element={<Courses />}
          />

          {/* Problem Solving */}
          <Route
            path="/courses/problem-solving"
            element={<ProblemSolving />}
          />
          <Route
            path="/courses/problem-solving/:categorySlug/:problemSlug"
            element={<ProblemDetails />}
          />
          <Route
            path="/courses/problem-solving/:categorySlug"
            element={<ProblemCategory />}
          />

          {/* Regular courses */}
          <Route
            path="/courses/:slug"
            element={<CourseDetails />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;