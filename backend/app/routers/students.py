from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import Student
from app.schemas import StudentCreate, StudentResponse


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
