"""Smoke-test the Qwen ZeroGPU Space. No GGUF required.

    python scripts/hf_space_smoke.py

Writes eval_results/hf_space_smoke.json.
Prefer /chat (fixed Space app). Fall back to /user_message + /bot_response.
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = REPO_ROOT / "eval_results" / "hf_space_smoke.json"
DEFAULT_SPACE = "Susu11/socratic"
PROMPT = "What is photosynthesis?"


def _token() -> str:
    load_dotenv(REPO_ROOT / ".env")
    load_dotenv(REPO_ROOT / "backend" / ".env")
    return (
        os.getenv("HUGGINGFACE_API_KEY", "").strip()
        or os.getenv("HF_TOKEN", "").strip()
    )


def _assistant_text(history) -> str | None:
    if not history:
        return None
    last = history[-1]
    if isinstance(last, dict):
        content = last.get("content")
        if isinstance(content, list):
            parts = []
            for item in content:
                if isinstance(item, dict) and item.get("type") == "text":
                    parts.append(str(item.get("text") or ""))
                elif isinstance(item, dict) and "text" in item:
                    parts.append(str(item.get("text") or ""))
            return "".join(parts).strip() or None
        return str(content or "").strip() or None
    if isinstance(last, (list, tuple)) and len(last) >= 2:
        return str(last[1] or "").strip() or None
    return str(last).strip() or None


def main() -> int:
    from gradio_client import Client

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    space = os.getenv("HF_SPACE_ID", DEFAULT_SPACE).strip() or DEFAULT_SPACE
    token = _token() or None
    payload = {
        "ok": False,
        "space": space,
        "endpoint": None,
        "reply": None,
        "elapsed_s": None,
        "error": None,
        "endpoints": [],
    }
    t0 = time.time()
    try:
        client = Client(space, token=token, httpx_kwargs={"timeout": 300.0})
        info = client.view_api(print_info=False, return_format="dict") or {}
        endpoints = sorted((info.get("named_endpoints") or {}).keys())
        payload["endpoints"] = endpoints

        if "/chat" in endpoints:
            payload["endpoint"] = "/chat"
            reply = client.predict(PROMPT, [], api_name="/chat")
            payload["reply"] = str(reply or "").strip() or None
        else:
            payload["endpoint"] = "/user_message+/bot_response"
            _, history = client.predict(PROMPT, [], api_name="/user_message")
            history = client.predict(history, api_name="/bot_response")
            payload["reply"] = _assistant_text(history)

        payload["ok"] = bool(payload["reply"]) and payload["reply"] != "Thinking..."
    except Exception as exc:
        payload["error"] = f"{type(exc).__name__}: {exc}"

    payload["elapsed_s"] = round(time.time() - t0, 2)
    OUT_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload, indent=2))
    return 0 if payload["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
