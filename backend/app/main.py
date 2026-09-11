import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.routers.courses import router as courses_router
from app.routers.course_outcomes import router as course_outcomes_router
from app.routers.students import router as students_router
from app.routers.scores import router as scores_router
from app.routers.attainment import router as attainment_router


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

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses_router)
app.include_router(course_outcomes_router)
app.include_router(students_router)
app.include_router(scores_router)
app.include_router(attainment_router)

@app.get("/")
async def root():
    return {
        "message": "API is running"
    }