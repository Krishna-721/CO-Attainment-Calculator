export default function CourseCard({
  course,
  outcomeCount,
  studentCount,
  onOpen,
  onEdit,
  onDelete,
}) {
  return (
    <article className="course-card">
      <button type="button" onClick={onOpen} className="course-open">
        <div className="course-top">
          <div>
            <span className="code">{course.code}</span>
            <h2>{course.name}</h2>
          </div>
          <span className="arrow">→</span>
        </div>
        <div className="course-meta">
          <span>
            <b>{outcomeCount}</b> Course Outcomes
          </span>
          <span>
            <b>{studentCount}</b> Students
          </span>
        </div>
      </button>
      {(onEdit || onDelete) && (
        <div className="card-actions">
          {onEdit && (
            <button type="button" className="text-button" onClick={onEdit}>
              Edit
            </button>
          )}
          {onDelete && (
            <button type="button" className="danger-button" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}
