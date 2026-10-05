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

    if config.LLM_PROVIDER in {"modal", "runpod", "serverless"}:
        base_url = getattr(config, "RUNPOD_BASE_URL", "") or config.MODAL_BASE_URL
        if not base_url:
            searched = ", ".join(str(path) for path in ENV_FILES)
            raise RuntimeError(
                "RUNPOD_BASE_URL / MODAL_BASE_URL is empty. Set "
                "RUNPOD_BASE_URL=https://api.runpod.ai/v2/.../openai/v1 in "
                f"{REPO_ROOT / '.env'} (searched: {searched}) and restart uvicorn."
            )
        api_key = getattr(config, "RUNPOD_API_KEY", "") or config.MODAL_API_KEY or "clariq-runpod"
        model_name = getattr(config, "RUNPOD_MODEL", "") or config.MODAL_MODEL or "Susu11/socratic_qwen7b-merged"
        # Match the Hugging Face Space sampler (temperature 0.7, top-p 0.8,
        # 512 tokens, repetition penalty 1.15).
        _model = OpenAICompatChat(
            api_key=api_key,
            model=model_name,
            base_url=base_url,
            temperature=0.7,
            top_p=0.8,
            repetition_penalty=1.15,
            max_tokens=512,
            timeout=600.0,
            provider_name="runpod" if "runpod" in base_url.lower() else "modal",
            retry_transient=True,
            stop_sequences=[
                "<|im_end|>",
                "<|im_start|>",
                "\nuser",
                "\nStudent",
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
