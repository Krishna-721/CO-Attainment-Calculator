from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Course
from app.schemas import CourseCreate, CoursePatch, CourseResponse, CourseUpdate

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


async def _get_course_or_404(course_id: int, db: AsyncSession) -> Course:
    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )
    return course


async def _ensure_code_available(
    code: str,
    course_id: int,
    db: AsyncSession,
) -> None:
    result = await db.execute(
        select(Course).where(Course.code == code, Course.id != course_id)
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Course code already exists",
        )


@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(
    course_id: int,
    course_data: CourseUpdate,
    db: AsyncSession = Depends(get_db),
):
    course = await _get_course_or_404(course_id, db)
    await _ensure_code_available(course_data.code, course_id, db)
    course.code = course_data.code
    course.name = course_data.name
    await db.commit()
    await db.refresh(course)
    return course


@router.patch("/{course_id}", response_model=CourseResponse)
async def patch_course(
    course_id: int,
    course_data: CoursePatch,
    db: AsyncSession = Depends(get_db),
):
    course = await _get_course_or_404(course_id, db)
    if not course_data.model_fields_set:
        raise HTTPException(status_code=400, detail="At least one field is required")
    if course_data.code is not None:
        await _ensure_code_available(course_data.code, course_id, db)
        course.code = course_data.code
    if course_data.name is not None:
        course.name = course_data.name
    await db.commit()
    await db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
):
    course = await _get_course_or_404(course_id, db)
    await db.delete(course)
    await db.commit()
