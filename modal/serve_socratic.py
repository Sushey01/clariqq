"""Serve Clariq GGUF on a Modal GPU via llama.cpp (OpenAI-compatible).

vLLM cannot load Susu11/socratic-phi3 (private / no HF config.json).
This serves the public GGUF instead: Susu11/clariq_socratic-GGUF.

llama-cpp-python 0.3.3–0.3.4 bundled server raises
"'coroutine' object is not callable" on /v1/chat/completions, so this
wraps Llama.create_chat_completion in FastAPI instead.

    modal deploy modal/serve_socratic.py
    modal app stop clariq-socratic
"""

import os

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
    llm = Llama(
        model_path=model_path,
        n_gpu_layers=-1,
        n_ctx=2048,
        chat_format="chatml",
        verbose=False,
    )

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
        return llm.create_chat_completion(
            messages=body.messages,
            max_tokens=body.max_tokens,
            temperature=body.temperature,
            stop=body.stop,
        )

    return web
