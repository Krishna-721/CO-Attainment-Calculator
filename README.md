# CO Attainment

CO Attainment is a course-outcome analytics application for managing
courses, course outcomes, students, assessment scores, and attainment
calculations.

The application has an asynchronous FastAPI backend and a React/Vite frontend.
The frontend is connected to the backend API and supports CRUD management,
course workspaces, score tables, and threshold-based attainment analytics.

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy 2.x async API
- SQLite with `aiosqlite`
- Pydantic v2
- Uvicorn

### Frontend

- React
- Vite
- Tailwind CSS
- JavaScript

## Project Structure

```text
rubrix-co-attainment/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── attainment.py
│   │   │   ├── course_outcomes.py
│   │   │   ├── courses.py
│   │   │   ├── scores.py
│   │   │   └── students.py
│   │   ├── services/
│   │   │   └── attainment.py
│   │   ├── db.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── tests/
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   └── seed.py
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── layout.css
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Current Features

### Backend

- Create, list, and retrieve courses
- Update or partially update courses
- Delete courses and their related course outcomes and scores
- Create, list, and retrieve course outcomes
- Update or partially update course outcomes
- Delete course outcomes and their scores
- Create, list, and retrieve students
- Update or partially update students
- Delete students and their scores
- Create, list, and retrieve scores
- Update or partially update scores
- Delete scores
- Calculate attainment for one course outcome
- Calculate attainment for every outcome in a course
- Validate duplicate course codes
- Validate duplicate course outcome codes within a course
- Validate duplicate student roll numbers
- Validate duplicate student/course-outcome score combinations
- Return clear `404`, `409`, and validation errors
- Allow frontend development origins through CORS configuration

### Frontend

- Dashboard with course, outcome, student, and average attainment metrics
- Course catalogue with add, edit, delete, and open actions
- Course workspace with:
  - Course outcomes
  - Add, edit, and delete outcome actions
  - Student score matrix
  - Add, edit, and delete score actions
- Student directory with search, add, edit, and delete actions
- Attainment landing page with selectable course cards
- Course-specific attainment analytics
- Configurable threshold from `0` to `100`
- Outcome attainment percentages and progress bars
- Summary analytics for average attainment and outcomes meeting target
- Loading, empty, error, and retry states
- Responsive desktop and mobile layouts

## Database Relationships

```text
Course
   │
   │ 1 : N
   ▼
Course Outcome
   │
   │ 1 : N
   ▼
Score
   ▲
   │ N : 1
   │
Student
```

A course can have multiple course outcomes. A student can have multiple
scores, and each score belongs to one student and one course outcome.

## API Endpoints

### Courses

```text
POST   /courses/
GET    /courses/
GET    /courses/{course_id}
PUT    /courses/{course_id}
PATCH  /courses/{course_id}
DELETE /courses/{course_id}
```

### Course Outcomes

```text
POST   /course-outcomes/
GET    /course-outcomes/
GET    /course-outcomes/course/{course_id}
GET    /course-outcomes/{outcome_id}
PUT    /course-outcomes/{outcome_id}
PATCH  /course-outcomes/{outcome_id}
DELETE /course-outcomes/{outcome_id}
```

### Students

```text
POST   /students/
GET    /students/
GET    /students/{student_id}
PUT    /students/{student_id}
PATCH  /students/{student_id}
DELETE /students/{student_id}
```

### Scores

```text
POST   /scores/
GET    /scores/
GET    /scores/student/{student_id}
GET    /scores/course-outcome/{course_outcome_id}
GET    /scores/{score_id}
PUT    /scores/{score_id}
PATCH  /scores/{score_id}
DELETE /scores/{score_id}
```

### Attainment

The `threshold` query parameter is required and must be between `0` and `100`.

```text
GET /attainment/course-outcome/{course_outcome_id}?threshold=50
GET /attainment/course/{course_id}?threshold=50
```

The course endpoint returns one attainment result per course outcome:

```json
{
  "course_outcome_id": 1,
  "course_outcome_code": "C01",
  "threshold": 50,
  "total_students": 15,
  "students_meeting_threshold": 13,
  "attainment_percentage": 86.66666666666667
}
```

## Running the Backend

From the project root:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

Interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

The backend automatically initializes the SQLite database when it starts.

### Seed Development Data

To reset and populate the development database:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python seed.py
```

The seed script creates sample courses, course outcomes, students, and scores.

## Running the Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at `http://127.0.0.1:5173` or the next available Vite port.

The frontend uses the backend URL from `VITE_API_BASE_URL`. Create a
`frontend/.env` file when a different API URL is required:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

The default backend CORS origins are:

```text
http://localhost:5173
http://127.0.0.1:5173
```

Add custom origins with a comma-separated `CORS_ORIGINS` environment variable:

```powershell
$env:CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"
```

## Frontend Routes

```text
/                  Dashboard
/courses           Course catalogue
/courses/{id}      Course workspace and score management
/students          Student directory
/attainment        Course attainment selector
/attainment/{id}  Threshold-based course analytics
```

## Development Commands

### Frontend

```powershell
cd frontend
npm run dev
npm run build
npm run lint
```

### Backend Tests

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m pytest
```

The test suite covers attainment calculations, API flows, validation, and
CRUD behavior.

## Database

The default database URL is:

```text
sqlite+aiosqlite:///./rubrix.db
```

Set `DATABASE_URL` to use a different SQLAlchemy async database URL. The
development SQLite database should not be committed to source control.

## Architecture

The backend follows a layered structure:

```text
FastAPI Router
      ↓
Service Layer
      ↓
SQLAlchemy Async Session
      ↓
SQLite
```

The frontend communicates with the backend through the API helpers in
`frontend/src/services/api.js`. Pages own loading, mutation, and error state,
while shared components provide forms, cards, tables, progress bars, and
status states.

## Validation Status

The current application has been validated with:

- Frontend production build
- Frontend ESLint
- Backend automated tests
- Browser verification of dashboard data loading
- Browser verification of course workspace score data
- Browser verification of attainment course selection
- Browser verification of threshold analytics
- Backend/frontend CORS preflight verification

## Status

**Current status:** Functional full-stack CRUD and Course Outcome attainment
analytics application.

Authentication, authorization, production deployment configuration, and Docker
configuration are not included yet.
