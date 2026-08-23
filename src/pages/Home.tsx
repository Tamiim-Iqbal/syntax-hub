import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import CourseCard from "../components/CourseCard";
import { getCourses } from "../services/courseService";
import type { Course } from "../types/course";

import "./Home.css";

function Home() {
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
        console.error(
          "Failed to load courses:",
          error
        );

        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">
            Learn • Understand • Build
          </span>

          <h1>
            Learn Programming.
            <br/>
            <span>Build Your Future.</span>
          </h1>

          <p className="hero-description">
            Programming concepts সহজভাবে শিখুন, বুঝুন এবং
            step-by-step নিজের skills build করুন।
          </p>

          <div className="hero-actions">
            <Link
              to="/courses"
              className="hero-primary-button"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="courses-section">
        <div className="section-header">
          <p className="section-label">
            LEARNING PATH
          </p>

          <h2>Explore Courses</h2>

          <p>
            Start learning from carefully structured
            programming courses.
          </p>
        </div>

        <div className="course-grid">
          {loading && <p>Loading courses...</p>}

          {!loading && error && (
            <p>{error}</p>
          )}

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
                  course.type === "multi-language"
                    ? course.languages
                    : undefined
                }
              />
            ))}
        </div>
      </section>
    </div>
  );
}

export default Home;