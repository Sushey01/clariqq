"""Serve Clariq GGUF on a Modal GPU via llama.cpp (OpenAI-compatible).

vLLM cannot load Susu11/socratic-phi3 (private / no HF config.json).
This serves the public GGUF instead: Susu11/clariq_socratic-GGUF.

llama-cpp-python 0.3.3–0.3.4 bundled server raises
"'coroutine' object is not callable" on /v1/chat/completions, so this
wraps Llama.create_completion in FastAPI instead.

    modal deploy modal/serve_socratic.py
    modal app stop clariq-socratic
"""

import os
import re

import modal

MINUTES = 60
HF_REPO = "Susu11/clariq_socratic-GGUF"
HF_FILE = "model.gguf"
SERVED_NAME = "socratic-phi3"

image = (
    modal.Image.from_registry("nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.11")
    .entrypoint([])
    .run_commands(
        "pip install huggingface_hub fastapi "
        "'llama-cpp-python==0.3.4' "
        "--extra-index-url https://abetlen.github.io/llama-cpp-python/whl/cu124"
    )
)

gguf_vol = modal.Volume.from_name("clariq-gguf-cache", create_if_missing=True)

app = modal.App("clariq-socratic")
_secrets = [modal.Secret.from_dict({"CLARIQ_MODAL_KEY": "clariq-modal"})]


@app.function(
    image=image,
    gpu="T4",
    timeout=15 * MINUTES,
    scaledown_window=15 * MINUTES,
    min_containers=1,
    secrets=_secrets,
    volumes={"/root/.cache/huggingface": gguf_vol},
)
@modal.concurrent(max_inputs=1)
@modal.asgi_app()
def serve():
    from fastapi import FastAPI, Header, HTTPException
    from huggingface_hub import hf_hub_download
    from llama_cpp import Llama
    from pydantic import BaseModel

    expected_key = os.environ.get("CLARIQ_MODAL_KEY") or "clariq-modal"
    model_path = hf_hub_download(repo_id=HF_REPO, filename=HF_FILE)
    # 0.3.4 CUDA wheels have no built-in "phi-3" chat_format; prompt Phi-3 by hand.
    llm = Llama(
        model_path=model_path,
        n_gpu_layers=-1,
        n_ctx=2048,
        verbose=False,
    )

    phi3_stops = [
        "<|end|>",
        "<|endoftext|>",
        "<|user|>",
        "<|system|>",
        "<|assistant|>",
    ]
    _special_re = re.compile(r"\|?<\|[^|>]+?\|>")

    def _strip_specials(text: str) -> str:
        cleaned = _special_re.sub("", text or "")
        return cleaned.rstrip("|").strip()

    def _phi3_prompt(messages: list[dict]) -> str:
        parts: list[str] = []
        for message in messages:
            role = message["role"]
            if role == "system":
                tag = "system"
            elif role == "assistant":
                tag = "assistant"
            else:
                tag = "user"
            parts.append(f"<|{tag}|>\n{message['content']}<|end|>\n")
        parts.append("<|assistant|>\n")
        return "".join(parts)

    web = FastAPI()

    class ChatBody(BaseModel):
        messages: list
        model: str | None = None
        max_tokens: int = 256
        temperature: float = 0.1
        stop: list[str] | None = None
        stream: bool = False

    def _require_key(authorization: str | None) -> None:
        if not authorization:
            raise HTTPException(status_code=401, detail="Missing Authorization")
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or token != expected_key:
            raise HTTPException(status_code=401, detail="Invalid API key")

    @web.get("/v1/models")
    def models(authorization: str | None = Header(default=None)):
        _require_key(authorization)
        return {
            "object": "list",
            "data": [{"id": SERVED_NAME, "object": "model"}],
        }

    @web.post("/v1/chat/completions")
    def chat(
        body: ChatBody,
        authorization: str | None = Header(default=None),
    ):
        _require_key(authorization)
        if body.stream:
            raise HTTPException(status_code=400, detail="stream is not supported")
        try:
            rows = []
            for item in body.messages:
                if isinstance(item, dict):
                    rows.append(
                        {
                            "role": str(item.get("role") or "user"),
                            "content": str(item.get("content") or ""),
                        }
                    )
                else:
                    rows.append(
                        {
                            "role": str(getattr(item, "role", "user")),
                            "content": str(getattr(item, "content", "")),
                        }
                    )
            last_user = next(
                (row["content"] for row in reversed(rows) if row["role"] == "user"),
                "",
            )
            preview = " ".join(last_user.split())[:80]
            print(
                f"chat completions messages={len(rows)} last_user={preview!r}",
                flush=True,
            )
            completion = llm.create_completion(
                prompt=_phi3_prompt(rows),
                max_tokens=body.max_tokens,
                temperature=body.temperature,
                stop=list(dict.fromkeys([*(body.stop or []), *phi3_stops])),
            )
            choice = completion["choices"][0]
            text = _strip_specials(choice.get("text") or "")
            result = {
                "id": completion.get("id", "chatcmpl-clariq"),
                "object": "chat.completion",
                "model": body.model or SERVED_NAME,
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": text,
                        },
                        "finish_reason": choice.get("finish_reason"),
                    }
                ],
                "usage": completion.get("usage"),
            }
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"{type(exc).__name__}: {exc}") from exc
        return result

    return web
