from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import CourseOutcome, Score
from app.schemas import AttainmentResponse
from app.services.attainment import calculate_attainment


router = APIRouter(
    prefix="/attainment",
    tags=["Attainment"],
)


@router.get(
    "/course-outcome/{course_outcome_id}",
    response_model=AttainmentResponse,
)
async def get_course_outcome_attainment(
    course_outcome_id: int,
    threshold: float = Query(
        ...,
        ge=0,
        le=100,
        description="Target score threshold as a percentage",
    ),
    db: AsyncSession = Depends(get_db),
):
    # Find the Course Outcome
    result = await db.execute(
        select(CourseOutcome).where(CourseOutcome.id == course_outcome_id)
    )

    course_outcome = result.scalar_one_or_none()

    if course_outcome is None:
        raise HTTPException(
            status_code=404,
            detail="Course Outcome not found",
        )

    # Get all scores for this Course Outcome
    result = await db.execute(
        select(Score.marks).where(Score.course_outcome_id == course_outcome_id)
    )

    scores = list(result.scalars().all())

    # Calculate attainment using the service
    (
        students_meeting_threshold,
        attainment_percentage,
    ) = calculate_attainment(
        scores,
        threshold,
    )

    return AttainmentResponse(
        course_outcome_id=course_outcome.id,
        course_outcome_code=course_outcome.code,
        threshold=threshold,
        total_students=len(scores),
        students_meeting_threshold=students_meeting_threshold,
        attainment_percentage=attainment_percentage,
    )


@router.get(
    "/course/{course_id}",
    response_model=list[AttainmentResponse],
)
async def get_course_attainment(
    course_id: int,
    threshold: float = Query(
        ...,
        ge=0,
        le=100,
        description="Target score threshold as a percentage",
    ),
    db: AsyncSession = Depends(get_db),
):
    # Get all Course Outcomes for the course
    result = await db.execute(
        select(CourseOutcome)
        .where(CourseOutcome.course_id == course_id)
        .order_by(CourseOutcome.id)
    )

    course_outcomes = result.scalars().all()

    if not course_outcomes:
        raise HTTPException(
            status_code=404,
            detail="Course not found or has no Course Outcomes",
        )

    attainment_results = []

    for course_outcome in course_outcomes:
        # Get all scores for this Course Outcome
        result = await db.execute(
            select(Score.marks).where(Score.course_outcome_id == course_outcome.id)
        )

        scores = list(result.scalars().all())

        # Calculate attainment using the service
        (
            students_meeting_threshold,
            attainment_percentage,
        ) = calculate_attainment(
            scores,
            threshold,
        )

        attainment_results.append(
            AttainmentResponse(
                course_outcome_id=course_outcome.id,
                course_outcome_code=course_outcome.code,
                threshold=threshold,
                total_students=len(scores),
                students_meeting_threshold=students_meeting_threshold,
                attainment_percentage=attainment_percentage,
            )
        )

    return attainment_results