"""Hugging Face ZeroGPU Space for the Qwen Socratic tutor.

Copy these files into https://huggingface.co/spaces/Susu11/socratic
(or `huggingface-cli upload Susu11/socratic hf_space/socratic . --repo-type space`).

Gradio 6 Chatbot uses messages `{role, content}`, not `[user, assistant]` tuples.
"""

import inspect
import os
from typing import Any

import gradio as gr
import spaces
import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

BASE_MODEL = "Qwen/Qwen3-4B-Instruct-2507"
ADAPTER_MODEL = "Susu11/Science_Socratic_Qwen3-4B_Instruct"

HF_TOKEN = os.environ.get("HF_TOKEN")

print("Starting Science Socratic Tutor...")
print("HF_TOKEN status:", "found" if HF_TOKEN else "not found")

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(
    BASE_MODEL,
    token=HF_TOKEN,
    trust_remote_code=True,
)
print("Tokenizer loaded.")

model = None

SOCRATIC_SYSTEM_PROMPT = """
You are a Socratic Science Tutor for Grade 10 students.

Your goal is to help students understand science through guided
reasoning instead of immediately giving the final answer.

Follow these rules:

1. Do not immediately give the final answer.
2. Ask a useful guiding question or provide a small hint.
3. Encourage the student to think about the relevant scientific concept.
4. Use simple language appropriate for a Grade 10 student.
5. Build on the student's previous response.
6. Do not repeatedly ask the same question.
7. Each question should move the student closer to understanding.
8. If the student is partially correct, acknowledge the correct part
 and guide them toward the missing part.
9. If the student is incorrect, give a useful hint instead of simply
 saying they are wrong.
10. If the student remains confused after several attempts, give a
 concise explanation and check their understanding.
11. Do not keep the student in an endless Socratic loop.
12. Keep responses focused on the current science topic.
13. Use scientifically accurate information.
14. Do not invent unrelated information.
15. When the student reaches the correct conclusion, briefly confirm
 it and explain why it is correct.

The tutor should behave like a teacher helping a student think,
not like a normal question-answering chatbot.
"""


def load_model():
    global model
    if model is not None:
        return model

    print("Loading base Qwen model...")
    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL,
        token=HF_TOKEN,
        dtype=torch.bfloat16,
        trust_remote_code=True,
    )
    print("Base model loaded.")
    print("Loading LoRA adapter...")
    loaded_model = PeftModel.from_pretrained(
        base_model,
        ADAPTER_MODEL,
        token=HF_TOKEN,
    )
    print("LoRA adapter loaded.")
    print("Moving model to ZeroGPU CUDA device...")
    loaded_model = loaded_model.to("cuda")
    loaded_model.eval()
    print("Model ready for ZeroGPU.")
    model = loaded_model
    return model


def _content_text(content) -> str:
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for item in content:
            if isinstance(item, dict) and item.get("type") == "text":
                parts.append(str(item.get("text") or ""))
            elif isinstance(item, dict) and "text" in item:
                parts.append(str(item.get("text") or ""))
            else:
                parts.append(str(item))
        return "".join(parts)
    if isinstance(content, dict) and "text" in content:
        return str(content.get("text") or "")
    return str(content)


def _as_message(item) -> dict | None:
    if isinstance(item, dict) and "role" in item:
        return item
    role = getattr(item, "role", None)
    if role is None:
        return None
    return {"role": role, "content": getattr(item, "content", "")}


def history_as_chat_messages(history) -> list[dict]:
    """Turn Gradio history (messages or legacy pairs) into OpenAI-style rows."""
    rows: list[dict] = []
    if not history:
        return rows

    first = _as_message(history[0])
    if first is not None:
        for item in history:
            msg = _as_message(item)
            if msg is None:
                continue
            role = str(msg.get("role") or "user")
            text = _content_text(msg.get("content")).strip()
            if role == "assistant" and text in {"", "Thinking..."}:
                continue
            if text:
                rows.append({"role": role, "content": text})
        return rows

    for interaction in history:
        if not isinstance(interaction, (list, tuple)) or len(interaction) < 2:
            continue
        user_text = _content_text(interaction[0]).strip()
        assistant_text = _content_text(interaction[1]).strip()
        if user_text:
            rows.append({"role": "user", "content": user_text})
        if assistant_text and assistant_text != "Thinking...":
            rows.append({"role": "assistant", "content": assistant_text})
    return rows


@spaces.GPU(duration=90)
def generate_response(message: str, history: list[Any] | None = None) -> str:
    current_model = load_model()
    messages = [{"role": "system", "content": SOCRATIC_SYSTEM_PROMPT}]
    messages.extend(history_as_chat_messages(history))
    messages.append({"role": "user", "content": str(message)})

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )
    inputs = tokenizer(text, return_tensors="pt")
    inputs = {key: value.to("cuda") for key, value in inputs.items()}

    with torch.no_grad():
        output = current_model.generate(
            **inputs,
            max_new_tokens=256,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id,
        )

    input_length = inputs["input_ids"].shape[-1]
    generated_tokens = output[0][input_length:]
    response = tokenizer.decode(generated_tokens, skip_special_tokens=True)
    return response.strip()


def user_message(user_message_text, history):
    history = list(history or [])
    if not str(user_message_text).strip():
        return "", history
    history.append({"role": "user", "content": user_message_text})
    history.append({"role": "assistant", "content": "Thinking..."})
    return "", history


def bot_response(history):
    history = [_as_message(item) or item for item in (history or [])]
    history = [item for item in history if isinstance(item, dict)]
    if not history:
        return history

    if history[-1].get("role") == "assistant":
        history = history[:-1]
    if not history or history[-1].get("role") != "user":
        return history

    current_user_message = _content_text(history[-1].get("content"))
    previous_history = history[:-1]
    response = generate_response(current_user_message, previous_history)
    history.append({"role": "assistant", "content": response})
    return history


def clear_chat():
    return []


with gr.Blocks(title="Science Socratic Tutor") as demo:
    gr.Markdown(
        """
        # Science Socratic Tutor

        Learn science by thinking, not just memorising.

        Ask a Grade 10 science question and the tutor will guide
        you through the reasoning using questions and hints.
        """
    )

    chatbot_kwargs = {"label": "Socratic Tutor", "height": 550}
    # Gradio 6.27 removed type=; older 4.x still wants type="messages".
    if "type" in inspect.signature(gr.Chatbot.__init__).parameters:
        chatbot_kwargs["type"] = "messages"
    chatbot = gr.Chatbot(**chatbot_kwargs)
    msg = gr.Textbox(
        label="Your Question",
        placeholder="Ask a Grade 10 science question...",
        lines=2,
    )

    with gr.Row():
        submit_button = gr.Button("Ask Tutor", variant="primary")
        clear_button = gr.Button("Clear Conversation")

    msg.submit(
        user_message,
        inputs=[msg, chatbot],
        outputs=[msg, chatbot],
        queue=False,
        api_name="user_message",
    ).then(
        bot_response,
        inputs=[chatbot],
        outputs=[chatbot],
        api_name="bot_response",
    )

    submit_button.click(
        user_message,
        inputs=[msg, chatbot],
        outputs=[msg, chatbot],
        queue=False,
        api_name=False,
    ).then(
        bot_response,
        inputs=[chatbot],
        outputs=[chatbot],
        api_name=False,
    )

    clear_button.click(
        clear_chat,
        inputs=[],
        outputs=[chatbot],
        queue=False,
        api_name="clear_chat",
    )

    gr.api(generate_response, api_name="chat")

print("Starting Gradio application...")
demo.launch()
