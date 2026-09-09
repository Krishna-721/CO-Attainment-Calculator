from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Course
from app.schemas import CourseCreate, CourseResponse

router = APIRouter(
    prefix="/courses",
    tags=["Courses"],
)

@router.post("/",response_model=CourseResponse,status_code=status.HTTP_201_CREATED)
async def create_course(course_data: CourseCreate,db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).where(Course.code == course_data.code))

    existing_course = result.scalar_one_or_none()

    if existing_course:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Course code already exists",
        )

    course = Course(
        code=course_data.code,
        name=course_data.name,
    )

    db.add(course)

    await db.commit()
    await db.refresh(course)

    return course


@router.get("/",response_model=list[CourseResponse])
async def get_courses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Course).order_by(Course.id))

    return result.scalars().all()


@router.get(
    "/{course_id}",
    response_model=CourseResponse,
)
async def get_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Course).where(Course.id == course_id))

    course = result.scalar_one_or_none()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    return course
