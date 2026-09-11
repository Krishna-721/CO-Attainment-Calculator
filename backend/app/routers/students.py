from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Student
from app.schemas import StudentCreate, StudentPatch, StudentResponse, StudentUpdate


router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


@router.post(
    "/",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_student(
    student_data: StudentCreate,
    db: AsyncSession = Depends(get_db),
):
    # Check for duplicate roll number
    result = await db.execute(
        select(Student).where(Student.roll_number == student_data.roll_number)
    )

    existing_student = result.scalar_one_or_none()

    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student roll number already exists",
        )

    student = Student(
        roll_number=student_data.roll_number,
        name=student_data.name,
    )

    db.add(student)

    await db.commit()
    await db.refresh(student)

    return student


@router.get(
    "/",
    response_model=list[StudentResponse],
)
async def get_students(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Student).order_by(Student.id))

    return result.scalars().all()


@router.get(
    "/{student_id}",
    response_model=StudentResponse,
)
async def get_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Student).where(Student.id == student_id))

    student = result.scalar_one_or_none()

    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )

    return student


async def _get_student_or_404(student_id: int, db: AsyncSession) -> Student:
    result = await db.execute(select(Student).where(Student.id == student_id))
    student = result.scalar_one_or_none()
    if student is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found",
        )
    return student


async def _ensure_roll_number_available(
    roll_number: str,
    student_id: int,
    db: AsyncSession,
) -> None:
    result = await db.execute(
        select(Student).where(
            Student.roll_number == roll_number,
            Student.id != student_id,
        )
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Student roll number already exists",
        )


@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: AsyncSession = Depends(get_db),
):
    student = await _get_student_or_404(student_id, db)
    await _ensure_roll_number_available(
        student_data.roll_number, student_id, db
    )
    student.roll_number = student_data.roll_number
    student.name = student_data.name
    await db.commit()
    await db.refresh(student)
    return student


@router.patch("/{student_id}", response_model=StudentResponse)
async def patch_student(
    student_id: int,
    student_data: StudentPatch,
    db: AsyncSession = Depends(get_db),
):
    student = await _get_student_or_404(student_id, db)
    if not student_data.model_fields_set:
        raise HTTPException(status_code=400, detail="At least one field is required")
    if student_data.roll_number is not None:
        await _ensure_roll_number_available(
            student_data.roll_number, student_id, db
        )
        student.roll_number = student_data.roll_number
    if student_data.name is not None:
        student.name = student_data.name
    await db.commit()
    await db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
):
    student = await _get_student_or_404(student_id, db)
    await db.delete(student)
    await db.commit()
