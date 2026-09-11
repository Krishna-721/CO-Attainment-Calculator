from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Course, CourseOutcome
from app.schemas import (
    CourseOutcomeCreate,
    CourseOutcomePatch,
    CourseOutcomeResponse,
    CourseOutcomeUpdate,
)

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


async def _get_outcome_or_404(outcome_id: int, db: AsyncSession) -> CourseOutcome:
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


async def _ensure_outcome_is_valid(
    code: str,
    course_id: int,
    outcome_id: int,
    db: AsyncSession,
) -> None:
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    if course_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )
    duplicate_result = await db.execute(
        select(CourseOutcome).where(
            CourseOutcome.course_id == course_id,
            CourseOutcome.code == code,
            CourseOutcome.id != outcome_id,
        )
    )
    if duplicate_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Course Outcome code already exists for this course",
        )


@router.put("/{outcome_id}", response_model=CourseOutcomeResponse)
async def update_course_outcome(
    outcome_id: int,
    outcome_data: CourseOutcomeUpdate,
    db: AsyncSession = Depends(get_db),
):
    outcome = await _get_outcome_or_404(outcome_id, db)
    await _ensure_outcome_is_valid(
        outcome_data.code, outcome_data.course_id, outcome_id, db
    )
    outcome.code = outcome_data.code
    outcome.description = outcome_data.description
    outcome.course_id = outcome_data.course_id
    await db.commit()
    await db.refresh(outcome)
    return outcome


@router.patch("/{outcome_id}", response_model=CourseOutcomeResponse)
async def patch_course_outcome(
    outcome_id: int,
    outcome_data: CourseOutcomePatch,
    db: AsyncSession = Depends(get_db),
):
    outcome = await _get_outcome_or_404(outcome_id, db)
    if not outcome_data.model_fields_set:
        raise HTTPException(status_code=400, detail="At least one field is required")
    code = outcome_data.code if outcome_data.code is not None else outcome.code
    course_id = (
        outcome_data.course_id
        if outcome_data.course_id is not None
        else outcome.course_id
    )
    if outcome_data.code is not None or outcome_data.course_id is not None:
        await _ensure_outcome_is_valid(code, course_id, outcome_id, db)
        outcome.code = code
        outcome.course_id = course_id
    if outcome_data.description is not None:
        outcome.description = outcome_data.description
    await db.commit()
    await db.refresh(outcome)
    return outcome


@router.delete("/{outcome_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course_outcome(
    outcome_id: int,
    db: AsyncSession = Depends(get_db),
):
    outcome = await _get_outcome_or_404(outcome_id, db)
    await db.delete(outcome)
    await db.commit()
