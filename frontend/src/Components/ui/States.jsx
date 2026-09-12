export function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="state-card" role="status">
      {label}
    </div>
  );
}
export function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
}) {
  return (
    <div className="state-card error" role="alert">
      <strong>{title}</strong>
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="text-button" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function EmptyState({ label }) {
  return <div className="state-card">{label}</div>;
}
