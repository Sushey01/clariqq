"""Local GGUF model via llama.cpp."""

from huggingface_hub import hf_hub_download
from langchain_community.chat_models import ChatLlamaCpp

from app.config import HF_FILENAME, HF_REPO_ID, LLM_TEMPERATURE

_model = None


def get_llm():
    global _model
    if _model is None:
        path = hf_hub_download(repo_id=HF_REPO_ID, filename=HF_FILENAME)
        _model = ChatLlamaCpp(
            model_path=path,
            temperature=LLM_TEMPERATURE,
            n_ctx=2048,
            max_tokens=512,
        )
    return _model
