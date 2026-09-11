import { useCallback, useEffect, useMemo, useState } from "react"

import {
  getCourse,
  getCourseAttainment,
  getCourseOutcomes,
  getCourses,
} from "../services/api"
import AttainmentCard from "../Components/attainment/AttainmentCard"
import { EmptyState, ErrorState, LoadingState } from "../Components/ui/States"

export default function Attainment({ courseId, navigate }) {
  const [courses, setCourses] = useState(null)
  const [course, setCourse] = useState(null)
  const [outcomes, setOutcomes] = useState([])
  const [results, setResults] = useState(null)
  const [threshold, setThreshold] = useState("50")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const loadCourses = useCallback(async () => {
    try {
      setError("")
      setCourses(await getCourses())
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const loadCourse = useCallback(async () => {
    if (!courseId) return

    try {
      setError("")
      setLoading(true)
      const [courseData, outcomeData] = await Promise.all([
        getCourse(courseId),
        getCourseOutcomes(courseId),
      ])
      setCourse(courseData)
      setOutcomes(outcomeData)
      setResults(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  useEffect(() => {
    loadCourse()
  }, [loadCourse])

  const calculate = async () => {
    const value = Number(threshold)
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      setError("Threshold must be a number from 0 to 100.")
      return
    }

    try {
      setError("")
      setLoading(true)
      setResults(await getCourseAttainment(courseId, value))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const summary = useMemo(() => {
    if (!results?.length) return null

    const average =
      results.reduce(
        (sum, result) => sum + Number(result.attainment_percentage),
        0,
      ) / results.length
    const meeting = results.filter(
      (result) => Number(result.attainment_percentage) >= 50,
    ).length

    return { average, meeting }
  }, [results])

  if (!courseId) {
    return (
      <div className="page attainment-page">
        <PageIntro
          eyebrow="ANALYTICS"
          title="Course Attainment"
          description="Select a course to view outcome scores and threshold analytics."
        />

        {error ? (
          <ErrorState
            title="Failed to load courses"
            message={error}
            onRetry={loadCourses}
          />
        ) : !courses ? (
          <LoadingState label="Loading courses..." />
        ) : courses.length ? (
          <div className="course-grid attainment-course-grid">
            {courses.map((item) => (
              <button
                type="button"
                className="course-card"
                key={item.id}
                onClick={() => navigate(`/attainment/${item.id}`)}
              >
                <div className="course-top">
                  <div>
                    <span className="code">{item.code}</span>
                    <h2>{item.name}</h2>
                  </div>
                  <span className="arrow">→</span>
                </div>
                <div className="course-meta">
                  <span>Open attainment analytics</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState label="No courses found." />
        )}
      </div>
    )
  }

  if (loading && !course) {
    return (
      <div className="page attainment-page">
        <LoadingState label="Loading attainment analytics..." />
      </div>
    )
  }

  if (!course && error) {
    return (
      <div className="page">
        <ErrorState
          title="Failed to load attainment"
          message={error}
          onRetry={loadCourse}
        />
      </div>
    )
  }

  const descriptions = new Map(
    outcomes.map((outcome) => [outcome.code, outcome.description]),
  )

  return (
    <div className="page">
      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/attainment")}
      >
        ← All courses
      </button>

      <PageIntro
        eyebrow={course?.code || "ATTAINMENT"}
        title={`${course?.name} Analytics`}
        description="Adjust the threshold to see how many students meet each course outcome."
      />

      <section className="calculator">
        <label>
          Threshold (%)
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="primary-button"
          onClick={calculate}
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate analytics"}
        </button>
      </section>

      {error && (
        <ErrorState
          title="Unable to calculate attainment"
          message={error}
          onRetry={calculate}
        />
      )}

      {summary && (
        <section className="metrics">
          <Metric
            label="AVERAGE ATTAINMENT"
            value={`${summary.average.toFixed(1)}%`}
            note={`At a ${threshold}% threshold`}
          />
          <Metric
            label="OUTCOMES MEETING TARGET"
            value={`${summary.meeting}/${results.length}`}
            note="At least 50% of students met threshold"
          />
          <Metric
            label="THRESHOLD"
            value={`${threshold}%`}
            note="Scores at or above this value count"
          />
          <Metric
            label="OUTCOMES ANALYZED"
            value={results.length}
            note="Course outcomes with score data"
          />
        </section>
      )}

      {results ? (
        results.length ? (
          <div className="attainment-grid">
            {results.map((result) => (
              <AttainmentCard
                key={result.course_outcome_id}
                result={result}
                description={descriptions.get(result.course_outcome_code)}
              />
            ))}
          </div>
        ) : (
          <EmptyState label="No attainment data is available for this course." />
        )
      ) : (
        <EmptyState label="Choose a threshold and calculate to view outcome analytics." />
      )}
    </div>
  )
}

function PageIntro({ eyebrow, title, description }) {
  return (
    <div className="page-title">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

function Metric({ label, value, note }) {
  return (
    <article className="metric">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{note}</span>
    </article>
  )
}
