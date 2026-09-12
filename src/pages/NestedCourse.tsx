import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getCoursePreview } from "../services/courseService";
import type { NestedCourse as NestedCourseType } from "../types/course";
import CourseCardSkeleton from "../components/CourseCardSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";

import "./NestedCourse.css";

function NestedCourse() {
  const { slug = "" } = useParams();
  const [course, setCourse] = useState<NestedCourseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCoursePreview(slug);
      if (data.type !== "nested") throw new Error("Invalid nested course");
      setCourse(data);
    } catch (err) {
      console.error("Failed to load nested course:", err);
      setError("Failed to load course collection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadCourse(); }, [slug]);

  if (loading) {
    return (
      <div className="nested-course-page">
        <div className="nested-course-gradient-border" />
        <section className="nested-course-header">
          <p className="section-label">LEARNING PATH</p>
          <h1>Loading...</h1>
          <p>Preparing the learning path for you.</p>
        </section>
        <section className="nested-course-grid">
          {Array.from({ length: 3 }).map((_, index) => <CourseCardSkeleton key={index} />)}
        </section>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="nested-course-page">
        <ErrorState message={error || "Course collection not found."} onRetry={loadCourse} />
      </div>
    );
  }

  return (
    <div className="nested-course-page">
      <div className="nested-course-gradient-border" />
      <section className="nested-course-header">
        <p className="section-label">LEARNING PATH</p>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
      </section>

      {course.nestedCourses.length === 0 ? (
        <EmptyState
          title="No courses available"
          message="There are no courses in this learning path yet."
        />
      ) : (
        <section className="nested-course-grid" aria-label={`${course.title} courses`}>
          {course.nestedCourses.map((item) => (
            <article className="course-card nested-course-card" key={item._id}>
              <div className="course-card-top">
                <span className="course-card-category">{item.category}</span>
                <span className="course-card-level">{item.level}</span>
              </div>
              <div className="course-card-content">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <div className="course-card-footer">
                <span className="course-card-topics">{item.topicsCount} {item.topicsCount === 1 ? "Topic" : "Topics"}</span>
                <Link to={item.type === "nested" ? `/courses/nested/${item.slug}` : item.type === "problem-solving" ? "/courses/problem-solving" : `/courses/${item.slug}`} className="course-card-button">View Course →</Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default NestedCourse;
