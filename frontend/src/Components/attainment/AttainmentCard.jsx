import ProgressBar from "../ui/ProgressBar";

export default function AttainmentCard({ result, description }) {
  return (
    <article className="flex min-h-[190px] flex-col rounded-xl border border-line bg-panel p-[18px]">
      <div className="flex min-h-[63px] justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs font-bold tracking-[0.06em] text-accent">{result.course_outcome_code}</span>
          <p className="mt-2 text-[13px] leading-snug text-[#d4d4d4]">{description || "Course outcome"}</p>
        </div>
        <strong className="text-[22px] text-accent">{Number(result.attainment_percentage).toFixed(1)}%</strong>
      </div>
      <ProgressBar value={result.attainment_percentage} />
      <p className="mt-auto pt-3.5 text-xs leading-relaxed text-muted">
        <b>
          {result.students_meeting_threshold} / {result.total_students}
        </b>{" "}
        students met the {result.threshold}% threshold
      </p>
    </article>
  );
}
