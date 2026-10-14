import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getCoursePreview } from "../services/courseService";
import type { NestedCourse as NestedCourseType } from "../types/course";
import CourseCardSkeleton from "../components/CourseCardSkeleton";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { RichTextRenderer } from "../components/RichTextRenderer";
import CourseCard from "../components/CourseCard";
import "../components/CourseCard.css";

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
        <p className="rich-text-content"><RichTextRenderer value={course.description} /></p>
      </section>

      {course.nestedCourses.length === 0 ? (
        <EmptyState
          title="No courses available"
          message="There are no courses in this learning path yet."
        />
      ) : (
        <section className="nested-course-grid" aria-label={`${course.title} courses`}>
          {course.nestedCourses.map((item) => (
            <CourseCard key={item._id} title={item.title} description={item.description} level={item.level} topics={item.topicsCount} category={item.category} slug={item.slug} type={item.type ?? "single-language"} />
          ))}
        </section>
      )}
    </div>
  );
}

export default NestedCourse;
