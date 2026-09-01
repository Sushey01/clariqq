"""Chat model factory: Groq API by default, local GGUF when LLM_PROVIDER=local."""

from huggingface_hub import hf_hub_download
from langchain_community.chat_models import ChatLlamaCpp

from app.ai_engine.groq_chat import GroqChat
from app.config import (
    GROQ_API_KEY,
    GROQ_MODEL,
    HF_FILENAME,
    HF_REPO_ID,
    LLM_PROVIDER,
    LLM_TEMPERATURE,
)

_model = None


def get_llm():
    global _model
    if _model is not None:
        return _model

    provider = LLM_PROVIDER
    if provider == "auto":
        provider = "groq" if GROQ_API_KEY else "local"

    if provider == "groq":
        if not GROQ_API_KEY:
            raise RuntimeError(
                "GROQ_API_KEY is empty. Add a free key from https://console.groq.com/keys"
            )
        _model = GroqChat(
            api_key=GROQ_API_KEY,
            model=GROQ_MODEL,
            temperature=LLM_TEMPERATURE,
        )
        return _model

    path = hf_hub_download(repo_id=HF_REPO_ID, filename=HF_FILENAME)
    _model = ChatLlamaCpp(
        model_path=path,
        temperature=LLM_TEMPERATURE,
        n_ctx=2048,
        max_tokens=512,
    )
    return _model
