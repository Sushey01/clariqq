"""HTTP routes. This is the only file the frontend talks to."""

import logging

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.auth.jwt_tokens import get_optional_user
from app.config import reload_env
from app.knowledge.record import record_student_turn
from app.pipelines.rag import get_tutor, tutor_error
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()
logger = logging.getLogger(__name__)


def _background_record_turn(user_id: str, question: str) -> None:
    try:
        record_student_turn(user_id=user_id, question=question)
    except Exception:
        logger.exception("knowledge: scoring skipped in background; chat reply was returned")


@router.get("/health")
def health():
    reload_env()
    from app import config

    return {
        "status": "ok",
        "llm_provider": config.LLM_PROVIDER,
        "runpod_configured": bool(getattr(config, "RUNPOD_BASE_URL", "") or config.MODAL_BASE_URL),
        "runpod_model": getattr(config, "RUNPOD_MODEL", "") or config.MODAL_MODEL,
        "groq_configured": bool(config.GROQ_API_KEY),
        "modal_configured": bool(config.MODAL_BASE_URL),
        "hf_space_configured": bool(config.HF_SPACE_ID),
        "detail": None,
    }


@router.post("/api/chat", response_model=ChatResponse)
def chat(
    body: ChatRequest,
    background_tasks: BackgroundTasks,
    user: dict | None = Depends(get_optional_user),
):
    tutor = get_tutor()
    if tutor is None:
        err = tutor_error() or "Tutor service is currently unavailable."
        raise HTTPException(status_code=503, detail=err)

    # Tenant-isolate session history by user_id to prevent cross-user history leakage / BOLA
    scoped_session_id = f"user_{user['id']}_{body.session_id}" if user else f"guest_{body.session_id}"

    try:
        answer = tutor.ask(
            question=body.question,
            session_id=scoped_session_id,
            mode=body.socratic_mode,
            user_id=user["id"] if user else None,
        )
    except Exception as exc:
        logger.exception("Error processing chat request for session %s", body.session_id)
        raise HTTPException(
            status_code=502,
            detail="Tutor inference failed. Please check service connectivity and try again.",
        ) from exc

    if user:
        # Offload heavy embedding retrieval and knowledge scoring to background task
        background_tasks.add_task(
            _background_record_turn,
            user_id=user["id"],
            question=body.question,
        )

    return ChatResponse(answer=answer, session_id=body.session_id)
