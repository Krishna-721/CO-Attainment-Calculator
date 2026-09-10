import pytest

from app.services.attainment import calculate_attainment


def test_mixed_scores():
    scores = [80, 60, 10, 50]

    meeting, percentage = calculate_attainment(
        scores,
        threshold=50,
    )

    assert meeting == 3
    assert percentage == 75.0


def test_everyone_meets_threshold():
    scores = [50, 55, 70, 100]

    meeting, percentage = calculate_attainment(
        scores,
        threshold=50,
    )

    assert meeting == 4
    assert percentage == 100.0


def test_nobody_meets_threshold():
    scores = [10, 20, 30, 49]

    meeting, percentage = calculate_attainment(
        scores,
        threshold=50,
    )

    assert meeting == 0
    assert percentage == 0.0


def test_exact_threshold_counts():
    scores = [50, 50, 49, 51, 20]

    meeting, percentage = calculate_attainment(
        scores,
        threshold=50,
    )

    assert meeting == 3
    assert percentage == 60.0


def test_random_scores():
    scores = [73, 12, 88, 47, 50, 91, 3, 64, 39, 76]

    meeting, percentage = calculate_attainment(
        scores,
        threshold=50,
    )

    assert meeting == 6
    assert percentage == 60.0
