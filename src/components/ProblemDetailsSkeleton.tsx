import "./ProblemDetailsSkeleton.css";

function ProblemDetailsSkeleton() {
  return (
    <div className="problem-details-skeleton">
      <div className="skeleton skeleton-back" />

      <div className="skeleton skeleton-problem-title" />

      <div className="problem-details-skeleton-meta">
        <div className="skeleton skeleton-meta" />
        <div className="skeleton skeleton-meta" />
        <div className="skeleton skeleton-meta" />
      </div>

      <div className="skeleton skeleton-tabs" />

      <div className="problem-details-skeleton-content">
        <div className="skeleton skeleton-content-title" />

        <div className="skeleton skeleton-content-line" />
        <div className="skeleton skeleton-content-line" />
        <div className="skeleton skeleton-content-line short" />

        <div className="skeleton skeleton-code" />
      </div>
    </div>
  );
}

export default ProblemDetailsSkeleton;