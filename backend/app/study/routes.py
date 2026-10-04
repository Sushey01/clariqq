"""Objective 5: Controlled Crossover Study API Routes.

Allows participants to take the pre-test, complete Condition A (Clariq) or
Condition B (Textbook), take the post-test, and record their SUS score.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.config import BACKEND_DIR
from app.study.data import STUDY_TOPICS, SUS_QUESTIONS

router = APIRouter()
SESSIONS_FILE = Path(BACKEND_DIR) / "eval" / "study_sessions.json"


def _load_sessions() -> list[dict]:
    if not SESSIONS_FILE.exists():
        return []
    try:
        return json.loads(SESSIONS_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def _save_sessions(sessions: list[dict]) -> None:
    SESSIONS_FILE.parent.mkdir(parents=True, exist_ok=True)
    SESSIONS_FILE.write_text(json.dumps(sessions, indent=2), encoding="utf-8")


class StudySubmission(BaseModel):
    participant_id: str = Field(..., description="Unique participant code, e.g., P01, P02")
    topic_id: str = Field("acids_bases")
    condition: str = Field(..., description="'clariq' (Condition A) or 'textbook' (Condition B)")
    pre_test_answers: list[int]
    post_test_answers: list[int]
    learning_seconds: float = Field(..., description="Active learning duration in seconds")
    sus_scores: list[int] = Field(default_factory=list, description="10 SUS ratings (1-5)")
    feedback: str = Field(default="")


@router.get("/api/study/topics")
def get_study_topics():
    return [
        {
            "id": t["id"],
            "title": t["title"],
            "subject": t["subject"],
            "grade": t["grade"],
            "learning_objectives": t["learning_objectives"],
        }
        for t in STUDY_TOPICS.values()
    ]


@router.get("/api/study/topic/{topic_id}")
def get_study_topic(topic_id: str):
    if topic_id not in STUDY_TOPICS:
        raise HTTPException(status_code=404, detail="Study topic not found.")
    topic = STUDY_TOPICS[topic_id]
    # Return questions with sanitized answer keys for test-taking
    pre_questions = [
        {"id": q["id"], "question": q["question"], "options": q["options"]}
        for q in topic["pre_test"]
    ]
    post_questions = [
        {"id": q["id"], "question": q["question"], "options": q["options"]}
        for q in topic["post_test"]
    ]
    return {
        "id": topic["id"],
        "title": topic["title"],
        "subject": topic["subject"],
        "grade": topic["grade"],
        "learning_objectives": topic["learning_objectives"],
        "cdc_textbook_content": topic["cdc_textbook_content"],
        "pre_test": pre_questions,
        "post_test": post_questions,
        "sus_questions": SUS_QUESTIONS,
    }


@router.post("/api/study/submit")
def submit_study_session(submission: StudySubmission):
    topic = STUDY_TOPICS.get(submission.topic_id)
    if not topic:
        raise HTTPException(status_code=400, detail="Invalid topic_id.")

    # Calculate pre-test score
    pre_correct = 0
    for idx, ans in enumerate(submission.pre_test_answers):
        if idx < len(topic["pre_test"]) and ans == topic["pre_test"][idx]["answer_idx"]:
            pre_correct += 1

    # Calculate post-test score
    post_correct = 0
    for idx, ans in enumerate(submission.post_test_answers):
        if idx < len(topic["post_test"]) and ans == topic["post_test"][idx]["answer_idx"]:
            post_correct += 1

    # Calculate SUS score (Standard formula 0-100)
    sus_final = None
    if len(submission.sus_scores) == 10:
        sus_sum = 0
        for i, val in enumerate(submission.sus_scores):
            # 1-indexed odd: score - 1; even: 5 - score
            if i % 2 == 0:
                sus_sum += max(0, min(4, val - 1))
            else:
                sus_sum += max(0, min(4, 5 - val))
        sus_final = round(sus_sum * 2.5, 1)

    record = {
        "participant_id": submission.participant_id,
        "topic_id": submission.topic_id,
        "condition": submission.condition,
        "pre_test_score": pre_correct,
        "pre_test_max": len(topic["pre_test"]),
        "post_test_score": post_correct,
        "post_test_max": len(topic["post_test"]),
        "retention_gain": post_correct - pre_correct,
        "learning_seconds": round(submission.learning_seconds, 1),
        "learning_minutes": round(submission.learning_seconds / 60.0, 2),
        "sus_score": sus_final,
        "feedback": submission.feedback,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }

    sessions = _load_sessions()
    sessions.append(record)
    _save_sessions(sessions)

    return {
        "status": "success",
        "result": record,
        "total_sessions_collected": len(sessions),
    }


@router.get("/api/study/sessions")
def list_study_sessions():
    sessions = _load_sessions()
    return {
        "count": len(sessions),
        "sessions": sessions,
    }
