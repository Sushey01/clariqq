"""Inspect the SEE knowledge graph and a student's mastery.

Does not change Socratic chat. Open these in the browser or Swagger:

- GET /api/knowledge/catalog  (no login) — 135 nodes + edges
- GET /api/progress           (JWT) — nodes this student has touched
- GET /api/progress/graph     (JWT) — full graph with m on each node
- GET /api/reports/weekly     (JWT) — last 7 days, own user

Demo export (FYP supervisor): same weekly URL with
Authorization: Bearer <student JWT>  or
X-Report-Export: <REPORT_EXPORT_SECRET> and ?user_id=<id>
"""

from __future__ import annotations

import os

from fastapi import APIRouter, Depends, Header, HTTPException, Query

from app.auth.jwt_tokens import get_current_user, get_optional_user
from app.knowledge.graph import counts, edges, node_by_id, nodes
from app.schemas.progress import (
    ConceptOut,
    GraphEdgeOut,
    GraphNodeOut,
    GraphOut,
    MasteryOut,
    WeeklyReportOut,
)
from app.storage.mastery import events_since, list_mastery

router = APIRouter()


def _mastery_out(row: dict) -> MasteryOut:
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


@router.get("/api/knowledge/catalog")
def catalog():
    graph_nodes = [ConceptOut(**item) for item in nodes()]
    return {
        "counts": counts(),
        "nodes": graph_nodes,
        "edges": edges(),
    }


@router.get("/api/progress", response_model=list[MasteryOut])
def progress(user: dict = Depends(get_current_user)):
    return [_mastery_out(row) for row in list_mastery(user["id"])]


@router.get("/api/progress/graph", response_model=GraphOut)
def progress_graph(user: dict = Depends(get_current_user)):
    by_id = {row["concept_id"]: row for row in list_mastery(user["id"])}
    graph_nodes = []
    for item in nodes():
        row = by_id.get(item["id"])
        graph_nodes.append(
            GraphNodeOut(
                id=item["id"],
                subject=item["subject"],
                name=item["name"],
                chapter=item["chapter"],
                m=float(row["m"]) if row else 0.5,
                confused=bool(row["confused"]) if row else False,
                seen=row is not None,
            )
        )
    graph_edges = [
        GraphEdgeOut(source=edge["from"], target=edge["to"]) for edge in edges()
    ]
    return GraphOut(counts=counts(), nodes=graph_nodes, edges=graph_edges)


@router.get("/api/reports/weekly", response_model=WeeklyReportOut)
def weekly_report(
    user: dict | None = Depends(get_optional_user),
    user_id: str | None = Query(default=None),
    x_report_export: str | None = Header(default=None, alias="X-Report-Export"),
    window_days: int = Query(default=7, ge=1, le=90),
):
    secret = os.getenv("REPORT_EXPORT_SECRET", "").strip()
    target = None
    if user:
        target = user["id"]
    if user_id and secret and x_report_export == secret:
        target = user_id
    if not target:
        raise HTTPException(
            status_code=401,
            detail="Sign in, or pass X-Report-Export plus user_id for a demo export.",
        )

    rows = list_mastery(target)
    events = events_since(target, days=window_days)
    mean_st = None
    if events:
        mean_st = sum(float(item["st"]) for item in events) / len(events)

    weakest = sorted(rows, key=lambda item: float(item["m"]))[:10]
    confused = [item for item in rows if item["confused"]]
    return WeeklyReportOut(
        user_id=target,
        window_days=window_days,
        event_count=len(events),
        mean_st=mean_st,
        weakest=[_mastery_out(item) for item in weakest],
        confused=[_mastery_out(item) for item in confused],
    )
