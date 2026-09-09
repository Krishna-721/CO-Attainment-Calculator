from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Course, CourseOutcome
from app.schemas import CourseOutcomeCreate, CourseOutcomeResponse

# 1->N relationship between Course and CourseOutcome
router = APIRouter(
    prefix="/course-outcomes",
    tags=["Course Outcomes"],
)


@router.post(
    "/",
    response_model=CourseOutcomeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_course_outcome(
    outcome_data: CourseOutcomeCreate,
    db: AsyncSession = Depends(get_db),
):
    # Check that the course exists
    result = await db.execute(select(Course).where(Course.id == outcome_data.course_id))

    course = result.scalar_one_or_none()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    # Check for duplicate CO code within the same course
    result = await db.execute(
        select(CourseOutcome).where(
            CourseOutcome.course_id == outcome_data.course_id,
            CourseOutcome.code == outcome_data.code,
        )
    )

    existing_outcome = result.scalar_one_or_none()

    if existing_outcome:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Course Outcome code already exists for this course",
        )

    outcome = CourseOutcome(
        code=outcome_data.code,
        description=outcome_data.description,
        course_id=outcome_data.course_id,
    )

    db.add(outcome)

    await db.commit()
    await db.refresh(outcome)

    return outcome


@router.get(
    "/",
    response_model=list[CourseOutcomeResponse],
)
async def get_course_outcomes(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(CourseOutcome).order_by(CourseOutcome.id))

    return result.scalars().all()


@router.get(
    "/course/{course_id}",
    response_model=list[CourseOutcomeResponse],
)
async def get_course_outcomes_by_course(
    course_id: int,
    db: AsyncSession = Depends(get_db),
):
    # Check that the course exists
    result = await db.execute(select(Course).where(Course.id == course_id))

    course = result.scalar_one_or_none()

    if course is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    result = await db.execute(
        select(CourseOutcome)
        .where(CourseOutcome.course_id == course_id)
        .order_by(CourseOutcome.id)
    )

    return result.scalars().all()


@router.get(
    "/{outcome_id}",
    response_model=CourseOutcomeResponse,
)
async def get_course_outcome(
    outcome_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CourseOutcome).where(CourseOutcome.id == outcome_id)
    )

    outcome = result.scalar_one_or_none()

    if outcome is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course Outcome not found",
        )

    return outcome
