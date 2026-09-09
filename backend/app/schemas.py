# Pydantic Schemas

from pydantic import BaseModel, ConfigDict, Field

# Course
class CourseBase(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    name: str = Field(min_length=1, max_length=100)

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Course Outcome
class CourseOutcomeBase(BaseModel):
    code: str = Field(min_length=1, max_length=20)
    description: str = Field(min_length=1, max_length=255)

class CourseOutcomeCreate(CourseOutcomeBase):
    course_id: int

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

class StudentResponse(StudentBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

# Score
class ScoreBase(BaseModel):
    marks: float = Field(ge=0)

class ScoreCreate(ScoreBase):
    student_id: int
    course_outcome_id: int

class ScoreResponse(ScoreBase):
    id: int
    student_id: int
    course_outcome_id: int
    model_config = ConfigDict(from_attributes=True)