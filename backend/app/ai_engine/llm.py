"""Chat model factory: HF Space, local GGUF, Modal, or Groq."""

from huggingface_hub import hf_hub_download
from langchain_community.chat_models import ChatLlamaCpp

from app.config import ENV_FILES, REPO_ROOT, reload_env

_model = None
_model_key = None


def _local_model_path(config) -> str:
    path = config.LOCAL_GGUF_PATH
    if path.is_file():
        return str(path)
    return hf_hub_download(repo_id=config.HF_REPO_ID, filename=config.HF_FILENAME)


def get_llm():
    global _model, _model_key
    reload_env()
    from app import config
    from app.ai_engine.groq_chat import GroqChat, OpenAICompatChat
    from app.ai_engine.hf_space_chat import HfSpaceChat

    key = (
        config.LLM_PROVIDER,
        config.HF_SPACE_ID,
        config.MODAL_BASE_URL,
        bool(config.HF_TOKEN),
        len(config.HF_TOKEN),
    )
    if _model is not None and _model_key == key:
        return _model

    if config.LLM_PROVIDER in {"hf_space", "huggingface"}:
        _model = HfSpaceChat(
            space_id=config.HF_SPACE_ID,
            token=config.HF_TOKEN,
            timeout=300.0,
        )
        _model_key = key
        return _model

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
        _model_key = key
        return _model

    if config.LLM_PROVIDER == "modal":
        if not config.MODAL_BASE_URL:
            searched = ", ".join(str(path) for path in ENV_FILES)
            raise RuntimeError(
                "MODAL_BASE_URL is empty. Deploy modal/serve_socratic.py, then put "
                "MODAL_BASE_URL=https://...modal.run/v1 in "
                f"{REPO_ROOT / '.env'} (searched: {searched}) and restart uvicorn."
            )
        _model = OpenAICompatChat(
            api_key=config.MODAL_API_KEY or "clariq-modal",
            model=config.MODAL_MODEL,
            base_url=config.MODAL_BASE_URL,
            temperature=config.LLM_TEMPERATURE,
            max_tokens=128,
            timeout=600.0,
            provider_name="modal",
            retry_transient=True,
            stop_sequences=[
                "<|end|>",
                "<|endoftext|>",
                "<|user|>",
                "<|system|>",
                "<|assistant|>",
            ],
        )
        _model_key = key
        return _model

    if not config.GROQ_API_KEY:
        searched = ", ".join(str(path) for path in ENV_FILES)
        raise RuntimeError(
            "GROQ_API_KEY is empty. Put GROQ_API_KEY=gsk_... in "
            f"{REPO_ROOT / '.env'} (searched: {searched}) then restart uvicorn."
        )
    _model = GroqChat(
        api_key=config.GROQ_API_KEY,
        model=config.GROQ_MODEL,
        temperature=config.LLM_TEMPERATURE,
    )
    _model_key = key
    return _model
