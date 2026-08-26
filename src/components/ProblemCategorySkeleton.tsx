import "./ProblemCategorySkeleton.css";

function ProblemCategorySkeleton() {
  return (
    <article className="problem-category-skeleton">
      <div className="skeleton skeleton-category-title" />

      <div className="skeleton skeleton-category-description" />
      <div className="skeleton skeleton-category-description short" />

      <div className="skeleton skeleton-category-count" />

      <div className="skeleton skeleton-category-button" />
    </article>
  );
}

export default ProblemCategorySkeleton;