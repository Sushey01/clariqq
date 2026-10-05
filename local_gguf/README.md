# Local GGUF chatbot

Standalone chat for evaluating a `.gguf` file on this machine (including a college PC).

It does **not** use Hugging Face Space, Modal, Groq, or the Clariq FastAPI backend. Existing cloud deployment is left alone.

## 1. Install (once)

Use a **separate** virtualenv so this cannot change the main app:

```bash
cd /path/to/clariq
python3 -m venv local_gguf/.venv
source local_gguf/.venv/bin/activate
pip install -r local_gguf/requirements.txt
```

CPU-only `llama-cpp-python` is the default. On a NVIDIA GPU machine you can instead install a CUDA wheel, then run with `--n-gpu-layers -1`.

## 2. Put the GGUF file on disk

Copy your 4B (or other) GGUF into either:

- `local_gguf/models/your-model.gguf` (preferred), or
- `models/your-model.gguf` at the repo root

Or pass an absolute path with `--gguf`.

## 3. Run

Browser UI (port **7861**, not the main Gradio Space):

```bash
source local_gguf/.venv/bin/activate
python local_gguf/chat.py --gguf /path/to/your-4b.gguf
```

Then open http://127.0.0.1:7861

Terminal chat:

```bash
python local_gguf/chat.py --gguf /path/to/your-4b.gguf --cli
```

One-shot reply (good first check that the file actually generates):

```bash
python local_gguf/chat.py --gguf /path/to/your-4b.gguf --once "Why does ice float on water?"
```

## Useful flags

| Flag | Meaning |
| --- | --- |
| `--gguf PATH` | Weights file. If omitted, first `*.gguf` in `local_gguf/models/` then `models/` is used |
| `--chat-format auto\|chatml\|phi3\|llama3` | Prompt template. `auto` uses **chatml** (Qwen) unless the filename contains `phi` |
| `--n-gpu-layers 0` | CPU only (default, safest on a college PC) |
| `--n-gpu-layers -1` | Offload all layers if llama-cpp was built with CUDA |
| `--n-ctx 2048` | Context length |
| `--max-tokens 256` | Max new tokens per reply |
| `--port 7861` | Gradio port |

Environment alternative: `GGUF_PATH=/path/to/model.gguf`.

## What this is for

1. Confirm the GGUF loads with `llama-cpp-python`.
2. Read the raw tutor reply (Socratic system prompt, same intent as the Space tutor).
3. Compare that local reply later against the already-deployed cloud/Space model — without wiring this into the live app.
