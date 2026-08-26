import "./EmptyState.css";

type EmptyStateProps = {
  title?: string;
  message?: string;
};

function EmptyState({
  title = "Nothing here yet",
  message = "There is no content available right now.",
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        ∅
      </div>

      <h2>{title}</h2>

      <p>{message}</p>
    </div>
  );
}

export default EmptyState;