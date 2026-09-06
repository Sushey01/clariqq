"""Settings loaded from the repo-root .env file."""

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent

ENV_FILES = (
    REPO_ROOT / ".env",
    BACKEND_DIR / ".env",
    Path.cwd() / ".env",
)


def _strip_value(raw: str) -> str:
    value = raw.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
        value = value[1:-1]
    return value.strip()


def _apply_env_file(path: Path) -> bool:
    if not path.is_file():
        return False
    try:
        text = path.read_text(encoding="utf-8-sig")
    except OSError:
        return False
    load_dotenv(path, override=True)
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        if stripped.startswith("export "):
            stripped = stripped[len("export ") :]
        name, raw = stripped.split("=", 1)
        name = name.strip()
        if name:
            os.environ[name] = _strip_value(raw)
    return True


def reload_env() -> None:
    """Re-read .env so a key added after server start is picked up."""
    for path in ENV_FILES:
        _apply_env_file(path)

    global GROQ_API_KEY, GROQ_MODEL, LLM_PROVIDER, LLM_TEMPERATURE, LOCAL_GGUF_PATH
    global OLLAMA_BASE_URL, EMBED_MODEL, HF_REPO_ID, HF_FILENAME, HF_TOKEN
    global GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    os.environ.setdefault("OLLAMA_HOST", OLLAMA_BASE_URL)
    EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")
    HF_REPO_ID = os.getenv("HF_REPO_ID", "Susu11/clariq_socratic-GGUF")
    HF_FILENAME = os.getenv("HF_FILENAME", "model.gguf")
    HF_TOKEN = os.getenv("HUGGINGFACE_API_KEY") or os.getenv("HF_TOKEN") or ""
    if HF_TOKEN:
        os.environ["HF_TOKEN"] = HF_TOKEN
    LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.1"))
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "auto")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
    GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip() or os.getenv(
        "VITE_GOOGLE_CLIENT_ID", ""
    ).strip()
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
    JWT_SECRET = os.getenv("JWT_SECRET", "").strip() or os.getenv(
        "GOOGLE_CLIENT_SECRET", ""
    ).strip()
    raw_gguf = os.getenv("LOCAL_GGUF_PATH", "").strip()
    LOCAL_GGUF_PATH = Path(raw_gguf) if raw_gguf else REPO_ROOT / "models" / "socratic-phi3-q8_0.gguf"
    if not LOCAL_GGUF_PATH.is_absolute():
        LOCAL_GGUF_PATH = (REPO_ROOT / LOCAL_GGUF_PATH).resolve()


GROQ_API_KEY = ""
GROQ_MODEL = "openai/gpt-oss-20b"
LOCAL_GGUF_PATH = REPO_ROOT / "models" / "socratic-phi3-q8_0.gguf"
LLM_PROVIDER = "auto"
LLM_TEMPERATURE = 0.1
OLLAMA_BASE_URL = "http://localhost:11434"
EMBED_MODEL = "nomic-embed-text"
HF_REPO_ID = "Susu11/clariq_socratic-GGUF"
HF_FILENAME = "model.gguf"
HF_TOKEN = ""
GOOGLE_CLIENT_ID = ""
GOOGLE_CLIENT_SECRET = ""
JWT_SECRET = ""
JWT_EXPIRE_HOURS = 24 * 7

reload_env()

CHROMA_DIR = Path(os.getenv("CHROMA_DIR", BACKEND_DIR / "storage" / "chroma_db"))
RETRIEVE_K = int(os.getenv("RETRIEVE_K", "3"))

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
SESSION_TTL_SECONDS = int(os.getenv("SESSION_TTL_SECONDS", "3600"))
