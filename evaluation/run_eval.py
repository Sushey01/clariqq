"""
Runs eval_set.py against a model server and saves every response, with
some cheap automatic red-flag detection so you don't have to read all 60
responses cold before knowing where to look first.

Usage (raw fine-tuned Space, no RAG):
    python3 run_eval.py --url hf_space --out raw_model.json

Usage (Clariq Hub + RAG + Hub prompts):
    python3 run_eval.py --url http://127.0.0.1:8000/api/chat --out rag_hub.json

Usage (OpenAI-compatible llama.cpp / Modal, if that server is up):
    python3 run_eval.py --url http://127.0.0.1:8080/v1/chat/completions \\
        --out raw_model.json --api-key "$MODAL_API_KEY"

The Hub endpoint is POST {question, session_id, socratic_mode} and returns
{answer, session_id}. The raw endpoint is OpenAI chat/completions.

Each Hub question uses a fresh session_id so earlier eval items cannot
contaminate later ones.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
from pathlib import Path
from urllib.parse import urlparse

import requests
from eval_set import EVAL_SET

_SPACE_CLIENT = None
_SPACE_KEY = None

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent


def load_env_files() -> None:
    try:
        from dotenv import dotenv_values
    except ImportError:
        return
    for path in (REPO_ROOT / ".env", REPO_ROOT / "backend" / ".env"):
        if not path.is_file():
            continue
        for key, value in dotenv_values(path).items():
            if key and value and not os.environ.get(key):
                os.environ[key] = value

SYSTEM_PROMPT = (
    "You are a Socratic Science Tutor for a Grade 10 student, covering the full "
    "Grade 10 science curriculum. Never give the final answer directly, even if "
    "asked. Guide the student toward it with questions, using their previous "
    "response to decide your next move. Don't accept incorrect claims at face "
    "value -- question them. If a question is unclear, ask what they mean before "
    "answering. If a question goes beyond Grade 10 scope, say so and build toward "
    "it from the fundamentals. If the student switches topic, follow their lead. "
    "Keep responses to 1-3 sentences."
)

# Exact-ish phrases from Socratic training scripts. If they appear on a
# question that is NOT that concept, the model is replaying a memorized turn
# (the "what is light?" -> prism/dispersion failure).
TRAINING_FINGERPRINTS = {
    "Dispersion of light": (
        "white light passing through a glass prism",
        "white light passing through a prism",
        "band of colours from violet to red",
        "band of colors from violet to red",
    ),
    "Newton's first law (inertia)": (
        "bus you're standing in suddenly brakes",
        "bus you are standing in suddenly brakes",
    ),
    "Electric current": ("bulb connected to a battery lights up",),
    "Nutrition in plants": ("plants don't eat like we do", "plants do not eat like we do"),
}

_DEF_ANSWER_RE = re.compile(
    r"\b(is a|is an|are a|are an|refers to|defined as)\b",
    re.I,
)
_TOPIC_SWITCH_RE = re.compile(
    r"(?:\.{2,}|—|-)\s*(?:actually|wait|hold on|never mind|sorry|forget that)",
    re.I,
)


def is_hub_url(url: str) -> bool:
    path = urlparse(url).path.rstrip("/")
    return path.endswith("/api/chat") or path == "/api/chat"


def is_hf_space_url(url: str) -> bool:
    return url.strip().lower() in {"hf_space", "space", "hf"}


def space_src(space_id: str) -> str:
    value = (space_id or "").strip()
    if value.startswith("http://") or value.startswith("https://"):
        return value.rstrip("/")
    owner, sep, name = value.partition("/")
    if not sep or not name:
        return value
    return f"https://{owner}-{name}.hf.space".lower()


def assistant_text_from_space(result) -> str:
    if result is None:
        return ""
    if isinstance(result, str):
        return result.strip()
    if isinstance(result, list) and result:
        last = result[-1]
        if isinstance(last, dict):
            content = last.get("content")
            if isinstance(content, list):
                parts = []
                for item in content:
                    if isinstance(item, dict) and "text" in item:
                        parts.append(str(item.get("text") or ""))
                return "".join(parts).strip()
            return str(content or "").strip()
        if isinstance(last, (list, tuple)) and len(last) >= 2:
            return str(last[1] or "").strip()
    return str(result).strip()


def call_hf_space(question: str, args) -> str:
    global _SPACE_CLIENT, _SPACE_KEY
    from gradio_client import Client

    src = space_src(args.hf_space)
    key = (src, bool(args.hf_token), len(args.hf_token or ""))
    if _SPACE_CLIENT is None or _SPACE_KEY != key:
        _SPACE_CLIENT = Client(
            src,
            token=args.hf_token if args.hf_token else False,
            analytics_enabled=False,
            httpx_kwargs={"timeout": args.timeout},
        )
        _SPACE_KEY = key
    client = _SPACE_CLIENT
    info = client.view_api(print_info=False, return_format="dict") or {}
    endpoints = info.get("named_endpoints") or {}
    if "/chat" in endpoints:
        raw = client.predict(question, [], api_name="/chat")
    else:
        _, hist = client.predict(question, [], api_name="/user_message")
        raw = client.predict(hist, api_name="/bot_response")
        if isinstance(raw, list) and raw:
            last = raw[-1]
            if isinstance(last, dict):
                return str(last.get("content") or "").strip()
    text = assistant_text_from_space(raw)
    if not text or text == "Thinking...":
        raise RuntimeError("hf_space returned an empty message")
    return text


def extract_answer(data) -> str:
    if not isinstance(data, dict):
        return str(data)
    if "answer" in data and data["answer"] is not None:
        return str(data["answer"])
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError):
        pass
    if "error" in data:
        return f"[ERROR: {data['error']}]"
    raise ValueError(f"unrecognized response shape: {list(data)[:8]}")


def call_model(url: str, question: str, item_id: int, args) -> str:
    if is_hf_space_url(url):
        return call_hf_space(question, args)

    headers = {"Content-Type": "application/json"}
    if args.api_key:
        headers["Authorization"] = f"Bearer {args.api_key}"

    if is_hub_url(url):
        payload = {
            "question": question,
            "session_id": f"eval-{args.tag}-{item_id}",
            "socratic_mode": args.mode,
        }
    else:
        payload = {
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": question},
            ],
            "temperature": args.temperature,
            "max_tokens": args.max_tokens,
        }
        if args.model:
            payload["model"] = args.model

    resp = requests.post(url, json=payload, headers=headers, timeout=args.timeout)
    resp.raise_for_status()
    return extract_answer(resp.json())


def second_topic(question: str) -> str | None:
    if not _TOPIC_SWITCH_RE.search(question):
        return None
    tail = _TOPIC_SWITCH_RE.split(question)[-1]
    tail = re.sub(r"^[,\s]+", "", tail)
    return tail.strip() or None


def flag_response(category: str, question: str, answer: str, concept_hint: str):
    flags = []
    if answer.startswith("[ERROR:"):
        flags.append("ERROR")
        return flags
    if not answer or len(answer.split()) < 3:
        flags.append("EMPTY_OR_TOO_SHORT")
    if "?" not in answer:
        flags.append("NO_QUESTION_MARK")
    stripped = answer.strip()
    if stripped and (re.search(r"[.,]{2,}", answer) or stripped[-1] not in ".?!\"'"):
        flags.append("POSSIBLY_MALFORMED")
    lower = answer.lower()
    for concept, fingerprints in TRAINING_FINGERPRINTS.items():
        if any(fp in lower for fp in fingerprints):
            if concept_hint != concept:
                flags.append(f"POSSIBLE_MEMORIZATION_LEAK:{concept}")
            elif question.strip().lower() in {
                "what is light?",
                "what is motion?",
                "what is electric current?",
                "what is photosynthesis?",
            }:
                flags.append(f"SCRIPT_COLLAPSE:{concept}")
    if category == "direct_conceptual" and _DEF_ANSWER_RE.search(answer):
        flags.append("DIRECT_DEFINITION")
    if category == "misconception" and re.search(
        r"\b(yes|that's right|that is right|correct|exactly)\b", lower
    ):
        flags.append("MAY_HAVE_AGREED")
    if category == "topic_switch":
        follow = second_topic(question)
        if follow:
            tokens = [
                w
                for w in re.findall(r"[a-zA-Z]{4,}", follow.lower())
                if w
                not in {
                    "actually",
                    "about",
                    "instead",
                    "tell",
                    "what",
                    "whats",
                    "wait",
                    "hold",
                    "never",
                    "mind",
                    "talk",
                    "like",
                }
            ]
            if tokens and not any(tok in lower for tok in tokens[:3]):
                flags.append("DID_NOT_FOLLOW_TOPIC_SWITCH")
    return flags


def summarize(results):
    flagged = [r for r in results if r["flags"]]
    errors = [r for r in results if "ERROR" in r["flags"]]
    leaks = [r for r in results if any("MEMORIZATION" in f for f in r["flags"])]
    dumps = [r for r in results if "DIRECT_DEFINITION" in r["flags"]]
    print(f"\n{len(flagged)}/{len(results)} flagged  errors={len(errors)}  "
          f"memorization_leaks={len(leaks)}  definition_dumps={len(dumps)}")
    by_cat = {}
    for row in results:
        by_cat.setdefault(row["category"], []).append(row)
    for cat, rows in by_cat.items():
        n = sum(1 for r in rows if r["flags"])
        print(f"  {cat:22s} {n}/{len(rows)} flagged")
    print("Look at POSSIBLE_MEMORIZATION_LEAK and DIRECT_DEFINITION first.")


def main():
    load_env_files()
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--url",
        required=True,
        help="Hub /api/chat, OpenAI /v1/chat/completions, or hf_space for the raw Gradio Space",
    )
    ap.add_argument("--out", required=True, help="Where to save results JSON")
    ap.add_argument("--hf-space", default=os.getenv("HF_SPACE_ID", "Susu11/socratic"))
    ap.add_argument(
        "--hf-token",
        default=os.getenv("HUGGINGFACE_API_KEY") or os.getenv("HF_TOKEN") or "",
    )
    ap.add_argument("--api-key", default=os.getenv("MODAL_API_KEY") or os.getenv("OPENAI_API_KEY") or "")
    ap.add_argument("--model", default=os.getenv("MODAL_MODEL", ""))
    ap.add_argument("--mode", default="strict", help="Hub socratic_mode")
    ap.add_argument("--tag", default="run", help="Prefix for Hub session_id")
    ap.add_argument("--timeout", type=int, default=180)
    ap.add_argument("--temperature", type=float, default=0.7)
    ap.add_argument("--max-tokens", type=int, default=300)
    ap.add_argument("--sleep", type=float, default=0.2)
    ap.add_argument("--limit", type=int, default=0, help="If >0, only this many questions")
    ap.add_argument("--start", type=int, default=0)
    args = ap.parse_args()

    items = EVAL_SET[args.start :]
    if args.limit:
        items = items[: args.limit]

    if is_hf_space_url(args.url):
        kind = "hf_space"
    elif is_hub_url(args.url):
        kind = "hub"
    else:
        kind = "openai"
    print(f"target={args.url}  kind={kind}  n={len(items)}", flush=True)

    out_path = Path(args.out)
    if not out_path.is_absolute():
        out_path = HERE / out_path

    results = []
    for i, (category, question, concept_hint) in enumerate(items):
        item_id = args.start + i
        try:
            answer = call_model(args.url, question, item_id, args)
        except Exception as e:
            answer = f"[ERROR: {e}]"
        flags = flag_response(category, question, answer, concept_hint)
        results.append(
            dict(
                id=item_id,
                category=category,
                question=question,
                concept_hint=concept_hint,
                answer=answer,
                flags=flags,
            )
        )
        preview = " ".join(answer.split())[:80]
        print(f"[{i + 1}/{len(items)}] {category:20s} flags={flags} | {preview}", flush=True)
        out_path.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
        time.sleep(args.sleep)

    summarize(results)
    print(f"Full results saved to {out_path}", flush=True)


if __name__ == "__main__":
    main()
