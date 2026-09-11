import pytest
import pytest_asyncio

from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.db import Base, get_db
from app.main import app


@pytest_asyncio.fixture
async def client():
    test_engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        echo=False,
    )

    TestSessionLocal = async_sessionmaker(
        bind=test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with test_engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    async def override_get_db():
        async with TestSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport,
        base_url="http://test",
    ) as test_client:
        yield test_client

    app.dependency_overrides.clear()

    async with test_engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)

    await test_engine.dispose()


async def create_test_course_and_co(client):
    response = await client.post(
        "/courses/",
        json={
            "code": "TEST101",
            "name": "Test Course",
        },
    )

    assert response.status_code == 201

    course_id = response.json()["id"]

    response = await client.post(
        "/course-outcomes/",
        json={
            "code": "C01",
            "description": "Test Course Outcome",
            "course_id": course_id,
        },
    )

    assert response.status_code == 201

    course_outcome_id = response.json()["id"]

    return course_id, course_outcome_id


async def create_students_and_scores(
    client,
    course_outcome_id,
    scores,
):
    student_ids = []

    for index, marks in enumerate(scores, start=1):
        response = await client.post(
            "/students/",
            json={
                "roll_number": f"TEST{index:03d}",
                "name": f"Student {index}",
            },
        )

        assert response.status_code == 201

        student_id = response.json()["id"]
        student_ids.append(student_id)

        response = await client.post(
            "/scores/",
            json={
                "student_id": student_id,
                "course_outcome_id": course_outcome_id,
                "marks": marks,
            },
        )

        assert response.status_code == 201

    return student_ids


async def check_attainment(
    client,
    course_outcome_id,
    threshold,
    expected_total,
    expected_meeting,
    expected_percentage,
):
    response = await client.get(
        f"/attainment/course-outcome/{course_outcome_id}",
        params={"threshold": threshold},
    )

    assert response.status_code == 200

    attainment = response.json()

    assert attainment["course_outcome_id"] == course_outcome_id
    assert attainment["course_outcome_code"] == "C01"
    assert attainment["threshold"] == threshold
    assert attainment["total_students"] == expected_total
    assert attainment["students_meeting_threshold"] == expected_meeting
    assert attainment["attainment_percentage"] == expected_percentage


@pytest.mark.asyncio
async def test_api_mixed_scores(client):
    _, course_outcome_id = await create_test_course_and_co(client)

    scores = [80, 60, 10, 50]

    await create_students_and_scores(
        client,
        course_outcome_id,
        scores,
    )

    await check_attainment(
        client,
        course_outcome_id,
        threshold=50,
        expected_total=4,
        expected_meeting=3,
        expected_percentage=75.0,
    )


@pytest.mark.asyncio
async def test_api_everyone_meets_threshold(client):
    _, course_outcome_id = await create_test_course_and_co(client)

    scores = [50, 55, 70, 100]

    await create_students_and_scores(
        client,
        course_outcome_id,
        scores,
    )

    await check_attainment(
        client,
        course_outcome_id,
        threshold=50,
        expected_total=4,
        expected_meeting=4,
        expected_percentage=100.0,
    )


@pytest.mark.asyncio
async def test_api_nobody_meets_threshold(client):
    _, course_outcome_id = await create_test_course_and_co(client)

    scores = [10, 20, 30, 49]

    await create_students_and_scores(
        client,
        course_outcome_id,
        scores,
    )

    await check_attainment(
        client,
        course_outcome_id,
        threshold=50,
        expected_total=4,
        expected_meeting=0,
        expected_percentage=0.0,
    )


@pytest.mark.asyncio
async def test_api_boundary_scores(client):
    _, course_outcome_id = await create_test_course_and_co(client)

    scores = [50, 50, 49, 51, 20]

    await create_students_and_scores(
        client,
        course_outcome_id,
        scores,
    )

    await check_attainment(
        client,
        course_outcome_id,
        threshold=50,
        expected_total=5,
        expected_meeting=3,
        expected_percentage=60.0,
    )


@pytest.mark.asyncio
async def test_api_random_scores(client):
    _, course_outcome_id = await create_test_course_and_co(client)

    scores = [73, 12, 88, 47, 50, 91, 3, 64, 39, 76]

    await create_students_and_scores(
        client,
        course_outcome_id,
        scores,
    )

    await check_attainment(
        client,
        course_outcome_id,
        threshold=50,
        expected_total=10,
        expected_meeting=6,
        expected_percentage=60.0,
    )


@pytest.mark.asyncio
async def test_api_updates_and_conflicts(client):
    course_id, outcome_id = await create_test_course_and_co(client)
    second_course = await client.post(
        "/courses/",
        json={"code": "TEST102", "name": "Second Course"},
    )
    second_course_id = second_course.json()["id"]

    first_student = await client.post(
        "/students/",
        json={"roll_number": "TEST001", "name": "First Student"},
    )
    first_student_id = first_student.json()["id"]
    second_student = await client.post(
        "/students/",
        json={"roll_number": "TEST002", "name": "Second Student"},
    )
    second_student_id = second_student.json()["id"]

    score = await client.post(
        "/scores/",
        json={
            "student_id": first_student_id,
            "course_outcome_id": outcome_id,
            "marks": 40,
        },
    )
    score_id = score.json()["id"]

    response = await client.patch(
        f"/courses/{course_id}",
        json={"name": "Updated Course"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Course"

    response = await client.put(
        f"/courses/{second_course_id}",
        json={"code": "TEST202", "name": "Renamed Course"},
    )
    assert response.status_code == 200
    assert response.json()["code"] == "TEST202"

    response = await client.patch(
        f"/course-outcomes/{outcome_id}",
        json={"description": "Updated outcome"},
    )
    assert response.status_code == 200
    assert response.json()["description"] == "Updated outcome"

    response = await client.put(
        f"/course-outcomes/{outcome_id}",
        json={
            "code": "C02",
            "description": "Moved outcome",
            "course_id": second_course_id,
        },
    )
    assert response.status_code == 200
    assert response.json()["course_id"] == second_course_id

    response = await client.patch(
        f"/students/{first_student_id}",
        json={"name": "Updated Student"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Student"

    response = await client.put(
        f"/students/{second_student_id}",
        json={"roll_number": "TEST202", "name": "Renamed Student"},
    )
    assert response.status_code == 200
    assert response.json()["roll_number"] == "TEST202"

    response = await client.patch(f"/scores/{score_id}", json={"marks": 80})
    assert response.status_code == 200
    assert response.json()["marks"] == 80

    response = await client.put(
        f"/scores/{score_id}",
        json={
            "marks": 90,
            "student_id": second_student_id,
            "course_outcome_id": outcome_id,
        },
    )
    assert response.status_code == 200
    assert response.json()["marks"] == 90
    assert response.json()["student_id"] == second_student_id

    duplicate_course = await client.patch(
        f"/courses/{course_id}",
        json={"code": "TEST202"},
    )
    assert duplicate_course.status_code == 409

    duplicate_student = await client.patch(
        f"/students/{first_student_id}",
        json={"roll_number": "TEST202"},
    )
    assert duplicate_student.status_code == 409

    empty_patch = await client.patch(f"/scores/{score_id}", json={})
    assert empty_patch.status_code == 400


@pytest.mark.asyncio
async def test_api_update_and_delete_missing_resources_return_404(client):
    for path, payload in (
        ("/courses/999", {"code": "MISSING", "name": "Missing"}),
        (
            "/course-outcomes/999",
            {"code": "C01", "description": "Missing", "course_id": 1},
        ),
        ("/students/999", {"roll_number": "MISSING", "name": "Missing"}),
        (
            "/scores/999",
            {"marks": 1, "student_id": 1, "course_outcome_id": 1},
        ),
    ):
        assert (await client.put(path, json=payload)).status_code == 404
        assert (await client.delete(path)).status_code == 404


@pytest.mark.asyncio
async def test_api_deletes_cascade_to_dependent_records(client):
    course_id, outcome_id = await create_test_course_and_co(client)
    student_response = await client.post(
        "/students/",
        json={"roll_number": "CASCADE001", "name": "Cascade Student"},
    )
    student_id = student_response.json()["id"]
    score_response = await client.post(
        "/scores/",
        json={
            "student_id": student_id,
            "course_outcome_id": outcome_id,
            "marks": 75,
        },
    )
    score_id = score_response.json()["id"]

    assert (await client.delete(f"/students/{student_id}")).status_code == 204
    assert (await client.get(f"/scores/{score_id}")).status_code == 404

    student_response = await client.post(
        "/students/",
        json={"roll_number": "CASCADE002", "name": "Cascade Student 2"},
    )
    student_id = student_response.json()["id"]
    score_response = await client.post(
        "/scores/",
        json={
            "student_id": student_id,
            "course_outcome_id": outcome_id,
            "marks": 85,
        },
    )
    score_id = score_response.json()["id"]

    assert (await client.delete(f"/course-outcomes/{outcome_id}")).status_code == 204
    assert (await client.get(f"/scores/{score_id}")).status_code == 404
    assert (await client.get(f"/course-outcomes/{outcome_id}")).status_code == 404
    assert (await client.delete(f"/courses/{course_id}")).status_code == 204
    assert (await client.get(f"/courses/{course_id}")).status_code == 404
