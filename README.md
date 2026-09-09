# Rubrix CO Attainment

A course-outcome attainment application with a React/Vite frontend and a FastAPI/SQLite backend.

## Prerequisites

- Node.js 20 or newer
- Python 3.11 or newer

## Run locally

Start the API:

```powershell
cd backend
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API is available at `http://127.0.0.1:8000`; interactive docs are at `/docs`.

In a second terminal, start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Tests

```powershell
cd backend
pytest
```
