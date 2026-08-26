import "./CourseCardSkeleton.css";

function CourseCardSkeleton() {
  return (
    <article className="course-card-skeleton">
      <div className="skeleton skeleton-category" />

      <div className="skeleton skeleton-level" />

      <div className="skeleton skeleton-title" />

      <div className="skeleton skeleton-description" />
      <div className="skeleton skeleton-description short" />

      <div className="skeleton skeleton-topics" />

      <div className="skeleton skeleton-button" />
    </article>
  );
}

export default CourseCardSkeleton;