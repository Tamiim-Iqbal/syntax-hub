import "./ProblemListSkeleton.css";

function ProblemListSkeleton() {
  return (
    <div className="problem-list-skeleton">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="problem-list-skeleton-row"
        >
          <div className="skeleton skeleton-number" />

          <div className="problem-list-skeleton-name">
            <div className="skeleton skeleton-name" />
            <div className="skeleton skeleton-subname" />
          </div>

          <div className="skeleton skeleton-difficulty" />

          <div className="skeleton skeleton-rating" />

          <div className="skeleton skeleton-judge" />
        </div>
      ))}
    </div>
  );
}

export default ProblemListSkeleton;