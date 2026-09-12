export default function CourseCard({
  course,
  outcomeCount,
  studentCount,
  onOpen,
  onEdit,
  onDelete,
}) {
  return (
    <article className="flex min-h-[180px] flex-col justify-between overflow-hidden rounded-xl border border-line bg-panel">
      <button type="button" onClick={onOpen} className="block w-full flex-1 border-0 bg-transparent p-5 text-left text-ink hover:bg-[#242424]">
        <div className="flex justify-between gap-3">
          <div>
            <span className="text-xs font-bold tracking-[0.06em] text-accent">{course.code}</span>
            <h2 className="mt-1.5 text-[17px]">{course.name}</h2>
          </div>
          <span className="text-xl text-subtle">→</span>
        </div>
        <div className="mt-7 flex gap-[18px] text-xs text-muted">
          <span>
            <b className="text-ink">{outcomeCount}</b> Course Outcomes
          </span>
          <span>
            <b className="text-ink">{studentCount}</b> Students
          </span>
        </div>
      </button>
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-2.5 px-5 pb-4">
          {onEdit && (
            <button type="button" className="rounded-md border border-transparent px-3 py-2 text-xs font-bold text-accent hover:border-[#3a2c24] hover:bg-[#2a211c] hover:text-accent-hover" onClick={onEdit}>
              Edit
            </button>
          )}
          {onDelete && (
            <button type="button" className="rounded-md border border-[#613b3b] px-3 py-2 text-xs font-bold text-red-400 hover:bg-[#2a1414] hover:text-red-300" onClick={onDelete}>
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}
