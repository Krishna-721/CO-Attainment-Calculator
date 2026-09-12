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
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student</th>
            {outcomes.map((outcome) => (
              <th key={outcome.id}>{outcome.code}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td className="roll">{student.roll_number}</td>
              <td>{student.name}</td>
              {outcomes.map((outcome) => {
                const score = lookup.get(`${student.id}:${outcome.id}`);
                return (
                  <td
                    key={outcome.id}
                    className={score === undefined ? "muted" : "score"}
                  >
                    {score ? score.marks : "—"}
                  </td>
                );
              })}
              <td>
                <div className="row-actions">
                  <button
                    type="button"
                    className="text-button"
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
                    className="danger-button"
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
