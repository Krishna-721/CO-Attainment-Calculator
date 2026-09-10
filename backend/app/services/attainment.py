def calculate_attainment(
    scores: list[float],
    threshold: float,
) -> tuple[int, float]:
    """
    Calculate the number and percentage of students
    who scored at or above the given threshold.

    A score exactly equal to the threshold counts
    as having met the threshold.
    """

    if not scores:
        return 0, 0.0

    students_meeting_threshold = sum(score >= threshold for score in scores)

    attainment_percentage = (students_meeting_threshold / len(scores)) * 100

    return students_meeting_threshold, attainment_percentage
