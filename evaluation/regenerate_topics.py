"""Regenerate collapsed-topic conversations through an OpenAI-compatible API.

The output JSONL contains only the training examples, so it can be passed to
diversity_gate.py without any conversion step. Per-topic raw responses are
kept separately to make failed or malformed generations inspectable.
"""
import argparse
import csv
import json
import os
import re
import time
from pathlib import Path

import httpx
from dotenv import load_dotenv


HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent
TEMPLATE_PATH = HERE / "regeneration_prompt_template.md"
WORKLIST_PATH = HERE / "script_collapse_worklist.csv"
DEFAULT_OUTPUT = HERE / "regenerated_topics.jsonl"
DEFAULT_RAW_DIR = HERE / "regeneration_raw"


def load_settings() -> tuple[str, str, str]:
    load_dotenv(REPO_ROOT / ".env", override=True)
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b").strip()
    base_url = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1").strip()
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured in .env or the environment.")
    return api_key, model, base_url


def parse_json_array(text: str) -> list[dict]:
    cleaned = text.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)\s*```", cleaned, re.IGNORECASE | re.DOTALL)
    if fenced:
        cleaned = fenced.group(1).strip()
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start < 0 or end < start:
        raise ValueError("model response did not contain a JSON array")
    value = json.loads(cleaned[start : end + 1])
    if not isinstance(value, list) or len(value) != 16:
        raise ValueError(f"expected a JSON list of 16 examples, got {type(value).__name__} of length {len(value) if isinstance(value, list) else 'n/a'}")
    for index, example in enumerate(value):
        if not isinstance(example, dict) or not isinstance(example.get("messages"), list):
            raise ValueError(f"example {index} is missing a messages list")
        for message in example["messages"]:
            if not isinstance(message, dict) or message.get("role") not in {"system", "user", "assistant"} or not isinstance(message.get("content"), str):
                raise ValueError(f"example {index} contains an invalid message")
    return value


def build_prompt(template: str, opener: str, curriculum_area: str) -> str:
    return template.replace("{TOPIC_QUESTION}", opener).replace("{CURRICULUM_AREA}", curriculum_area)


def request_generation(client: httpx.Client, api_key: str, model: str, base_url: str, prompt: str, timeout: float, retries: int) -> str:
    url = f"{base_url.rstrip('/')}/chat/completions"
    payload = {
        "model": model,
        "temperature": 0.7,
        "max_tokens": 6000,
        "reasoning_effort": "low",
        "messages": [{"role": "user", "content": prompt}],
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    for attempt in range(retries + 1):
        try:
            response = client.post(url, headers=headers, json=payload, timeout=timeout)
            if response.status_code in {429, 500, 502, 503, 504} and attempt < retries:
                retry_after = response.headers.get("retry-after")
                try:
                    delay = float(retry_after) if retry_after else 2 ** attempt
                except ValueError:
                    delay = 2 ** attempt
                time.sleep(min(120, max(1, delay)))
                continue
            response.raise_for_status()
            body = response.json()
            message = body["choices"][0]["message"]
            return message.get("content") or message.get("reasoning") or ""
        except (httpx.HTTPError, KeyError, IndexError, TypeError, json.JSONDecodeError):
            if attempt >= retries:
                raise
            time.sleep(min(30, 2 ** attempt))
    raise RuntimeError("generation request failed")


def load_topics() -> list[dict[str, str]]:
    with WORKLIST_PATH.open(encoding="utf-8-sig", newline="") as stream:
        return list(csv.DictReader(stream))


def canonicalize_opener(examples: list[dict], opener: str) -> list[dict]:
    for example in examples:
        for message in example["messages"]:
            if message["role"] == "user":
                message["content"] = opener
                break
    return examples


def load_completed(raw_dir: Path) -> dict[str, list[dict]]:
    completed = {}
    for path in raw_dir.glob("*.json"):
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
            completed[record["opener"]] = canonicalize_opener(record["examples"], record["opener"])
        except (OSError, ValueError, KeyError, TypeError):
            continue
    return completed


def write_jsonl(path: Path, examples: list[dict]) -> None:
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8") as stream:
        for example in examples:
            stream.write(json.dumps(example, ensure_ascii=False) + "\n")
    temporary.replace(path)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, help="process at most this many topics")
    parser.add_argument("--start", type=int, default=0, help="zero-based worklist offset")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--raw-dir", type=Path, default=DEFAULT_RAW_DIR)
    parser.add_argument("--curriculum-area", default="Grade 10 Nepal SEE science")
    parser.add_argument("--timeout", type=float, default=180.0)
    parser.add_argument("--retries", type=int, default=8)
    parser.add_argument("--generation-attempts", type=int, default=3)
    parser.add_argument("--no-resume", action="store_true")
    parser.add_argument("--failure-log", type=Path, default=HERE / "regeneration_failures.jsonl")
    parser.add_argument("--fail-fast", action="store_true", help="stop on the first exhausted topic")
    args = parser.parse_args()

    api_key, model, base_url = load_settings()
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    topics = load_topics()[args.start :]
    if args.limit is not None:
        topics = topics[: args.limit]
    args.raw_dir.mkdir(parents=True, exist_ok=True)
    completed = {} if args.no_resume else load_completed(args.raw_dir)

    all_examples = []
    for topic in load_topics():
        raw = completed.get(topic["opener"])
        if raw:
            all_examples.extend(raw)

    with httpx.Client() as client:
        for number, topic in enumerate(topics, start=args.start + 1):
            opener = topic["opener"]
            if opener in completed and not args.no_resume:
                print(f"[{number}/108] resume {opener}")
                continue
            print(f"[{number}/108] generating {opener}", flush=True)
            prompt = build_prompt(template, opener, args.curriculum_area)
            examples = None
            response = ""
            try:
                for attempt in range(1, args.generation_attempts + 1):
                    response = request_generation(client, api_key, model, base_url, prompt, args.timeout, args.retries)
                    (args.raw_dir / f"{number:03d}.attempt{attempt}.response.txt").write_text(response, encoding="utf-8")
                    try:
                        examples = canonicalize_opener(parse_json_array(response), opener)
                        break
                    except (ValueError, json.JSONDecodeError) as exc:
                        if attempt == args.generation_attempts:
                            raise
                        prompt += f"\n\nYour previous response was invalid: {exc}. Return exactly 16 items in one JSON array, with no reasoning or commentary."
                        print(f"  invalid batch ({exc}); retrying", flush=True)
            except Exception as exc:
                failure = {"index": number, "opener": opener, "error": f"{type(exc).__name__}: {exc}"}
                with args.failure_log.open("a", encoding="utf-8") as stream:
                    stream.write(json.dumps(failure, ensure_ascii=False) + "\n")
                print(f"  FAILED and recorded: {failure['error']}", flush=True)
                if args.fail_fast:
                    raise
                continue
            if examples is None:
                raise RuntimeError("generation produced no examples")
            completed[opener] = examples
            (args.raw_dir / f"{number:03d}.json").write_text(
                json.dumps({"opener": opener, "model": model, "examples": examples}, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            all_examples = [example for topic_row in load_topics() for example in completed.get(topic_row["opener"], [])]
            write_jsonl(args.output, all_examples)
            print(f"  saved 16 examples ({len(all_examples)} total)", flush=True)

    write_jsonl(args.output, all_examples)
    print(f"Wrote {len(all_examples)} examples to {args.output}")


if __name__ == "__main__":
    main()