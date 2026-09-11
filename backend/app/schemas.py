# Pydantic Schemas

from pydantic import BaseModel, ConfigDict, Field

# Course
class CourseBase(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=100)

class CourseCreate(CourseBase):
    pass

class CourseUpdate(CourseBase):
    pass

class CoursePatch(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=20)
    name: str | None = Field(default=None, min_length=1, max_length=100)

class CourseResponse(CourseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Course Outcome
class CourseOutcomeBase(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    description: str = Field(min_length=1, max_length=255)

class CourseOutcomeCreate(CourseOutcomeBase):
    course_id: int

class CourseOutcomeUpdate(CourseOutcomeBase):
    course_id: int

class CourseOutcomePatch(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=20)
    description: str | None = Field(default=None, min_length=1, max_length=255)
    course_id: int | None = None

class CourseOutcomeResponse(CourseOutcomeBase):
    id: int
    course_id: int
    model_config = ConfigDict(from_attributes=True)

# Student
class StudentBase(BaseModel):
    roll_number: str = Field(min_length=1, max_length=30)
    name: str = Field(min_length=1, max_length=100)

class StudentCreate(StudentBase):
    pass

class StudentUpdate(StudentBase):
    pass

class StudentPatch(BaseModel):
    roll_number: str | None = Field(default=None, min_length=1, max_length=30)
    name: str | None = Field(default=None, min_length=1, max_length=100)

class StudentResponse(StudentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Score
class ScoreBase(BaseModel):
    marks: float = Field(ge=0)

class ScoreCreate(ScoreBase):
    student_id: int
    course_outcome_id: int

class ScoreUpdate(ScoreBase):
    student_id: int
    course_outcome_id: int

class ScorePatch(BaseModel):
    marks: float | None = Field(default=None, ge=0)
    student_id: int | None = None
    course_outcome_id: int | None = None

class ScoreResponse(ScoreBase):
    id: int
    student_id: int
    course_outcome_id: int
    model_config = ConfigDict(from_attributes=True)

# Attainment
class AttainmentResponse(BaseModel):
    course_outcome_id: int
    course_outcome_code: str

    threshold: float
    total_students: int

    students_meeting_threshold: int
    attainment_percentage: float