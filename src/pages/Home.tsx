import { Link } from "react-router-dom";
import { courses } from "../mock/Courses";
import CourseCard from "../components/CourseCard";
import "./Home.css";

function Home() {
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
            <br />
            Build Your Future.
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
          <p className="section-label">LEARNING PATH</p>

          <h2>Explore Courses</h2>

          <p>
            Start learning from carefully structured programming
            courses.
          </p>
        </div>

        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              title={course.title}
              description={course.description}
              level={course.level}
              topics={course.topicsCount}
              category={course.category}
              slug={course.slug}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;