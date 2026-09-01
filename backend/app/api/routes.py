"""HTTP routes. This is the only file the frontend talks to."""

from fastapi import APIRouter, HTTPException

from app.pipelines.rag import get_tutor, tutor_error
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()


@router.get("/health")
def health():
    error = tutor_error()
    return {
        "status": "ok" if error is None else "not_ready",
        "detail": error,
    }


@router.post("/api/chat", response_model=ChatResponse)
def chat(body: ChatRequest):
    tutor = get_tutor()
    if tutor is None:
        raise HTTPException(status_code=503, detail=tutor_error())

    answer = tutor.ask(
        question=body.question,
        session_id=body.session_id,
        mode=body.socratic_mode,
    )
    return ChatResponse(answer=answer, session_id=body.session_id)
