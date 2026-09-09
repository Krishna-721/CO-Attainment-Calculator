from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db import init_db
from app.routers.courses import router as courses_router
from app.routers.course_outcomes import router as course_outcomes_router
from app.routers.students import router as students_router
from app.routers.scores import router as scores_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="CO Attainment API",
    description="Course Outcome attainment calculator for higher education.",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(courses_router)
app.include_router(course_outcomes_router)
app.include_router(students_router)
app.include_router(scores_router)

@app.get("/")
async def root():
    return {
        "message": "API is running"
    }