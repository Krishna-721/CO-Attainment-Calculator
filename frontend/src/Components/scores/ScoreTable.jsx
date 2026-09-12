export default function ScoreTable({
  students,
  outcomes,
  scores,
  onEdit,
  onDelete,
}) {
  const lookup = new Map(
    scores.map((score) => [
      `${score.student_id}:${score.course_outcome_id}`,
      score,
    ]),
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel">
      <table className="w-full min-w-[620px] border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="bg-[#202020] p-3 text-left text-[10px] tracking-[0.08em] text-muted">Roll No</th>
            <th className="bg-[#202020] p-3 text-left text-[10px] tracking-[0.08em] text-muted">Student</th>
            {outcomes.map((outcome) => (
              <th className="bg-[#202020] p-3 text-left text-[10px] tracking-[0.08em] text-muted" key={outcome.id}>{outcome.code}</th>
            ))}
            <th className="bg-[#202020] p-3 text-left text-[10px] tracking-[0.08em] text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="border-t border-line p-3.5 font-bold text-accent">{student.roll_number}</td>
              <td className="border-t border-line p-3.5 text-[#e5e5e5]">{student.name}</td>
              {outcomes.map((outcome) => {
                const score = lookup.get(`${student.id}:${outcome.id}`);
                return (
                  <td
                    key={outcome.id}
                    className={`border-t border-line p-3.5 font-bold ${score === undefined ? "text-subtle" : "text-ink"}`}
                  >
                    {score ? score.marks : "—"}
                  </td>
                );
              })}
              <td>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <button
                    type="button"
                    className="rounded-md border border-transparent px-3 py-2 text-xs font-bold text-accent hover:border-[#3a2c24] hover:bg-[#2a211c]"
                    onClick={() =>
                      onEdit(
                        student,
                        outcomes.map((outcome) =>
                          lookup.get(`${student.id}:${outcome.id}`),
                        ),
                      )
                    }
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[#613b3b] px-3 py-2 text-xs font-bold text-red-400 hover:bg-[#2a1414]"
                    onClick={() =>
                      onDelete(
                        student,
                        outcomes
                          .map((outcome) =>
                            lookup.get(`${student.id}:${outcome.id}`),
                          )
                          .filter(Boolean),
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
