"""Teacher desk: linked students and their weekly reports."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth.jwt_tokens import require_role
from app.reports.weekly import build_weekly_report
from app.schemas.progress import WeeklyReportOut
from app.storage.teacher_students import is_linked, list_students

router = APIRouter()


@router.get("/api/teacher/students")
def teacher_students(user: dict = Depends(require_role("teacher"))):
    return list_students(user["id"])


@router.get("/api/teacher/students/{student_id}/weekly", response_model=WeeklyReportOut)
def teacher_student_weekly(
    student_id: str,
    user: dict = Depends(require_role("teacher")),
    window_days: int = Query(default=7, ge=1, le=90),
):
    if not is_linked(user["id"], student_id):
        raise HTTPException(
            status_code=403,
            detail="That student is not linked to this teacher.",
        )
    return build_weekly_report(student_id, window_days)
