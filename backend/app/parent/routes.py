"""Parent desk: linked child and weekly report."""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.auth.jwt_tokens import require_role
from app.reports.weekly import build_weekly_report
from app.schemas.progress import WeeklyReportOut
from app.storage.parent_students import is_linked, list_children

router = APIRouter()


@router.get("/api/parent/child")
def parent_child(user: dict = Depends(require_role("parent"))):
    children = list_children(user["id"])
    if not children:
        raise HTTPException(status_code=404, detail="No linked child.")
    return children[0]


@router.get("/api/parent/child/weekly", response_model=WeeklyReportOut)
def parent_child_weekly(
    user: dict = Depends(require_role("parent")),
    window_days: int = Query(default=7, ge=1, le=90),
):
    children = list_children(user["id"])
    if not children:
        raise HTTPException(status_code=404, detail="No linked child.")
    child_id = children[0]["id"]
    if not is_linked(user["id"], child_id):
        raise HTTPException(status_code=403, detail="That student is not linked to this parent.")
    return build_weekly_report(child_id, window_days)
