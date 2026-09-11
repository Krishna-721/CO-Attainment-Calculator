import { useCallback, useEffect, useState } from "react"
import { createCourseOutcome, createScore, deleteCourseOutcome, deleteScore, getCourse, getCourseOutcomes, getScoresByCourseOutcome, getStudents, updateCourseOutcome, updateScore } from "../services/api"
import EntityForm from "../Components/ui/EntityForm"
import ScoreTable from "../Components/scores/ScoreTable"
import { EmptyState, ErrorState, LoadingState } from "../Components/ui/States"

export default function CourseWorkspace({ courseId, navigate }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState("")
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const load = useCallback(async () => {
    try {
      setError("")
      setData(null)
      const [course, outcomes, students] = await Promise.all([getCourse(courseId), getCourseOutcomes(courseId), getStudents()])
      const scoreGroups = await Promise.all(outcomes.map((outcome) => getScoresByCourseOutcome(outcome.id)))
      setData({ course, outcomes, students, scores: scoreGroups.flat() })
    } catch (err) { setError(err.message) }
  }, [courseId])
  useEffect(() => { load() }, [load])
  const save = async (values) => {
    try {
      setSaving(true); setError("")
      if (form.type === "outcome") await (form.item ? updateCourseOutcome(form.item.id, { ...values, course_id: Number(courseId) }) : createCourseOutcome({ ...values, course_id: Number(courseId) }))
      else await (form.item ? updateScore(form.item.id, { ...values, student_id: Number(values.student_id), course_outcome_id: Number(values.course_outcome_id), marks: Number(values.marks) }) : createScore({ ...values, student_id: Number(values.student_id), course_outcome_id: Number(values.course_outcome_id), marks: Number(values.marks) }))
      setForm(null); await load()
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }
  const remove = async (type, item, label) => {
    if (!window.confirm(`Delete ${label}?`)) return
    try { setError(""); await (type === "outcome" ? deleteCourseOutcome(item.id) : deleteScore(item.id)); await load() } catch (err) { setError(err.message) }
  }
  if (error && !data) return <div className="page"><ErrorState title="Failed to load course workspace" message={error} onRetry={load} /></div>
  if (!data) return <div className="page"><LoadingState label="Loading course workspace..." /></div>
  const scoreFields = [{ name: "student_id", label: "Student", type: "number", placeholder: "Student id" }, { name: "course_outcome_id", label: "Course outcome", type: "number", placeholder: "Outcome id" }, { name: "marks", label: "Marks", type: "number", min: "0", step: "0.1" }]
  return <div className="page"><button type="button" className="back-button" onClick={() => navigate("/courses")}>← Back to Courses</button><div className="workspace-title"><span>{data.course.code}</span><h1>{data.course.name}</h1><button type="button" className="primary-button" onClick={() => navigate(`/attainment/${courseId}`)}>View attainment</button></div>{error && <ErrorState title="Action could not be completed" message={error} />}{form && <EntityForm title={form.type === "outcome" ? (form.item ? "Edit course outcome" : "Add course outcome") : (form.item ? "Edit score" : "Add score")} initialValues={form.item || (form.type === "outcome" ? { code: "", description: "" } : { student_id: "", course_outcome_id: "", marks: "" })} fields={form.type === "outcome" ? [{ name: "code", label: "Outcome code" }, { name: "description", label: "Description", type: "textarea" }] : scoreFields} onSubmit={save} onCancel={() => setForm(null)} busy={saving} error={error} />}{<section><div className="section-head"><div><h2>Course Outcomes</h2><p>{data.outcomes.length} outcomes mapped to this course.</p></div><button type="button" className="primary-button" onClick={() => setForm({ type: "outcome" })}>Add outcome</button></div>{data.outcomes.length ? <div className="outcome-cards">{data.outcomes.map((outcome) => <article className="outcome-card" key={outcome.id}><span className="code">{outcome.code}</span><p>{outcome.description}</p><div className="card-actions"><button type="button" className="text-button" onClick={() => setForm({ type: "outcome", item: outcome })}>Edit</button><button type="button" className="danger-button" onClick={() => remove("outcome", outcome, outcome.code)}>Delete</button></div></article>)}</div> : <EmptyState label="No course outcomes found." />}</section>}<section><div className="section-head"><div><h2>Student Performance</h2><p>Marks recorded for every course outcome.</p></div><button type="button" className="primary-button" onClick={() => setForm({ type: "score" })}>Add score</button></div>{data.students.length ? <ScoreTable students={data.students} outcomes={data.outcomes} scores={data.scores} onEdit={(item) => setForm({ type: "score", item })} onDelete={(item) => remove("score", item, "this score")} /> : <EmptyState label="No students found." />}</section></div>
}
