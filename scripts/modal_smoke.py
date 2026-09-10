"""One-shot Modal vLLM smoke test. Does not load local GGUF.

    python scripts/modal_smoke.py

Writes eval_results/modal_smoke.json. Skips live HTTP if MODAL_BASE_URL is unset.
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = REPO_ROOT / "eval_results" / "modal_smoke.json"


def _base_url() -> str:
    load_dotenv(REPO_ROOT / ".env")
    load_dotenv(REPO_ROOT / "backend" / ".env")
    return os.getenv("MODAL_BASE_URL", "").strip().rstrip("/")


def _origin(base: str) -> str:
    if base.endswith("/v1"):
        return base[: -len("/v1")]
    return base


def _completions_url(base: str) -> str:
    if base.endswith("/chat/completions"):
        return base
    if base.endswith("/v1"):
        return f"{base}/chat/completions"
    return f"{base}/v1/chat/completions"


def main() -> int:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    base = _base_url()
    payload = {
        "ok": False,
        "skipped": False,
        "health_status": None,
        "chat_status": None,
        "reply": None,
        "elapsed_s": None,
        "error": None,
        "base_url": base or None,
    }
    if not base:
        payload["skipped"] = True
        payload["error"] = (
            "MODAL_BASE_URL is empty. Deploy modal/serve_socratic.py, then set "
            "LLM_PROVIDER=modal and MODAL_BASE_URL in .env."
        )
        OUT_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(json.dumps(payload, indent=2))
        return 0

    key = os.getenv("MODAL_API_KEY", "").strip() or "clariq-modal"
    model = os.getenv("MODAL_MODEL", "socratic-phi3").strip() or "socratic-phi3"
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }
    t0 = time.time()
    try:
        health = httpx.get(f"{_origin(base)}/health", timeout=180.0)
        payload["health_status"] = health.status_code
        chat = httpx.post(
            _completions_url(base),
            headers=headers,
            json={
                "model": model,
                "temperature": 0.1,
                "max_tokens": 32,
                "messages": [
                    {
                        "role": "user",
                        "content": "Reply with one short Socratic question about motion.",
                    }
                ],
            },
            timeout=180.0,
        )
        payload["chat_status"] = chat.status_code
        payload["elapsed_s"] = round(time.time() - t0, 2)
        if chat.status_code >= 400:
            payload["error"] = chat.text[:400]
        else:
            message = chat.json()["choices"][0]["message"]
            payload["reply"] = (message.get("content") or "").strip()
            payload["ok"] = bool(payload["reply"]) and health.status_code == 200
    except Exception as exc:
        payload["elapsed_s"] = round(time.time() - t0, 2)
        payload["error"] = str(exc)

    OUT_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload, indent=2))
    return 0 if payload["ok"] or payload["skipped"] else 1


if __name__ == "__main__":
    sys.exit(main())
