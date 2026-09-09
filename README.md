# Rubrix CO Attainment API

A backend API for managing courses, course outcomes, students, assessment scores, and calculating Course Outcome (CO) attainment.

The project is being built with an asynchronous backend architecture using FastAPI and SQLAlchemy's async API.

## Tech Stack

### Backend

* Python
* FastAPI
* SQLAlchemy 2.x
* SQLite
* aiosqlite
* Pydantic v2
* Uvicorn

### Planned Frontend

* React
* Vite
* Tailwind CSS

## Project Structure

```text
rubrix-co-attainment/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   │   ├── courses.py
│   │   │   ├── course_outcomes.py
│   │   │   ├── students.py
│   │   │   └── scores.py
│   │   │
│   │   ├── services/
│   │   ├── db.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── __init__.py
│   │
│   ├── tests/
│   ├── seed.py
│   ├── requirements.txt
│   └── .venv/
│
├── frontend/
│
└── README.md
```

## Current Features

The backend currently provides APIs for:

* Creating and viewing courses
* Creating and viewing Course Outcomes
* Associating Course Outcomes with courses
* Creating and viewing students
* Recording student scores against Course Outcomes
* Validating duplicate course codes
* Validating duplicate Course Outcomes within a course
* Validating duplicate student roll numbers
* Validating duplicate student/CO score combinations

All database operations use SQLAlchemy's asynchronous API.

## Database Relationships

The current database follows this structure:

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

A course can have multiple Course Outcomes.

A student can have multiple scores.

Each score belongs to one student and one Course Outcome.

For example:

```text
Data Mining
│
├── C01
│    └── Victini → 100
│
└── C02
     └── Victini → 100
```

## API Endpoints

### Courses

```text
POST /courses/
GET  /courses/
GET  /courses/{course_id}
```

### Course Outcomes

```text
POST /course-outcomes/
GET  /course-outcomes/
GET  /course-outcomes/course/{course_id}
GET  /course-outcomes/{outcome_id}
```

### Students

```text
POST /students/
GET  /students/
GET  /students/{student_id}
```

### Scores

```text
POST /scores/
GET  /scores/
GET  /scores/student/{student_id}
GET  /scores/course-outcome/{course_outcome_id}
GET  /scores/{score_id}
```

## Running the Backend

Navigate to the backend directory:

```bash
cd backend
```

Activate the virtual environment if necessary.

### Windows PowerShell

```powershell
.\.venv\Scripts\Activate.ps1
```

Start the development server:

```powershell
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

## Database

The project currently uses SQLite with the asynchronous `aiosqlite` driver.

Database URL:

```text
sqlite+aiosqlite:///./rubrix.db
```

The database is automatically initialized when the FastAPI application starts.

The database file should not be committed to Git.

## Example

Create a course:

```json
{
  "code": "CS301",
  "name": "Data Mining"
}
```

Create a Course Outcome:

```json
{
  "code": "C01",
  "description": "Understand basic concepts of computer science",
  "course_id": 1
}
```

Create a student:

```json
{
  "roll_number": "000",
  "name": "Victini"
}
```

Add a score:

```json
{
  "marks": 100,
  "student_id": 1,
  "course_outcome_id": 1
}
```

## Development Roadmap

* [x] Project structure
* [x] Async database configuration
* [x] SQLAlchemy models
* [x] Pydantic schemas
* [x] Course API
* [x] Course Outcome API
* [x] Student API
* [x] Score API
* [ ] CO attainment calculation service
* [ ] Attainment API
* [ ] Automated tests
* [ ] Seed/sample data
* [ ] React frontend
* [ ] Dashboard and visualizations
* [ ] Frontend/backend integration
* [ ] Authentication and authorization
* [ ] Docker configuration

## Development Philosophy

The backend is structured into separate layers:

```text
API Routes
    ↓
Business Logic / Services
    ↓
Database Access
    ↓
SQLite
```

Business logic such as CO attainment calculations will be kept in the service layer rather than being embedded directly inside API routes.

## Status

**Current status:** Backend CRUD foundation completed.

The next major component is the CO attainment calculation engine.
