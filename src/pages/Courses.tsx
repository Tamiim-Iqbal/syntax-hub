import CourseCard from "../components/CourseCard";
import { courses } from "../mock/Courses";
import "./Courses.css";

function Courses() {
  return (
    <div className="courses-page">
      <section className="courses-page-header">
        <p className="section-label">LEARNING PATH</p>
        <h1>Explore Courses</h1>
        <p>
          Start learning from carefully structured programming courses.
        </p>
      </section>

      <section className="courses-page-grid" aria-label="Available courses">
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
      </section>
    </div>
  );
}

export default Courses;
