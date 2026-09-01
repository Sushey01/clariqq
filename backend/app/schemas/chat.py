from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)
    session_id: str = "default_session"
    socratic_mode: str = "strict"


class ChatResponse(BaseModel):
    answer: str
    session_id: str
