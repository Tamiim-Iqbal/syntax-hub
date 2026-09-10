import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

const Home = lazy(() => import("./pages/Home"));
const Courses = lazy(() => import("./pages/Courses"));
const Search = lazy(() => import("./pages/Search"));
const CourseDetails = lazy(() => import("./pages/CourseDetails"));
const ProblemSolving = lazy(() => import("./pages/ProblemSolving"));
const ProblemCategory = lazy(() => import("./pages/ProblemCategory"));
const ProblemDetails = lazy(() => import("./pages/ProblemDetails"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AppErrorBoundary from "./components/AppErrorBoundary";

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
      <AppErrorBoundary>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/search" element={<Search />} />
            </Route>
            <Route path="/courses/problem-solving" element={<ProblemSolving />} />
            <Route path="/courses/problem-solving/:categorySlug" element={<ProblemCategory />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/courses/problem-solving/:categorySlug/:problemSlug" element={<ProblemDetails />} />
            </Route>
            <Route path="/courses/:slug" element={<CourseDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      </AppErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
