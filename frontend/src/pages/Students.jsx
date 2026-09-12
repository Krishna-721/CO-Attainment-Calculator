import { useCallback, useEffect, useState } from "react";
import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudent,
} from "../services/api";
import { EmptyState, ErrorState, LoadingState } from "../Components/ui/States";
import EntityForm from "../Components/ui/EntityForm";
export default function Students() {
  const [students, setStudents] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    try {
      setError("");
      setStudents(null);
      setStudents(await getStudents());
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const save = async (values) => {
    try {
      setSaving(true);
      setError("");
      if (form.student) await updateStudent(form.student.id, values);
      else await createStudent(values);
      setForm(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const remove = async (student) => {
    if (!window.confirm(`Delete ${student.name}?`)) return;
    try {
      setError("");
      await deleteStudent(student.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };
  const filtered = students?.filter((student) =>
    `${student.name} ${student.roll_number}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <div className="page">
      <div className="page-title">
        <span>ACADEMIC</span>
        <h1>Students</h1>
        <p>Browse enrolled students and their roll numbers.</p>
      </div>
      <div className="section-head">
        <div>
          <h2>Enrolment</h2>
          <p>Maintain the students used in attainment calculations.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={() => setForm({})}
        >
          Add student
        </button>
      </div>
      {form && (
        <EntityForm
          title={form.student ? "Edit student" : "Add student"}
          initialValues={form.student || { roll_number: "", name: "" }}
          fields={[
            { name: "roll_number", label: "Roll number" },
            { name: "name", label: "Student name" },
          ]}
          onSubmit={save}
          onCancel={() => setForm(null)}
          busy={saving}
          error={error}
        />
      )}
      {error && !form && (
        <ErrorState
          title="Failed to load students"
          message={error}
          onRetry={load}
        />
      )}
      {!error && !students ? (
        <LoadingState label="Loading students..." />
      ) : (
        students && (
          <>
            <label className="filter">
              <span>Search students</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name or roll number"
              />
            </label>
            {filtered.length ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student) => (
                      <tr key={student.id}>
                        <td className="roll">{student.roll_number}</td>
                        <td>{student.name}</td>
                        <td className="row-actions">
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => setForm({ student })}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => remove(student)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState label="No students match your search." />
            )}
          </>
        )
      )}
    </div>
  );
}
