import { useCallback, useEffect, useState } from "react";
import {
  createCourseOutcome,
  createScore,
  deleteCourseOutcome,
  deleteScore,
  getCourse,
  getCourseOutcomes,
  getScoresByCourseOutcome,
  getStudents,
  updateCourseOutcome,
  updateScore,
} from "../services/api";
import EntityForm from "../Components/ui/EntityForm";
import ScoreTable from "../Components/scores/ScoreTable";
import { EmptyState, ErrorState, LoadingState } from "../Components/ui/States";

export default function CourseWorkspace({ courseId, navigate }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => {
    try {
      setError("");
      setData(null);
      const [course, outcomes, students] = await Promise.all([
        getCourse(courseId),
        getCourseOutcomes(courseId),
        getStudents(),
      ]);
      const scoreGroups = await Promise.all(
        outcomes.map((outcome) => getScoresByCourseOutcome(outcome.id)),
      );
      setData({ course, outcomes, students, scores: scoreGroups.flat() });
    } catch (err) {
      setError(err.message);
    }
  }, [courseId]);
  useEffect(() => {
    load();
  }, [load]);
  const save = async (values) => {
    try {
      setSaving(true);
      setError("");
      if (form.type === "outcome")
        await (form.item
          ? updateCourseOutcome(form.item.id, {
              ...values,
              course_id: Number(courseId),
            })
          : createCourseOutcome({ ...values, course_id: Number(courseId) }));
      else if (form.type === "student-scores") {
        await Promise.all(
          data.outcomes.map((outcome) => {
            const marks = Number(values[`marks_${outcome.id}`]);
            const existingScore = form.scores.find(
              (score) => score?.course_outcome_id === outcome.id,
            );
            const payload = {
              student_id: form.student.id,
              course_outcome_id: outcome.id,
              marks,
            };
            return existingScore
              ? updateScore(existingScore.id, payload)
              : createScore(payload);
          }),
        );
      } else {
        await (form.item
          ? updateScore(form.item.id, {
              ...values,
              student_id: Number(values.student_id),
              course_outcome_id: Number(values.course_outcome_id),
              marks: Number(values.marks),
            })
          : createScore({
              ...values,
              student_id: Number(values.student_id),
              course_outcome_id: Number(values.course_outcome_id),
              marks: Number(values.marks),
            }));
      }
      setForm(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  const remove = async (type, item, label) => {
    if (!window.confirm(`Delete ${label}?`)) return;
    try {
      setError("");
      if (type === "outcome") await deleteCourseOutcome(item.id);
      else if (type === "student-scores")
        await Promise.all(item.scores.map((score) => deleteScore(score.id)));
      else await deleteScore(item.id);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };
  if (error && !data)
    return (
      <div className="grid gap-7">
        <ErrorState
          title="Failed to load course workspace"
          message={error}
          onRetry={load}
        />
      </div>
    );
  if (!data)
    return (
      <div className="grid gap-7">
        <LoadingState label="Loading course workspace..." />
      </div>
    );
  const scoreFields = [
    {
      name: "student_id",
      label: "Student",
      type: "select",
      placeholder: "Select a student",
      options: data.students.map((student) => ({
        value: student.id,
        label: `${student.roll_number} — ${student.name}`,
      })),
    },
    {
      name: "course_outcome_id",
      label: "Course outcome",
      type: "select",
      placeholder: "Select a course outcome",
      options: data.outcomes.map((outcome) => ({
        value: outcome.id,
        label: `${outcome.code} — ${outcome.description}`,
      })),
    },
    { name: "marks", label: "Marks", type: "number", min: "0", step: "0.1" },
  ];
  const rowScoreFields = (outcomes) =>
    outcomes.map((outcome) => ({
      name: `marks_${outcome.id}`,
      label: `${outcome.code} Marks`,
      type: "number",
      min: "0",
      step: "0.1",
    }));
  return (
    <div className="grid gap-7">
      <button
        type="button"
        className="w-fit border-0 bg-transparent p-0 text-[13px] font-bold text-accent hover:text-accent-hover"
        onClick={() => navigate("/courses")}
      >
        ← Back to Courses
      </button>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-subtle">{data.course.code}</span>
          <h1 className="my-1.5 text-[28px] leading-tight">{data.course.name}</h1>
        </div>
        <button
          type="button"
          className="rounded-md bg-accent px-4 py-2.5 text-[13px] font-bold text-white hover:bg-accent-hover"
          onClick={() => navigate(`/attainment/${courseId}`)}
        >
          View attainment
        </button>
      </div>
      {error && (
        <ErrorState title="Action could not be completed" message={error} />
      )}
      {form && (
        <EntityForm
          title={
            form.type === "outcome"
              ? form.item
                ? "Edit course outcome"
                : "Add course outcome"
              : form.type === "student-scores"
                ? `Edit scores for ${form.student.name}`
                : form.item
                  ? "Edit score"
                  : "Add score"
          }
          initialValues={
            form.type === "student-scores"
              ? Object.fromEntries(
                  data.outcomes.map((outcome) => [
                    `marks_${outcome.id}`,
                    form.scores.find(
                      (score) => score?.course_outcome_id === outcome.id,
                    )?.marks ?? "",
                  ]),
                )
              : form.item ||
                (form.type === "outcome"
                  ? { code: "", description: "" }
                  : { student_id: "", course_outcome_id: "", marks: "" })
          }
          fields={
            form.type === "outcome"
              ? [
                  { name: "code", label: "Outcome code" },
                  {
                    name: "description",
                    label: "Description",
                    type: "textarea",
                  },
                ]
              : form.type === "student-scores"
                ? rowScoreFields(data.outcomes)
                : scoreFields
          }
          onSubmit={save}
          onCancel={() => setForm(null)}
          busy={saving}
          error={error}
        />
      )}
      {
        <section>
          <div className="mb-3.5 flex items-end justify-between gap-5">
            <div>
              <h2>Course Outcomes</h2>
              <p>{data.outcomes.length} outcomes mapped to this course.</p>
            </div>
            <button
              type="button"
              className="rounded-md bg-accent px-4 py-2.5 text-[13px] font-bold text-white hover:bg-accent-hover"
              onClick={() => setForm({ type: "outcome" })}
            >
              Add outcome
            </button>
          </div>
          {data.outcomes.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.outcomes.map((outcome) => (
                <article className="rounded-xl border border-line bg-panel p-[18px]" key={outcome.id}>
                  <span className="text-xs font-bold tracking-[0.06em] text-accent">{outcome.code}</span>
                  <p className="mt-3 text-[13px] leading-relaxed text-[#d4d4d4]">{outcome.description}</p>
                  <div className="mt-4 flex items-center gap-2.5">
                    <button
                      type="button"
                      className="rounded-md border border-transparent px-3 py-2 text-xs font-bold text-accent hover:bg-[#2a211c]"
                      onClick={() =>
                        setForm({ type: "outcome", item: outcome })
                      }
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-[#613b3b] px-3 py-2 text-xs font-bold text-red-400 hover:bg-[#2a1414]"
                      onClick={() => remove("outcome", outcome, outcome.code)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState label="No course outcomes found." />
          )}
        </section>
      }
      <section>
        <div className="mb-3.5 flex items-end justify-between gap-5">
          <div>
            <h2>Student Performance</h2>
            <p>Marks recorded for every course outcome.</p>
          </div>
          <button
            type="button"
            className="rounded-md bg-accent px-4 py-2.5 text-[13px] font-bold text-white hover:bg-accent-hover"
            onClick={() => setForm({ type: "score" })}
          >
            Add score
          </button>
        </div>
        {data.students.length ? (
          <ScoreTable
            students={data.students}
            outcomes={data.outcomes}
            scores={data.scores}
            onEdit={(student, scores) =>
              setForm({ type: "student-scores", student, scores })
            }
            onDelete={(student, scores) =>
              remove(
                "student-scores",
                { student, scores },
                `all scores for ${student.name}`,
              )
            }
          />
        ) : (
          <EmptyState label="No students found." />
        )}
      </section>
    </div>
  );
}
