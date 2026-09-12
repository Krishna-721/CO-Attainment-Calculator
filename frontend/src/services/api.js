const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

async function request(endpoint, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch {
    throw new Error(
      "Unable to reach the API. Confirm that the FastAPI server is running.",
    );
  }
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("The API returned an invalid response.");
  }
  if (!response.ok)
    throw new Error(body?.detail || `Request failed (${response.status}).`);
  return body;
}
export const getCourses = () => request("/courses/");
export const getCourse = (id) => request(`/courses/${id}`);
export const getCourseOutcomes = (courseId) =>
  request(`/course-outcomes/course/${courseId}`);
export const getAllCourseOutcomes = () => request("/course-outcomes/");
export const getStudents = () => request("/students/");
export const getScores = () => request("/scores/");
export const getScoresByStudent = (studentId) =>
  request(`/scores/student/${studentId}`);
export const getScoresByCourseOutcome = (outcomeId) =>
  request(`/scores/course-outcome/${outcomeId}`);
export const getCourseAttainment = (courseId, threshold = 50) =>
  request(
    `/attainment/course/${courseId}?threshold=${encodeURIComponent(threshold)}`,
  );
export const createCourse = (data) =>
  request("/courses/", { method: "POST", body: JSON.stringify(data) });
export const createCourseOutcome = (data) =>
  request("/course-outcomes/", { method: "POST", body: JSON.stringify(data) });
export const createStudent = (data) =>
  request("/students/", { method: "POST", body: JSON.stringify(data) });
export const createScore = (data) =>
  request("/scores/", { method: "POST", body: JSON.stringify(data) });
export const updateCourse = (id, data) =>
  request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteCourse = (id) =>
  request(`/courses/${id}`, { method: "DELETE" });
export const updateCourseOutcome = (id, data) =>
  request(`/course-outcomes/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteCourseOutcome = (id) =>
  request(`/course-outcomes/${id}`, { method: "DELETE" });
export const updateStudent = (id, data) =>
  request(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteStudent = (id) =>
  request(`/students/${id}`, { method: "DELETE" });
export const updateScore = (id, data) =>
  request(`/scores/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteScore = (id) =>
  request(`/scores/${id}`, { method: "DELETE" });
