import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import CourseCardSkeleton from "../components/CourseCardSkeleton";
import ErrorState from "../components/ErrorState";
import { getCourses } from "../services/courseService";
import type { Course } from "../types/course";
import "./Courses.css";
import EmptyState from "../components/EmptyState";

function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCourses();

      setCourses(data);
    } catch (error) {
      console.error(
        "Failed to load courses:",
        error
      );

      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getCourses();

        if (!cancelled) {
          setCourses(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to load courses:",
          error
        );

        if (!cancelled) {
          setError("Failed to load courses.");
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="courses-page">
      <section className="courses-page-header">
        <p className="section-label">
          LEARNING PATH
        </p>

        <h1>Explore Courses</h1>

        <p>
          Start learning from carefully structured
          programming courses.
        </p>
      </section>

      <section
        className="courses-page-grid"
        aria-label="Available courses"
      >
        {/* Loading */}
        {loading &&
          Array.from({ length: 3 }).map(
            (_, index) => (
              <CourseCardSkeleton
                key={index}
              />
            )
          )}

        {/* Error */}
        {!loading && error && (
          <ErrorState
            message={error}
            onRetry={loadCourses}
          />
        )}

        {/* Courses */}
        {/* Empty */}
        {!loading &&
          !error &&
          courses.length === 0 && (
            <EmptyState
              title="No courses available"
              message="There are no published courses available right now."
            />
          )}

        {!loading &&
          !error &&
          courses.length > 0 &&
          courses.map((course) => (
            <CourseCard
              key={course._id}
              title={course.title}
              description={course.description}
              level={course.level}
              topics={course.topicsCount}
              category={course.category}
              slug={course.slug}
              type={course.type}
              languages={
                "languages" in course
                  ? course.languages
                  : undefined
              }
            />
          ))}
      </section>
    </div>
  );
}

export default Courses;