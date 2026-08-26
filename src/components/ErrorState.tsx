import "./ErrorState.css";

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this content. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        !
      </div>

      <h2>{title}</h2>

      <p>{message}</p>

      {onRetry && (
        <button
          type="button"
          className="error-state-retry"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;