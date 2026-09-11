from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import CourseOutcome, Score, Student
from app.schemas import ScoreCreate, ScorePatch, ScoreResponse, ScoreUpdate


router = APIRouter(
    prefix="/scores",
    tags=["Scores"],
)


@router.post(
    "/",
    response_model=ScoreResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_score(
    score_data: ScoreCreate,
    db: AsyncSession = Depends(get_db),
):
    # Check that the student exists
    result = await db.execute(
        select(Student).where(Student.id == score_data.student_id)
    )

    student = result.scalar_one_or_none()

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    # Check that the Course Outcome exists
    result = await db.execute(
        select(CourseOutcome).where(CourseOutcome.id == score_data.course_outcome_id)
    )

    outcome = result.scalar_one_or_none()

    if outcome is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course Outcome not found",
        )

    # Check for an existing score
    result = await db.execute(
        select(Score).where(
            Score.student_id == score_data.student_id,
            Score.course_outcome_id == score_data.course_outcome_id,
        )
    )

    existing_score = result.scalar_one_or_none()

    if existing_score:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Score already exists for this student and Course Outcome",
        )

    score = Score(
        marks=score_data.marks,
        student_id=score_data.student_id,
        course_outcome_id=score_data.course_outcome_id,
    )

    db.add(score)

    await db.commit()
    await db.refresh(score)

    return score


@router.get(
    "/",
    response_model=list[ScoreResponse],
)
async def get_scores(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Score).order_by(Score.id))

    return result.scalars().all()


@router.get(
    "/student/{student_id}",
    response_model=list[ScoreResponse],
)
async def get_student_scores(
    student_id: int,
    db: AsyncSession = Depends(get_db),
):
    # Check that the student exists
    result = await db.execute(select(Student).where(Student.id == student_id))

    student = result.scalar_one_or_none()

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    result = await db.execute(
        select(Score).where(Score.student_id == student_id).order_by(Score.id)
    )

    return result.scalars().all()


@router.get(
    "/course-outcome/{course_outcome_id}",
    response_model=list[ScoreResponse],
)
async def get_course_outcome_scores(
    course_outcome_id: int,
    db: AsyncSession = Depends(get_db),
):
    # Check that the Course Outcome exists
    result = await db.execute(
        select(CourseOutcome).where(CourseOutcome.id == course_outcome_id)
    )

    outcome = result.scalar_one_or_none()

    if outcome is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course Outcome not found",
        )

    result = await db.execute(
        select(Score)
        .where(Score.course_outcome_id == course_outcome_id)
        .order_by(Score.id)
    )

    return result.scalars().all()


@router.get(
    "/{score_id}",
    response_model=ScoreResponse,
)
async def get_score(
    score_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Score).where(Score.id == score_id))

    score = result.scalar_one_or_none()

    if score is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score not found",
        )

    return score


async def _get_score_or_404(score_id: int, db: AsyncSession) -> Score:
    result = await db.execute(select(Score).where(Score.id == score_id))
    score = result.scalar_one_or_none()
    if score is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score not found",
        )
    return score


async def _ensure_score_references_and_uniqueness(
    student_id: int,
    course_outcome_id: int,
    score_id: int,
    db: AsyncSession,
) -> None:
    student_result = await db.execute(select(Student).where(Student.id == student_id))
    if student_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    outcome_result = await db.execute(
        select(CourseOutcome).where(CourseOutcome.id == course_outcome_id)
    )
    if outcome_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course Outcome not found",
        )
    duplicate_result = await db.execute(
        select(Score).where(
            Score.student_id == student_id,
            Score.course_outcome_id == course_outcome_id,
            Score.id != score_id,
        )
    )
    if duplicate_result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Score already exists for this student and Course Outcome",
        )


@router.put("/{score_id}", response_model=ScoreResponse)
async def update_score(
    score_id: int,
    score_data: ScoreUpdate,
    db: AsyncSession = Depends(get_db),
):
    score = await _get_score_or_404(score_id, db)
    await _ensure_score_references_and_uniqueness(
        score_data.student_id, score_data.course_outcome_id, score_id, db
    )
    score.marks = score_data.marks
    score.student_id = score_data.student_id
    score.course_outcome_id = score_data.course_outcome_id
    await db.commit()
    await db.refresh(score)
    return score


@router.patch("/{score_id}", response_model=ScoreResponse)
async def patch_score(
    score_id: int,
    score_data: ScorePatch,
    db: AsyncSession = Depends(get_db),
):
    score = await _get_score_or_404(score_id, db)
    if not score_data.model_fields_set:
        raise HTTPException(status_code=400, detail="At least one field is required")
    student_id = (
        score_data.student_id if score_data.student_id is not None else score.student_id
    )
    course_outcome_id = (
        score_data.course_outcome_id
        if score_data.course_outcome_id is not None
        else score.course_outcome_id
    )
    if (
        score_data.student_id is not None
        or score_data.course_outcome_id is not None
    ):
        await _ensure_score_references_and_uniqueness(
            student_id, course_outcome_id, score_id, db
        )
        score.student_id = student_id
        score.course_outcome_id = course_outcome_id
    if score_data.marks is not None:
        score.marks = score_data.marks
    await db.commit()
    await db.refresh(score)
    return score


@router.delete("/{score_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_score(
    score_id: int,
    db: AsyncSession = Depends(get_db),
):
    score = await _get_score_or_404(score_id, db)
    await db.delete(score)
    await db.commit()
