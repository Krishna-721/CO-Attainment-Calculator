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
    <div className="grid w-full max-w-[1320px] gap-7">
      <div>
        <span className="text-[10px] font-bold tracking-[0.16em] text-subtle">ACADEMIC</span>
        <h1 className="my-1.5 text-[28px] leading-tight">Students</h1>
        <p className="m-0 text-sm text-muted">Browse enrolled students and their roll numbers.</p>
      </div>
      <div className="flex items-end justify-between gap-5">
        <div>
          <h2>Enrolment</h2>
          <p>Maintain the students used in attainment calculations.</p>
        </div>
        <button
          type="button"
          className="rounded-md bg-accent px-4 py-2.5 text-[13px] font-bold text-white hover:bg-accent-hover"
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
            <label className="grid w-full max-w-[430px] gap-1.5 rounded-xl border border-line bg-panel p-3.5 text-xs text-muted">
              <span>Search students</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name or roll number"
              />
            </label>
            {filtered.length ? (
              <div               className="overflow-x-auto rounded-xl border border-line bg-panel">
                <table className="w-full min-w-[620px] border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="bg-[#202020] p-3 text-left text-[10px] tracking-[0.08em] text-muted">Roll Number</th>
                      <th className="bg-[#202020] p-3 text-left text-[10px] tracking-[0.08em] text-muted">Name</th>
                      <th className="bg-[#202020] p-3 text-left text-[10px] tracking-[0.08em] text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student) => (
                      <tr key={student.id}>
                        <td className="border-t border-line p-3.5 font-bold text-accent">{student.roll_number}</td>
                        <td className="border-t border-line p-3.5 text-[#e5e5e5]">{student.name}</td>
                        <td className="flex items-center gap-2 whitespace-nowrap border-t border-line p-2.5">
                          <button
                            type="button"
                            className="rounded-md border border-transparent px-3 py-2 text-xs font-bold text-accent hover:bg-[#2a211c]"
                            onClick={() => setForm({ student })}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-[#613b3b] px-3 py-2 text-xs font-bold text-red-400 hover:bg-[#2a1414]"
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
