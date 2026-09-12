import { useCallback, useEffect, useState } from "react";

import {
  getCourseAttainment,
  getCourseOutcomes,
  getCourses,
  getStudents,
} from "../services/api";

import CourseCard from "../Components/courses/CourseCard";
import ProgressBar from "../Components/ui/ProgressBar";
import { EmptyState, ErrorState, LoadingState } from "../Components/ui/States";

const Metric = ({ label, value, note }) => (
  <article className="metric">
    <p>{label}</p>
    <strong>{value}</strong>
    <span>{note}</span>
  </article>
);

export default function Dashboard({ navigate }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setData(null);

      const [courses, students] = await Promise.all([
        getCourses(),
        getStudents(),
      ]);

      const details = await Promise.all(
        courses.map(async (course) => {
          const [outcomes, attainment] = await Promise.all([
            getCourseOutcomes(course.id),
            getCourseAttainment(course.id, 50),
          ]);

          return {
            course,
            outcomes,
            attainment,
          };
        }),
      );

      setData({
        courses,
        students,
        details,
      });
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <PageHeader>
        <ErrorState
          title="Failed to load dashboard"
          message={error}
          onRetry={load}
        />
      </PageHeader>
    );
  }

  if (!data) {
    return (
      <PageHeader>
        <LoadingState label="Loading dashboard..." />
      </PageHeader>
    );
  }

  const courseAverages = data.details
    .filter(({ attainment }) => attainment.length > 0)
    .map(({ course, attainment }) => ({
      course,
      average:
        attainment.reduce(
          (sum, item) => sum + Number(item.attainment_percentage),
          0,
        ) / attainment.length,
    }));

  const average = courseAverages.length
    ? courseAverages.reduce((sum, item) => sum + item.average, 0) /
      courseAverages.length
    : null;

  return (
    <PageHeader>
      <section className="metrics">
        <Metric
          label="TOTAL COURSES"
          value={data.courses.length}
          note="Active academic courses"
        />

        <Metric
          label="COURSE OUTCOMES"
          value={data.details.reduce(
            (sum, item) => sum + item.outcomes.length,
            0,
          )}
          note="Across all courses"
        />

        <Metric
          label="TOTAL STUDENTS"
          value={data.students.length}
          note="Enrolled students"
        />

        <Metric
          label="AVG. ATTAINMENT / COURSE"
          value={average === null ? "—" : `${average.toFixed(1)}%`}
          note="At a 50% threshold"
        />
      </section>

      <section>
        <div className="section-head">
          <div>
            <h2>Your Courses</h2>
            <p>Select a course to view student performance.</p>
          </div>

          <button
            type="button"
            className="text-button"
            onClick={() => navigate("/courses")}
          >
            View all →
          </button>
        </div>

        {data.courses.length ? (
          <div className="course-grid">
            {data.details.map(({ course, outcomes }) => (
              <CourseCard
                key={course.id}
                course={course}
                outcomeCount={outcomes.length}
                studentCount={data.students.length}
                onOpen={() => navigate(`/courses/${course.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState label="No courses found." />
        )}
      </section>

      <div className="dashboard-bottom">
        <section className="surface course-attainment">
          <div className="section-head">
            <div>
              <h2>Course Attainment</h2>
              <p>Average CO attainment at the default 50% threshold.</p>
            </div>
          </div>

          {courseAverages.length ? (
            <div className="outcome-list">
              {courseAverages.map(({ course, average }) => (
                <button
                  type="button"
                  key={course.id}
                  className="summary-row"
                  onClick={() => navigate(`/courses/${course.id}`)}
                >
                  <span>
                    <b>{course.code}</b>
                    {course.name}
                  </span>

                  <ProgressBar value={average} />

                  <strong>{average.toFixed(1)}%</strong>

                  <i>→</i>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState label="No course attainment data available." />
          )}
        </section>

        <section className="surface">
          <div className="section-head">
            <div>
              <h2>Course Summary</h2>
              <p>Your current academic courses.</p>
            </div>
          </div>

          {data.courses.map((course) => (
            <button
              type="button"
              key={course.id}
              className="summary-row"
              onClick={() => navigate(`/courses/${course.id}`)}
            >
              <span>
                <b>{course.code}</b>
                {course.name}
              </span>

              <i>→</i>
            </button>
          ))}
        </section>
      </div>
    </PageHeader>
  );
}

function PageHeader({ children }) {
  return (
    <div className="page">
      <div className="page-title">
        <span>OVERVIEW</span>
        <h1>Dashboard</h1>
        <p>Course performance and outcome attainment overview.</p>
      </div>

      {children}
    </div>
  );
}
