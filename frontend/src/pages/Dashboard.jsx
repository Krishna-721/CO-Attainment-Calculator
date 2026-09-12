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
  <article className="rounded-xl border border-line bg-panel p-[19px]">
    <p className="text-[10px] font-bold tracking-[0.09em] text-muted">{label}</p>
    <strong className="mt-3.5 block text-[28px]">{value}</strong>
    <span className="mt-1.5 block text-[11px] text-subtle">{note}</span>
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
      <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
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
        <div className="mb-3.5 flex items-end justify-between gap-5">
          <div>
            <h2>Your Courses</h2>
            <p>Select a course to view student performance.</p>
          </div>

          <button
            type="button"
            className="rounded-md border border-transparent px-3 py-2 text-xs font-bold text-accent hover:border-[#3a2c24] hover:bg-[#2a211c]"
            onClick={() => navigate("/courses")}
          >
            View all →
          </button>
        </div>

        {data.courses.length ? (
          <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
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

      <div className="grid gap-3.5 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-xl border border-line bg-panel p-5">
          <div className="mb-3.5 flex items-end justify-between gap-5">
            <div>
              <h2>Course Attainment</h2>
              <p>Average CO attainment at the default 50% threshold.</p>
            </div>
          </div>

          {courseAverages.length ? (
            <div className="grid gap-4">
              {courseAverages.map(({ course, average }) => (
                <button
                  type="button"
                  key={course.id}
                  className="grid w-full grid-cols-[minmax(0,1fr)_minmax(100px,1fr)_auto_auto] items-center gap-4 border-0 border-b border-line bg-transparent py-3.5 text-left text-ink max-sm:grid-cols-[minmax(0,1fr)_auto_auto]"
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

        <section className="rounded-xl border border-line bg-panel p-5">
          <div className="mb-3.5 flex items-end justify-between gap-5">
            <div>
              <h2>Course Summary</h2>
              <p>Your current academic courses.</p>
            </div>
          </div>

          {data.courses.map((course) => (
            <button
              type="button"
              key={course.id}
              className="flex w-full items-center justify-between border-0 border-b border-line bg-transparent py-3.5 text-left text-ink"
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
    <div className="grid w-full max-w-[1320px] gap-7">
      <div className="max-w-[760px]">
        <span className="text-[10px] font-bold tracking-[0.16em] text-subtle">OVERVIEW</span>
        <h1 className="my-1.5 text-[24px] leading-tight tracking-[-0.03em] sm:text-[28px]">Dashboard</h1>
        <p className="m-0 text-sm text-muted">Course performance and outcome attainment overview.</p>
      </div>

      {children}
    </div>
  );
}
