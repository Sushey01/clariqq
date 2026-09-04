"""Chat model factory: local GGUF when LLM_PROVIDER=local, otherwise Groq."""

from huggingface_hub import hf_hub_download
from langchain_community.chat_models import ChatLlamaCpp

from app.config import ENV_FILES, REPO_ROOT, reload_env

_model = None


def _local_model_path(config) -> str:
    path = config.LOCAL_GGUF_PATH
    if path.is_file():
        return str(path)
    return hf_hub_download(repo_id=config.HF_REPO_ID, filename=config.HF_FILENAME)


def get_llm():
    global _model
    if _model is not None:
        return _model

    reload_env()
    from app import config

    if config.LLM_PROVIDER == "local":
        model_path = _local_model_path(config)
        _model = ChatLlamaCpp(
            model_path=model_path,
            temperature=config.LLM_TEMPERATURE,
            n_ctx=2048,
            n_batch=256,
            n_threads=4,
            max_tokens=128,
            streaming=False,
            verbose=False,
            stop=["<|end|>", "<|endoftext|>", "<|user|>"],
        )
        return _model

    if not config.GROQ_API_KEY:
        searched = ", ".join(str(path) for path in ENV_FILES)
        raise RuntimeError(
            "GROQ_API_KEY is empty. Put GROQ_API_KEY=gsk_... in "
            f"{REPO_ROOT / '.env'} (searched: {searched}) then restart uvicorn."
        )
    from app.ai_engine.groq_chat import GroqChat

    _model = GroqChat(
        api_key=config.GROQ_API_KEY,
        model=config.GROQ_MODEL,
        temperature=config.LLM_TEMPERATURE,
    )
    return _model
