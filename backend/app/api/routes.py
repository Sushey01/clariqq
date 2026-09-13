"""HTTP routes. This is the only file the frontend talks to."""

from fastapi import APIRouter, Depends, HTTPException

from app.auth.jwt_tokens import get_optional_user
from app.config import reload_env
from app.pipelines.rag import get_tutor, tutor_error
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()


@router.get("/health")
def health():
    reload_env()
    from app import config

    return {
        "status": "ok",
        "llm_provider": config.LLM_PROVIDER,
        "groq_configured": bool(config.GROQ_API_KEY),
        "modal_configured": bool(config.MODAL_BASE_URL),
        "hf_space_configured": bool(config.HF_SPACE_ID),
        "detail": None,
    }


@router.post("/api/chat", response_model=ChatResponse)
def chat(body: ChatRequest, user: dict | None = Depends(get_optional_user)):
    tutor = get_tutor()
    if tutor is None:
        raise HTTPException(status_code=503, detail=tutor_error())

    try:
        answer = tutor.ask(
            question=body.question,
            session_id=body.session_id,
            mode=body.socratic_mode,
            user_id=user["id"] if user else None,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(answer=answer, session_id=body.session_id)
