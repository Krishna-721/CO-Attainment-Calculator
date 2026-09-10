import asyncio

from sqlalchemy import delete

from app.db import AsyncSessionLocal, init_db
from app.models import Course, CourseOutcome, Score, Student


COURSES = [
    {
        "code": "CS301",
        "name": "Data Mining",
        "outcomes": [
            ("C01", "Understand basic data mining concepts"),
            ("C02", "Apply data preprocessing techniques"),
            ("C03", "Implement association rule mining"),
            ("C04", "Evaluate data mining results"),
        ],
    },
    {
        "code": "CS302",
        "name": "Database Management Systems",
        "outcomes": [
            ("C01", "Understand database fundamentals"),
            ("C02", "Design relational database schemas"),
            ("C03", "Write SQL queries"),
            ("C04", "Apply database normalization"),
        ],
    },
    {
        "code": "CS303",
        "name": "Computer Networks",
        "outcomes": [
            ("C01", "Understand networking fundamentals"),
            ("C02", "Explain network protocols"),
            ("C03", "Analyze network architectures"),
            ("C04", "Apply basic networking concepts"),
        ],
    },
]


STUDENTS = [
    ("23CS001", "Aarav"),
    ("23CS002", "Vivaan"),
    ("23CS003", "Aditya"),
    ("23CS004", "Arjun"),
    ("23CS005", "Sai"),
    ("23CS006", "Rohan"),
    ("23CS007", "Vikram"),
    ("23CS008", "Karthik"),
    ("23CS009", "Rahul"),
    ("23CS010", "Ananya"),
    ("23CS011", "Diya"),
    ("23CS012", "Ishita"),
    ("23CS013", "Meera"),
    ("23CS014", "Priya"),
    ("23CS015", "Sneha"),
]


# Scores are deliberately varied so attainment
# produces meaningful percentages at different thresholds.
SCORES = [
    [92, 85, 78, 88],
    [81, 74, 69, 82],
    [76, 68, 72, 79],
    [95, 91, 87, 93],
    [64, 59, 61, 70],
    [58, 52, 55, 63],
    [88, 80, 84, 86],
    [73, 67, 71, 75],
    [49, 45, 51, 57],
    [67, 61, 65, 72],
    [54, 48, 59, 62],
    [91, 89, 94, 90],
    [43, 50, 47, 53],
    [79, 72, 76, 81],
    [60, 56, 62, 68],
]


async def seed_database():
    await init_db()

    async with AsyncSessionLocal() as db:
        # Reset development data
        await db.execute(delete(Score))
        await db.execute(delete(CourseOutcome))
        await db.execute(delete(Course))
        await db.execute(delete(Student))

        await db.commit()

        # -------------------------
        # Create courses + COs
        # -------------------------

        courses = []

        for course_data in COURSES:
            course = Course(
                code=course_data["code"],
                name=course_data["name"],
            )

            db.add(course)
            courses.append((course, course_data["outcomes"]))

        await db.flush()

        for course, outcomes in courses:
            for code, description in outcomes:
                outcome = CourseOutcome(
                    code=code,
                    description=description,
                    course_id=course.id,
                )

                db.add(outcome)

        await db.flush()

        # -------------------------
        # Create students
        # -------------------------

        students = []

        for roll_number, name in STUDENTS:
            student = Student(
                roll_number=roll_number,
                name=name,
            )

            db.add(student)
            students.append(student)

        await db.flush()

        # -------------------------
        # Create scores
        # -------------------------

        all_outcomes = await db.execute(
            CourseOutcome.__table__.select().order_by(CourseOutcome.id)
        )

        outcomes = all_outcomes.fetchall()

        student_index = 0

        for student in students:
            student_scores = SCORES[student_index]

            for course_index in range(len(COURSES)):
                # Four COs per course
                for co_index in range(4):
                    outcome_index = course_index * 4 + co_index

                    outcome = outcomes[outcome_index]

                    # Slightly vary scores between courses
                    # while keeping the dataset predictable.
                    base_score = student_scores[co_index]

                    adjustment = course_index * 2

                    marks = min(
                        100,
                        max(
                            0,
                            base_score + adjustment,
                        ),
                    )

                    score = Score(
                        marks=marks,
                        student_id=student.id,
                        course_outcome_id=outcome.id,
                    )

                    db.add(score)

            student_index += 1

        await db.commit()

    print("Database seeded successfully.")
    print("Created:")
    print("- 3 courses")
    print("- 12 Course Outcomes")
    print("- 15 students")
    print("- 180 scores")


if __name__ == "__main__":
    asyncio.run(seed_database())
