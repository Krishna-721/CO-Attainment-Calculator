export function LoadingState({ label = "Loading data..." }) {
  return (
    <div className="grid justify-items-start gap-2 rounded-xl border border-line bg-panel p-7 text-sm text-muted" role="status">
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
    <div className="grid justify-items-start gap-2 rounded-xl border border-[#613b3b] bg-panel p-7 text-red-400" role="alert">
      <strong>{title}</strong>
      <span className="text-muted">{message}</span>
      {onRetry && (
        <button type="button" className="rounded-md border border-transparent px-3 py-2 text-xs font-bold text-accent hover:border-[#3a2c24] hover:bg-[#2a211c] hover:text-accent-hover" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function EmptyState({ label }) {
  return <div className="grid justify-items-start gap-2 rounded-xl border border-line bg-panel p-7 text-sm text-muted">{label}</div>;
}
