export default function ProgressBar({ value }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#303030]" aria-label={`${safe}% attainment`}>
      <span className="block h-full rounded-full bg-accent" style={{ width: `${safe}%` }} />
    </div>
  );
}
