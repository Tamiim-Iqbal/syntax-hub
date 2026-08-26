import "./CourseDetailsSkeleton.css";

function CourseDetailsSkeleton() {
  return (
    <div className="course-details-skeleton">
      <div className="skeleton course-details-skeleton-sidebar" />

      <main className="course-details-skeleton-content">
        <div className="skeleton course-details-skeleton-title" />

        <div className="skeleton course-details-skeleton-line" />
        <div className="skeleton course-details-skeleton-line" />
        <div className="skeleton course-details-skeleton-line short" />

        <div className="skeleton course-details-skeleton-heading" />

        <div className="skeleton course-details-skeleton-block" />
        <div className="skeleton course-details-skeleton-block" />
      </main>
    </div>
  );
}

export default CourseDetailsSkeleton;