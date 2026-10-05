"""ZeroGPU chat demo for Susu11/v9socratic4b."""

import threading

import spaces

import torch
import gradio as gr
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, TextIteratorStreamer

BASE_MODEL = "Qwen/Qwen3-4B-Instruct-2507"
ADAPTER_MODEL = "Susu11/v9socratic4b"

# Same system prompt as Susu11/socraticfinetune.
SYSTEM_PROMPT = (
    "You are a Socratic Science Tutor for a Grade 10 student, covering the full "
    "Grade 10 science curriculum (life processes, control and coordination, "
    "reproduction, heredity, electricity and magnetism, light, the human eye, "
    "pressure, gases, waves, chemical reactions, acids and bases, metals and "
    "non-metals, carbon compounds, classification, motion and force, and more). "
    "Never give the final answer directly. Guide the student toward it with "
    "questions, using their previous response to decide your next move. If the "
    "student switches to a different topic, follow their lead. Keep responses "
    "to 1-3 sentences."
)

EXAMPLES = [
    "What is Ohm's Law?",
    "Why does ice float?",
    "What causes light to bend when it enters water?",
]

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(ADAPTER_MODEL, trust_remote_code=True)
if tokenizer.pad_token_id is None:
    tokenizer.pad_token = tokenizer.eos_token

print("Loading base model...")
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    dtype=torch.bfloat16,
    attn_implementation="sdpa",
    trust_remote_code=True,
)
print("Loading LoRA adapter...")
# ZeroGPU reports CUDA as available in the main process, but safetensors cannot
# allocate real CUDA tensors there. Load the adapter on CPU, then pack with .to("cuda").
model = PeftModel.from_pretrained(model, ADAPTER_MODEL, torch_device="cpu")
model = model.to("cuda")
model.eval()
print("Model packed for ZeroGPU.")

_generate_lock = threading.Lock()


def _content_text(content) -> str:
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict):
                parts.append(str(item.get("text") or ""))
            else:
                parts.append(str(item))
        return "".join(parts)
    if isinstance(content, dict):
        return str(content.get("text") or content.get("content") or "")
    return str(content)


def _history_messages(history) -> list[dict]:
    rows: list[dict] = []
    for item in history or []:
        if isinstance(item, dict) and "role" in item:
            role = str(item.get("role") or "user")
            text = _content_text(item.get("content")).strip()
        elif isinstance(item, (list, tuple)) and len(item) >= 2:
            user_text = _content_text(item[0]).strip()
            assistant_text = _content_text(item[1]).strip()
            if user_text:
                rows.append({"role": "user", "content": user_text})
            if assistant_text:
                rows.append({"role": "assistant", "content": assistant_text})
            continue
        else:
            continue
        if role not in {"user", "assistant", "system"} or not text:
            continue
        rows.append({"role": role, "content": text})
    return rows


@spaces.GPU(duration=120)
def respond(message: str, history: list | None = None):
    """Guide a Grade 10 student through a science question without giving the final answer."""
    user_text = _content_text(message).strip()
    if not user_text:
        yield "Ask a Grade 10 science question to get started."
        return

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages.extend(_history_messages(history))
    messages.append({"role": "user", "content": user_text})

    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )
    inputs = tokenizer(prompt, return_tensors="pt")
    inputs = {key: value.to("cuda") for key, value in inputs.items()}

    streamer = TextIteratorStreamer(
        tokenizer,
        skip_prompt=True,
        skip_special_tokens=True,
    )
    generate_kwargs = {
        **inputs,
        "max_new_tokens": 192,
        "do_sample": False,
        "pad_token_id": tokenizer.pad_token_id,
        "streamer": streamer,
    }

    def _generate():
        with _generate_lock:
            with torch.no_grad():
                model.generate(**generate_kwargs)

    worker = threading.Thread(target=_generate)
    worker.start()

    partial = ""
    for token in streamer:
        partial += token
        text = partial.strip()
        if text:
            yield text
    worker.join()
    if not partial.strip():
        yield "I couldn't produce a reply. Try asking the question again."


demo = gr.ChatInterface(
    fn=respond,
    title="v9 Socratic Science Tutor",
    description=(
        "Fine-tune demo for **Susu11/v9socratic4b** "
        "(Qwen3-4B-Instruct-2507 + QLoRA on Susu11/socraticfinetune). "
        "Ask a Grade 10 science question. The tutor should guide you with a "
        "short question instead of giving the final answer. "
        "The first reply after this Space wakes can take about a minute."
    ),
    examples=EXAMPLES,
    cache_examples=False,
)

demo.launch(mcp_server=True)
