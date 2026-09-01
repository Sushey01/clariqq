"""HTTP routes. This is the only file the frontend talks to."""

import os

from fastapi import APIRouter, HTTPException

from app.config import reload_env
from app.pipelines.rag import get_tutor, tutor_error
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()


@router.get("/health")
def health():
    reload_env()
    return {
        "status": "ok",
        "groq_configured": bool(os.getenv("GROQ_API_KEY", "").strip()),
        "detail": None,
    }


@router.post("/api/chat", response_model=ChatResponse)
def chat(body: ChatRequest):
    tutor = get_tutor()
    if tutor is None:
        raise HTTPException(status_code=503, detail=tutor_error())

    try:
        answer = tutor.ask(
            question=body.question,
            session_id=body.session_id,
            mode=body.socratic_mode,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(answer=answer, session_id=body.session_id)
