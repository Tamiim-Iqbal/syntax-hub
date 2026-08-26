import "./ErrorState.css";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
};

function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state">
      <div className="error-state-icon">
        !
      </div>

      <h2>Something went wrong</h2>

      <p>{message}</p>

      {onRetry && (
        <button
          type="button"
          className="error-state-button"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;