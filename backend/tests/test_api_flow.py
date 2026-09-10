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
