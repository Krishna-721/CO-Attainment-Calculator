from sqlalchemy import Float, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    course_outcomes: Mapped[list["CourseOutcome"]] = relationship(
        back_populates="course",
        cascade="all, delete-orphan",
    )


class CourseOutcome(Base):
    __tablename__ = "course_outcomes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String(20), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)

    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )

    course: Mapped["Course"] = relationship(
        back_populates="course_outcomes",
    )

    scores: Mapped[list["Score"]] = relationship(
        back_populates="course_outcome",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint(
            "course_id",
            "code",
            name="uq_course_outcome_code",
        ),
    )


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    roll_number: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    scores: Mapped[list["Score"]] = relationship(
        back_populates="student",
        cascade="all, delete-orphan",
    )


class Score(Base):
    __tablename__ = "scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    marks: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )

    course_outcome_id: Mapped[int] = mapped_column(
        ForeignKey("course_outcomes.id", ondelete="CASCADE"),
        nullable=False,
    )

    student: Mapped["Student"] = relationship(
        back_populates="scores",
    )

    course_outcome: Mapped["CourseOutcome"] = relationship(
        back_populates="scores",
    )

    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "course_outcome_id",
            name="uq_student_co_score",
        ),
    )