import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import { getCourses } from "../services/courseService";
import type { Course } from "../types/course";
import "./Courses.css";
import CourseCardSkeleton from "../components/CourseCardSkeleton";

function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);

        const data = await getCourses();

        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses:", error);
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
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
        {loading &&
          Array.from({ length: 3 }).map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}

        {!loading && error && <p>{error}</p>}

        {!loading &&
          !error &&
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