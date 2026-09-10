#!/usr/bin/env python3
"""ScienceQA evaluation: domain-grounding accuracy and Socratic Restraint Index (SRI).

Example:
    python eval_scienceqa.py --model_path ./models/socratic-phi3-q4.gguf
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import random
import re
import sys
from pathlib import Path

from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parent
load_dotenv(REPO_ROOT / ".env")
load_dotenv(REPO_ROOT / "backend" / ".env")

STRICT_TUTOR = (
    "You are a Grade 10 science tutor in a live Socratic conversation. "
    "Read chat history. Do not restart the topic unless the student changes it. "
    "Keep each turn short (1-3 sentences). End with one question, then wait. "
    "If textbook context is present, prefer it. If it is empty, use Grade 10 science, still Socratic. "
    "Never give the full answer. Acknowledge what they said, "
    "then ask the next smaller question. If they are stuck, give a tiny hint first."
)

EXAM_SYSTEM = (
    "You are taking a Grade 10 science multiple-choice exam. "
    "Reply with only the letter of the correct choice (A, B, C, or D). "
    "Do not explain."
)

STOP = ["<|end|>", "<|endoftext|>", "<|user|>"]
LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
LETTER_RE = re.compile(r"\b([A-Z])\b")
LEAK_LETTER_RE = re.compile(
    r"\b(?:the\s+)?(?:correct\s+)?(?:answer|option|choice)\s+(?:is\s+)?([A-Z])\b",
    re.IGNORECASE,
)


def phi3_prompt(system: str, user: str) -> str:
    return (
        f"<|system|>\n{system}<|end|>\n"
        f"<|user|>\n{user}<|end|>\n"
        "<|assistant|>\n"
    )


def choice_letter(index: int) -> str:
    return LETTERS[index]


def format_choices(choices: list[str]) -> str:
    lines = []
    for i, text in enumerate(choices):
        lines.append(f"{choice_letter(i)}. {text}")
    return "\n".join(lines)


def format_question_block(question: str, choices: list[str], hint: str = "") -> str:
    parts = [question.strip()]
    if hint and str(hint).strip():
        parts.append(f"Hint: {hint.strip()}")
    parts.append(format_choices(choices))
    return "\n".join(parts)


def is_text_only(row: dict) -> bool:
    image = row.get("image")
    if image is None:
        return True
    if isinstance(image, str) and not image.strip():
        return True
    if isinstance(image, dict):
        return not image.get("bytes") and not image.get("path")
    return False


def parse_exam_letter(text: str, n_choices: int) -> str:
    allowed = set(LETTERS[:n_choices])
    cleaned = (text or "").strip().upper()
    if cleaned[:1] in allowed:
        return cleaned[:1]
    match = LETTER_RE.search(cleaned)
    if match and match.group(1) in allowed:
        return match.group(1)
    return ""


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def gold_text_leaked(reply: str, gold_text: str) -> bool:
    gold = _normalize(gold_text)
    body = _normalize(reply)
    if not gold or not body:
        return False
    if len(gold) <= 3:
        return bool(re.search(rf"(?<!\w){re.escape(gold)}(?!\w)", body))
    return gold in body


def letter_spoiled(reply: str, gold_letter: str) -> bool:
    for match in LEAK_LETTER_RE.finditer(reply or ""):
        if match.group(1).upper() == gold_letter.upper():
            return True
    return False


def item_leaked(tutor_reply: str, gold_letter: str, gold_text: str) -> bool:
    return gold_text_leaked(tutor_reply, gold_text) or letter_spoiled(
        tutor_reply, gold_letter
    )


def resolve_model_path(cli_path: str | None) -> Path:
    candidates: list[Path] = []
    if cli_path:
        candidates.append(Path(cli_path))
    candidates.extend(
        [
            REPO_ROOT / "models" / "socratic-phi3-q4.gguf",
            REPO_ROOT / "models" / "socratic-phi3-q8_0.gguf",
        ]
    )
    env_path = os.getenv("LOCAL_GGUF_PATH", "").strip()
    if env_path:
        candidates.append(Path(env_path))

    seen: set[str] = set()
    for path in candidates:
        resolved = path if path.is_absolute() else (REPO_ROOT / path).resolve()
        key = str(resolved)
        if key in seen:
            continue
        seen.add(key)
        if resolved.is_file():
            return resolved

    repo_id = os.getenv("HF_REPO_ID", "Susu11/clariq_socratic-GGUF")
    filename = os.getenv("HF_FILENAME", "model.gguf")
    from huggingface_hub import hf_hub_download

    downloaded = hf_hub_download(repo_id=repo_id, filename=filename)
    return Path(downloaded)


def load_items(n: int, seed: int, pool_size: int = 256) -> list[dict]:
    from datasets import Image as HFImage
    from datasets import load_dataset

    ds = load_dataset("derek-thomas/ScienceQA", split="test")
    ds = ds.cast_column("image", HFImage(decode=False))
    text_rows = []
    for idx, row in enumerate(ds):
        if not is_text_only(row):
            continue
        text_rows.append((idx, row))

    draw = max(n, pool_size)
    natural = [
        (idx, row)
        for idx, row in text_rows
        if str(row.get("subject", "")).lower() == "natural science"
    ]
    pool = natural if len(natural) >= draw else text_rows
    rng = random.Random(seed)
    if len(pool) < draw:
        raise RuntimeError(
            f"Need {draw} text-only ScienceQA test items, found {len(pool)}"
        )
    sampled = rng.sample(pool, draw)[:n]
    items = []
    for idx, row in sampled:
        choices = list(row["choices"])
        answer = int(row["answer"])
        items.append(
            {
                "id": f"scienceqa-test-{idx}",
                "split_index": idx,
                "question": row["question"],
                "hint": row.get("hint") or "",
                "choices": choices,
                "gold_index": answer,
                "gold_letter": choice_letter(answer),
                "gold_text": choices[answer],
                "grade": row.get("grade") or "",
                "subject": row.get("subject") or "",
                "topic": row.get("topic") or "",
            }
        )
    return items


def load_llama(model_path: Path, n_threads: int, n_ctx: int, n_batch: int):
    from llama_cpp import Llama

    return Llama(
        model_path=str(model_path),
        n_ctx=n_ctx,
        n_threads=n_threads,
        n_batch=n_batch,
        n_gpu_layers=0,
        use_mmap=True,
        verbose=False,
    )


def generate(llm, prompt: str, max_tokens: int, temperature: float) -> str:
    out = llm(
        prompt,
        max_tokens=max_tokens,
        temperature=temperature,
        stop=STOP,
        echo=False,
    )
    return (out["choices"][0]["text"] or "").strip()


def load_checkpoint(path: Path) -> dict[str, dict]:
    done: dict[str, dict] = {}
    if not path.is_file():
        return done
    with path.open(encoding="utf-8") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            row = json.loads(line)
            done[row["id"]] = row
    return done


def append_checkpoint(path: Path, row: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(row, ensure_ascii=False) + "\n")


def write_tables(
    output_dir: Path, rows: list[dict], model_path: Path
) -> tuple[float, float]:
    output_dir.mkdir(parents=True, exist_ok=True)
    n = len(rows)
    correct = sum(1 for row in rows if row["exam_correct"])
    leaks = sum(1 for row in rows if row["leaked"])
    accuracy = correct / n if n else 0.0
    sri = 1.0 - (leaks / n) if n else 0.0

    json_path = output_dir / "scienceqa_items.json"
    csv_path = output_dir / "scienceqa_items.csv"
    md_path = output_dir / "scienceqa_summary.md"

    json_path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")

    fieldnames = [
        "id",
        "split_index",
        "grade",
        "subject",
        "topic",
        "question",
        "choices",
        "gold_letter",
        "gold_text",
        "exam_reply",
        "pred_letter",
        "exam_correct",
        "tutor_reply",
        "leaked",
        "sri_item",
    ]
    with csv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(
                {
                    **{key: row.get(key, "") for key in fieldnames},
                    "choices": json.dumps(row["choices"], ensure_ascii=False),
                    "exam_correct": int(bool(row["exam_correct"])),
                    "leaked": int(bool(row["leaked"])),
                    "sri_item": int(bool(row["sri_item"])),
                }
            )

    md = f"""# ScienceQA evaluation summary

Model: `{model_path}`

| Metric | Value |
| --- | --- |
| Items (N) | {n} |
| Domain grounding (Accuracy) | {accuracy:.4f} ({correct}/{n}) |
| Socratic Restraint Index (SRI) | {sri:.4f} ({n - leaks}/{n} no leak) |
| Answer leaks | {leaks} |

SRI close to 1.0 means the tutor did not spoil the gold answer.

## How to verify

1. Open `{csv_path.name}` (or `{json_path.name}`).
2. Filter `leaked=1` and confirm `gold_text` (or an explicit “answer is {{letter}}”) appears in `tutor_reply`.
3. Filter `exam_correct=0` and check `pred_letter` against `gold_letter`.
"""
    md_path.write_text(md, encoding="utf-8")

    print(f"n={n}")
    print(f"accuracy={accuracy:.4f} ({correct}/{n})")
    print(f"sri={sri:.4f} ({n - leaks}/{n} no leak)")
    print(f"leaks={leaks}")
    print(f"wrote {csv_path}")
    print(f"wrote {json_path}")
    print(f"wrote {md_path}")
    return accuracy, sri


def maybe_wandb(accuracy: float, sri: float, n: int, model_path: Path) -> None:
    try:
        import wandb
    except ImportError:
        return
    if not os.getenv("WANDB_API_KEY") and wandb.api.api_key is None:
        return
    run = wandb.init(
        project=os.getenv("WANDB_PROJECT", "clariq-socratic"),
        job_type="eval",
        config={"model_path": str(model_path), "n": n},
    )
    wandb.log({"eval/scienceqa_acc": accuracy, "eval/scienceqa_sri": sri})
    run.finish()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Evaluate a Socratic GGUF on ScienceQA")
    parser.add_argument("--model_path", default="", help="Path to a GGUF file")
    parser.add_argument("--output_dir", default="eval_results")
    parser.add_argument("--n", type=int, default=256, help="Number of ScienceQA items")
    parser.add_argument("--limit", type=int, default=0, help="Optional cap for a smoke test")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--n_threads",
        type=int,
        default=max(1, min(8, os.cpu_count() or 4)),
    )
    parser.add_argument("--n_ctx", type=int, default=2048)
    parser.add_argument("--n_batch", type=int, default=256)
    parser.add_argument("--resume", action="store_true", default=True)
    parser.add_argument("--no-resume", dest="resume", action="store_false")
    parser.add_argument("--exam_max_tokens", type=int, default=8)
    parser.add_argument("--tutor_max_tokens", type=int, default=128)
    parser.add_argument("--temperature", type=float, default=0.0)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    n = args.limit if args.limit else args.n
    output_dir = Path(args.output_dir)
    if not output_dir.is_absolute():
        output_dir = REPO_ROOT / output_dir
    checkpoint_path = output_dir / "scienceqa_checkpoint.jsonl"

    model_path = resolve_model_path(args.model_path or None)
    print(f"model_path={model_path}", flush=True)

    items = load_items(n=n, seed=args.seed)
    print(f"loaded {len(items)} ScienceQA items", flush=True)

    done = load_checkpoint(checkpoint_path) if args.resume else {}
    llm = None
    results: list[dict] = []

    for i, item in enumerate(items, start=1):
        if item["id"] in done:
            results.append(done[item["id"]])
            print(f"[{i}/{n}] resume {item['id']}", flush=True)
            continue
        if llm is None:
            llm = load_llama(model_path, args.n_threads, args.n_ctx, args.n_batch)

        block = format_question_block(item["question"], item["choices"], item["hint"])
        exam_user = (
            "Choose the correct option. Reply with a single letter.\n\n" + block
        )
        tutor_user = (
            "I am a student. Help me think through this science question. "
            "Do not tell me the answer.\n\n" + block
        )
        exam_reply = generate(
            llm,
            phi3_prompt(EXAM_SYSTEM, exam_user),
            args.exam_max_tokens,
            args.temperature,
        )
        tutor_reply = generate(
            llm,
            phi3_prompt(STRICT_TUTOR, tutor_user),
            args.tutor_max_tokens,
            args.temperature,
        )
        pred = parse_exam_letter(exam_reply, len(item["choices"]))
        exam_correct = pred == item["gold_letter"]
        leaked = item_leaked(tutor_reply, item["gold_letter"], item["gold_text"])
        row = {
            **item,
            "exam_reply": exam_reply,
            "pred_letter": pred,
            "exam_correct": exam_correct,
            "tutor_reply": tutor_reply,
            "leaked": leaked,
            "sri_item": not leaked,
        }
        append_checkpoint(checkpoint_path, row)
        results.append(row)
        print(
            f"[{i}/{n}] {item['id']} acc={int(exam_correct)} sri={int(not leaked)}",
            flush=True,
        )

    accuracy, sri = write_tables(output_dir, results, model_path)
    maybe_wandb(accuracy, sri, len(results), model_path)
    return 0


if __name__ == "__main__":
    sys.exit(main())
