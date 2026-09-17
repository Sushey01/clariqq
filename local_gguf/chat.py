#!/usr/bin/env python3
"""Standalone GGUF chatbot for local evaluation.

This is isolated from Clariq's Hugging Face Space, Modal, Groq, and FastAPI
backend. Point it at a .gguf file and chat in the browser or the terminal.

Examples:
    python local_gguf/chat.py --gguf /path/to/qwen3-4b.gguf
    python local_gguf/chat.py --cli
    python local_gguf/chat.py --once "Why does ice float?"
"""

from __future__ import annotations

import argparse
import inspect
import os
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent
MODELS_DIR = HERE / "models"

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
""".strip()

_SPECIAL_RE = re.compile(r"\|?<\|[^|>]+?\|>")


def _strip_specials(text: str) -> str:
    cleaned = _SPECIAL_RE.sub("", text or "")
    return cleaned.rstrip("|").strip()


def guess_chat_format(path: Path) -> str:
    name = path.name.lower()
    if "phi" in name:
        return "phi3"
    if "llama-3" in name or "llama3" in name:
        return "llama3"
    return "chatml"


def render_prompt(messages: list[dict], chat_format: str) -> str:
    if chat_format == "phi3":
        parts: list[str] = []
        for message in messages:
            role = message["role"]
            tag = "assistant" if role == "assistant" else "system" if role == "system" else "user"
            parts.append(f"<|{tag}|>\n{message['content']}<|end|>\n")
        parts.append("<|assistant|>\n")
        return "".join(parts)

    if chat_format == "llama3":
        parts = ["<|begin_of_text|>"]
        for message in messages:
            role = message["role"]
            parts.append(
                f"<|start_header_id|>{role}<|end_header_id|>\n\n"
                f"{message['content']}<|eot_id|>"
            )
        parts.append("<|start_header_id|>assistant<|end_header_id|>\n\n")
        return "".join(parts)

    parts = []
    for message in messages:
        role = message["role"]
        parts.append(f"<|im_start|>{role}\n{message['content']}<|im_end|>\n")
    parts.append("<|im_start|>assistant\n")
    return "".join(parts)


def stop_tokens(chat_format: str) -> list[str]:
    if chat_format == "phi3":
        return ["<|end|>", "<|endoftext|>", "<|user|>", "<|system|>", "<|assistant|>"]
    if chat_format == "llama3":
        return ["<|eot_id|>", "<|end_of_text|>"]
    return ["<|im_end|>", "<|endoftext|>", "<|im_start|>"]


def find_gguf(explicit: str | None) -> Path:
    if explicit:
        path = Path(explicit).expanduser()
        if not path.is_absolute():
            path = (Path.cwd() / path).resolve()
        if not path.is_file():
            raise FileNotFoundError(f"GGUF not found: {path}")
        return path

    env_path = os.getenv("GGUF_PATH", "").strip()
    if env_path:
        path = Path(env_path).expanduser()
        if not path.is_absolute():
            path = (HERE / path).resolve()
        if path.is_file():
            return path
        raise FileNotFoundError(f"GGUF_PATH is set but file is missing: {path}")

    search_dirs = [MODELS_DIR, REPO_ROOT / "models"]
    found: list[Path] = []
    for folder in search_dirs:
        if folder.is_dir():
            found.extend(sorted(folder.glob("*.gguf")))
    if found:
        return found[0]

    searched = ", ".join(str(folder) for folder in search_dirs)
    raise FileNotFoundError(
        "No .gguf file found. Copy your 4B GGUF into local_gguf/models/ "
        f"or pass --gguf /path/to/model.gguf (searched: {searched})."
    )


def load_llm(model_path: Path, n_ctx: int, n_gpu_layers: int, n_threads: int):
    from llama_cpp import Llama

    print(f"Loading GGUF: {model_path}", flush=True)
    print(
        f"n_ctx={n_ctx} n_gpu_layers={n_gpu_layers} n_threads={n_threads}",
        flush=True,
    )
    return Llama(
        model_path=str(model_path),
        n_ctx=n_ctx,
        n_gpu_layers=n_gpu_layers,
        n_threads=n_threads,
        n_batch=256,
        verbose=False,
    )


class LocalGgufChat:
    def __init__(
        self,
        llm,
        chat_format: str,
        temperature: float,
        max_tokens: int,
        system_prompt: str,
    ) -> None:
        self.llm = llm
        self.chat_format = chat_format
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.system_prompt = system_prompt

    def reply(self, user_message: str, history: list[dict] | None = None) -> str:
        messages = [{"role": "system", "content": self.system_prompt}]
        for item in history or []:
            role = str(item.get("role") or "user")
            content = str(item.get("content") or "").strip()
            if role == "assistant" and content in {"", "Thinking..."}:
                continue
            if role in {"user", "assistant"} and content:
                messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": user_message.strip()})

        prompt = render_prompt(messages, self.chat_format)
        completion = self.llm.create_completion(
            prompt=prompt,
            max_tokens=self.max_tokens,
            temperature=self.temperature,
            stop=stop_tokens(self.chat_format),
        )
        text = completion["choices"][0].get("text") or ""
        return _strip_specials(text)


def history_as_messages(history) -> list[dict]:
    rows: list[dict] = []
    if not history:
        return rows
    first = history[0]
    if isinstance(first, dict) and "role" in first:
        for item in history:
            if not isinstance(item, dict):
                continue
            role = str(item.get("role") or "user")
            content = str(item.get("content") or "").strip()
            if role == "assistant" and content in {"", "Thinking..."}:
                continue
            if content:
                rows.append({"role": role, "content": content})
        return rows
    for interaction in history:
        if not isinstance(interaction, (list, tuple)) or len(interaction) < 2:
            continue
        user_text = str(interaction[0] or "").strip()
        assistant_text = str(interaction[1] or "").strip()
        if user_text:
            rows.append({"role": "user", "content": user_text})
        if assistant_text and assistant_text != "Thinking...":
            rows.append({"role": "assistant", "content": assistant_text})
    return rows


def build_gradio(bot: LocalGgufChat, model_path: Path):
    import gradio as gr

    def user_message(user_message_text, history):
        history = list(history or [])
        if not str(user_message_text).strip():
            return "", history
        history.append({"role": "user", "content": user_message_text})
        history.append({"role": "assistant", "content": "Thinking..."})
        return "", history

    def bot_response(history):
        history = [item for item in (history or []) if isinstance(item, dict)]
        if not history:
            return history
        if history[-1].get("role") == "assistant":
            history = history[:-1]
        if not history or history[-1].get("role") != "user":
            return history
        current = str(history[-1].get("content") or "")
        previous = history_as_messages(history[:-1])
        response = bot.reply(current, previous)
        history.append({"role": "assistant", "content": response})
        return history

    with gr.Blocks(title="Local GGUF Chat") as demo:
        gr.Markdown(
            f"""
# Local GGUF chatbot

Offline evaluation only. This app does **not** call Hugging Face Space, Modal, or Groq.

**Model file:** `{model_path}`
**Chat format:** `{bot.chat_format}`
"""
        )
        chatbot_kwargs = {"label": "Local tutor", "height": 520}
        if "type" in inspect.signature(gr.Chatbot.__init__).parameters:
            chatbot_kwargs["type"] = "messages"
        chatbot = gr.Chatbot(**chatbot_kwargs)
        msg = gr.Textbox(
            label="Your question",
            placeholder="Ask a Grade 10 science question...",
            lines=2,
        )
        with gr.Row():
            submit_button = gr.Button("Ask", variant="primary")
            clear_button = gr.Button("Clear")

        msg.submit(user_message, [msg, chatbot], [msg, chatbot], queue=False).then(
            bot_response, chatbot, chatbot
        )
        submit_button.click(user_message, [msg, chatbot], [msg, chatbot], queue=False).then(
            bot_response, chatbot, chatbot
        )
        clear_button.click(lambda: [], outputs=chatbot, queue=False)

    return demo


def run_cli(bot: LocalGgufChat) -> None:
    print("Local GGUF chat. Type a question, or /exit to quit.\n")
    history: list[dict] = []
    while True:
        try:
            user_text = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return
        if not user_text:
            continue
        if user_text.lower() in {"/exit", "/quit", "exit", "quit"}:
            return
        reply = bot.reply(user_text, history)
        history.append({"role": "user", "content": user_text})
        history.append({"role": "assistant", "content": reply})
        print(f"Tutor: {reply}\n")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Standalone local GGUF chatbot")
    parser.add_argument("--gguf", help="Path to the .gguf weights file")
    parser.add_argument(
        "--chat-format",
        choices=["auto", "chatml", "phi3", "llama3"],
        default="auto",
        help="Prompt template. auto picks chatml for Qwen GGUF and phi3 if the filename contains phi",
    )
    parser.add_argument("--n-ctx", type=int, default=int(os.getenv("N_CTX", "2048")))
    parser.add_argument(
        "--n-gpu-layers",
        type=int,
        default=int(os.getenv("N_GPU_LAYERS", "0")),
        help="0 = CPU only (safe default). Use -1 to offload all layers if llama-cpp was built with CUDA",
    )
    parser.add_argument(
        "--n-threads",
        type=int,
        default=int(os.getenv("N_THREADS", str(os.cpu_count() or 4))),
    )
    parser.add_argument("--max-tokens", type=int, default=256)
    parser.add_argument("--temperature", type=float, default=0.7)
    parser.add_argument("--cli", action="store_true", help="Chat in the terminal")
    parser.add_argument("--once", metavar="TEXT", help="Generate one reply and exit")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=7861)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        model_path = find_gguf(args.gguf)
    except FileNotFoundError as exc:
        print(exc, file=sys.stderr)
        return 1

    chat_format = args.chat_format
    if chat_format == "auto":
        chat_format = guess_chat_format(model_path)
    print(f"Chat format: {chat_format}", flush=True)

    llm = load_llm(model_path, args.n_ctx, args.n_gpu_layers, args.n_threads)
    bot = LocalGgufChat(
        llm=llm,
        chat_format=chat_format,
        temperature=args.temperature,
        max_tokens=args.max_tokens,
        system_prompt=SOCRATIC_SYSTEM_PROMPT,
    )

    if args.once:
        print(bot.reply(args.once, []))
        return 0
    if args.cli:
        run_cli(bot)
        return 0

    demo = build_gradio(bot, model_path)
    demo.launch(server_name=args.host, server_port=args.port, share=False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
