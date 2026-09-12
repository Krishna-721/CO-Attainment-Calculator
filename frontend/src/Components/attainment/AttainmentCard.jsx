import ProgressBar from "../ui/ProgressBar";

export default function AttainmentCard({ result, description }) {
  return (
    <article className="attainment-card">
      <div className="attainment-head">
        <div className="attainment-copy">
          <span className="code">{result.course_outcome_code}</span>
          <p>{description || "Course outcome"}</p>
        </div>
        <strong>{Number(result.attainment_percentage).toFixed(1)}%</strong>
      </div>
      <ProgressBar value={result.attainment_percentage} />
      <p className="attainment-detail">
        <b>
          {result.students_meeting_threshold} / {result.total_students}
        </b>{" "}
        students met the {result.threshold}% threshold
      </p>
    </article>
  );
}
