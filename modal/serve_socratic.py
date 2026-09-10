"""vLLM GPU server for Clariq's Socratic Phi-3. Not a Modal Sandbox.

Deploy (from the repo root, after `pip install modal` and `modal setup`):

    modal secret create clariq-llm CLARIQ_MODAL_KEY=clariq-modal
    # optional, if Susu11/socratic-phi3 is private:
    # modal secret create huggingface HF_TOKEN=hf_...
    modal deploy modal/serve_socratic.py

Copy the printed HTTPS URL into .env as MODAL_BASE_URL (include /v1).
Set LLM_PROVIDER=modal and MODAL_API_KEY to the same CLARIQ_MODAL_KEY.
Stop the app when idle: modal app stop clariq-socratic
"""

import os
import subprocess

import modal

MINUTES = 60
VLLM_PORT = 8000
MODEL_NAME = "Susu11/socratic-phi3"
SERVED_NAME = "socratic-phi3"

vllm_image = (
    modal.Image.from_registry("nvidia/cuda:12.4.0-devel-ubuntu22.04", add_python="3.11")
    .entrypoint([])
    .pip_install("vllm==0.6.6.post1")
)

hf_cache_vol = modal.Volume.from_name("clariq-hf-cache", create_if_missing=True)
vllm_cache_vol = modal.Volume.from_name("clariq-vllm-cache", create_if_missing=True)

app = modal.App("clariq-socratic")

# Bearer token for vLLM --api-key. Override by creating a Modal secret named
# clariq-llm with CLARIQ_MODAL_KEY=... and adding it to secrets= below.
# Private HF repo: modal secret create huggingface HF_TOKEN=hf_...
_secrets = [modal.Secret.from_dict({"CLARIQ_MODAL_KEY": "clariq-modal"})]


@app.function(
    image=vllm_image,
    gpu="T4",
    timeout=15 * MINUTES,
    scaledown_window=10 * MINUTES,
    secrets=_secrets,
    volumes={
        "/root/.cache/huggingface": hf_cache_vol,
        "/root/.cache/vllm": vllm_cache_vol,
    },
)
@modal.concurrent(max_inputs=16)
@modal.web_server(port=VLLM_PORT, startup_timeout=10 * MINUTES)
def serve():
    api_key = os.environ.get("CLARIQ_MODAL_KEY") or "clariq-modal"
    cmd = [
        "vllm",
        "serve",
        MODEL_NAME,
        "--served-model-name",
        SERVED_NAME,
        "--host",
        "0.0.0.0",
        "--port",
        str(VLLM_PORT),
        "--dtype",
        "float16",
        "--max-model-len",
        "2048",
        "--enforce-eager",
        "--trust-remote-code",
        "--api-key",
        api_key,
    ]
    subprocess.Popen(cmd)
