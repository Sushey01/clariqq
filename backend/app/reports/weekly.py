"""Shared weekly mastery report for student, teacher, and parent desks."""

from app.knowledge.graph import node_by_id
from app.schemas.progress import MasteryOut, WeeklyReportOut
from app.storage.mastery import events_since, list_mastery


def mastery_out(row: dict) -> MasteryOut:
    concept = node_by_id().get(row["concept_id"], {})
    return MasteryOut(
        concept_id=row["concept_id"],
        name=concept.get("name") or row["concept_id"],
        subject=concept.get("subject") or "",
        chapter=concept.get("chapter") or "",
        m=float(row["m"]),
        confused=bool(row["confused"]),
        low_streak=int(row["low_streak"]),
        updated_at=row.get("updated_at"),
    )


def build_weekly_report(user_id: str, window_days: int = 7) -> WeeklyReportOut:
    rows = list_mastery(user_id)
    events = events_since(user_id, days=window_days)
    mean_st = None
    if events:
        mean_st = sum(float(item["st"]) for item in events) / len(events)
    weakest = sorted(rows, key=lambda item: float(item["m"]))[:10]
    confused = [item for item in rows if item["confused"]]
    return WeeklyReportOut(
        user_id=str(user_id),
        window_days=window_days,
        event_count=len(events),
        mean_st=mean_st,
        weakest=[mastery_out(item) for item in weakest],
        confused=[mastery_out(item) for item in confused],
    )
