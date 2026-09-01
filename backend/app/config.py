"""Settings loaded from the repo-root .env file."""

import os
from pathlib import Path

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent

load_dotenv(REPO_ROOT / ".env")

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
os.environ.setdefault("OLLAMA_HOST", OLLAMA_BASE_URL)
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")

HF_REPO_ID = os.getenv("HF_REPO_ID", "Susu11/clariq_socratic-GGUF")
HF_FILENAME = os.getenv("HF_FILENAME", "model.gguf")
HF_TOKEN = os.getenv("HUGGINGFACE_API_KEY") or os.getenv("HF_TOKEN") or ""
if HF_TOKEN:
    os.environ["HF_TOKEN"] = HF_TOKEN
LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.1"))

CHROMA_DIR = Path(os.getenv("CHROMA_DIR", BACKEND_DIR / "storage" / "chroma_db"))
RETRIEVE_K = int(os.getenv("RETRIEVE_K", "3"))

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
SESSION_TTL_SECONDS = int(os.getenv("SESSION_TTL_SECONDS", "3600"))
