"""
diversity_gate.py

Two jobs:
1. AUDIT any .jsonl file (old or newly-generated) and report which opener clusters
   fail the diversity threshold — run this on every new batch before merging it in.
2. MERGE a base dataset with regenerated topic batches, dropping the old
   low-diversity versions of any topic you've rewritten.

Usage:
    python diversity_gate.py audit v3_candidate.jsonl
    python diversity_gate.py merge base_v7.jsonl regenerated_topics.jsonl -o v3_final.jsonl
"""
import argparse
import asyncio
import collections
import csv
import json
import os
import re
import time
from pathlib import Path

from dotenv import load_dotenv


MODEL = "openai/gpt-oss-20b"
EXAMPLES_PER_TOPIC = 16
EXAMPLES_PER_CALL = 4
REPO_ROOT = Path(__file__).resolve().parents[1]


def load_jsonl(path):
    data = []
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line:
                data.append(json.loads(line))
    return data


def first_user_and_response(example):
    fu = fa = None
    for m in example["messages"]:
        if m["role"] == "user" and fu is None:
            fu = m["content"]
        if m["role"] == "assistant" and fa is None:
            fa = m["content"]
    return fu, fa


def audit(data, min_n=5, threshold=0.6):
    groups = collections.defaultdict(list)
    for d in data:
        fu, fa = first_user_and_response(d)
        groups[fu].append(fa)

    flagged = []
    for q, resps in groups.items():
        n = len(resps)
        if n < min_n:
            continue
        uniq = len(set(resps))
        ratio = uniq / n
        if ratio < threshold:
            flagged.append((q, n, uniq, ratio))

    flagged.sort(key=lambda x: x[3])
    total_flagged_examples = sum(f[1] for f in flagged)
    print(f"Examples: {len(data)}")
    print(f"Flagged clusters (ratio < {threshold}, n >= {min_n}): {len(flagged)}")
    print(f"Examples inside flagged clusters: {total_flagged_examples} "
          f"({100 * total_flagged_examples / max(len(data),1):.0f}%)\n")
    for q, n, u, r in flagged[:30]:
        print(f"  ratio={r:.2f}  n={n:3d}  unique={u:3d}  | {q[:70]}")
    return flagged


def merge(base_path, new_path, out_path):
    base = load_jsonl(base_path)
    new = load_jsonl(new_path)

    # topics being replaced = the set of first-user-messages present in the new batch
    replaced_topics = set()
    for d in new:
        fu, _ = first_user_and_response(d)
        replaced_topics.add(fu)

    kept = [d for d in base if first_user_and_response(d)[0] not in replaced_topics]
    merged = kept + new

    print(f"Base examples: {len(base)}")
    print(f"Topics being replaced: {len(replaced_topics)}")
    print(f"Old examples dropped: {len(base) - len(kept)}")
    print(f"New examples added: {len(new)}")
    print(f"Final merged dataset: {len(merged)}")

    with open(out_path, "w") as f:
        for d in merged:
            f.write(json.dumps(d, ensure_ascii=False) + "\n")

    print(f"\nWritten to {out_path}. Re-run `audit` on this file before training.")


def _extract_json_array(text):
    text = text.strip()
    fenced = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.I | re.S)
    if fenced:
        text = fenced.group(1).strip()
    start, end = text.find("["), text.rfind("]")
    if start < 0 or end < start:
        raise ValueError("model response did not contain a JSON array")
    value = json.loads(text[start : end + 1])
    if not isinstance(value, list) or len(value) != EXAMPLES_PER_CALL:
        size = len(value) if isinstance(value, list) else type(value).__name__
        raise ValueError(f"expected {EXAMPLES_PER_CALL} examples, got {size}")
    return value


def _canonicalize(examples, opener):
    for example in examples:
        messages = example.get("messages")
        if not isinstance(messages, list):
            raise ValueError("example is missing messages")
        for message in messages:
            if message.get("role") == "user":
                message["content"] = opener
                break
    return examples


def _generation_prompt(opener, batch):
    return f'''You are generating training data for a Socratic science tutor chatbot (Grade 10, Nepal SEE curriculum). The tutor NEVER gives the final answer directly, guides with questions, and adapts to the student's actual response.

Topic / student opener: "{opener}"

Generate exactly 4 separate example conversations for this exact opener. This is batch {batch} of 4. Make every example distinct in sentence structure, phrasing, and specific fact pattern. Rotate broad/definitional, phenomenon-specific, compare/contrast, and misconception-as-fact entry framings. Also vary the follow-up state: correct, partially correct, wrong, stuck, or off-topic. Correct answers must be acknowledged and moved forward without a redundant question; stuck students need a concrete hint; misconceptions need a counter-example. Keep tutor turns to 1-3 sentences.

Return ONLY a valid JSON array of exactly 4 objects in this schema: [{{"messages": [{{"role": "system", "content": "..."}}, {{"role": "user", "content": "..."}}, {{"role": "assistant", "content": "..."}}, ...]}}]'''


async def _generate_batch(client, semaphore, opener, batch, retries):
    prompt = _generation_prompt(opener, batch)
    async with semaphore:
        for attempt in range(retries):
            try:
                response = await client.chat.completions.create(
                    model=MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.9,
                )
                message = response.choices[0].message
                content = message.content or getattr(message, "reasoning", "")
                return _extract_json_array(content)
            except Exception as exc:
                if attempt == retries - 1:
                    raise
                delay = min(120, 2**attempt)
                print(f"  {opener[:45]} batch {batch} retry: {exc}; waiting {delay}s", flush=True)
                await asyncio.sleep(delay)


async def generate(worklist_path, out_dir, concurrency, retries):
    try:
        from groq import AsyncGroq
    except ImportError as exc:
        raise SystemExit("Install the Groq client first: pip install groq") from exc
    load_dotenv(REPO_ROOT / ".env", override=False)
    api_key = os.getenv("GROQ_API_KEY1", "").strip() or os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("GROQ_API_KEY is missing from the environment or repo .env")
    with open(worklist_path, encoding="utf-8-sig", newline="") as stream:
        topics = [row["opener"] for row in csv.DictReader(stream)]
    output = Path(out_dir)
    output.mkdir(parents=True, exist_ok=True)
    semaphore = asyncio.Semaphore(concurrency)
    started = time.monotonic()
    async with AsyncGroq(api_key=api_key) as client:
        async def one_topic(opener):
            safe = re.sub(r"[^a-zA-Z0-9]+", "_", opener).strip("_")[:60]
            path = output / f"{safe}.jsonl"
            if path.exists() and sum(1 for _ in path.open(encoding="utf-8")) == EXAMPLES_PER_TOPIC:
                print(f"SKIP: {opener[:60]}", flush=True)
                return
            batches = await asyncio.gather(*(
                _generate_batch(client, semaphore, opener, batch, retries)
                for batch in range(1, 5)
            ))
            examples = _canonicalize([item for batch in batches for item in batch], opener)
            if len(examples) != EXAMPLES_PER_TOPIC:
                raise ValueError(f"topic produced {len(examples)} examples")
            with path.open("w", encoding="utf-8") as stream:
                for example in examples:
                    stream.write(json.dumps(example, ensure_ascii=False) + "\n")
            print(f"DONE: {opener[:60]} ({len(examples)})", flush=True)

        results = await asyncio.gather(*(one_topic(topic) for topic in topics), return_exceptions=True)
    failures = [result for result in results if isinstance(result, Exception)]
    print(f"Processed {len(topics)} topics in {time.monotonic() - started:.0f}s; failures: {len(failures)}")
    for failure in failures:
        print(f"  FAILED: {failure}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="cmd", required=True)

    p_audit = sub.add_parser("audit")
    p_audit.add_argument("path")
    p_audit.add_argument("--min_n", type=int, default=5)
    p_audit.add_argument("--threshold", type=float, default=0.6)

    p_merge = sub.add_parser("merge")
    p_merge.add_argument("base_path")
    p_merge.add_argument("new_path")
    p_merge.add_argument("-o", "--out", required=True)

    p_generate = sub.add_parser("generate")
    p_generate.add_argument("--worklist", required=True)
    p_generate.add_argument("--out-dir", default="regenerated")
    p_generate.add_argument("--concurrency", type=int, default=8)
    p_generate.add_argument("--retries", type=int, default=6)

    args = parser.parse_args()

    if args.cmd == "audit":
        audit(load_jsonl(args.path), min_n=args.min_n, threshold=args.threshold)
    elif args.cmd == "merge":
        merge(args.base_path, args.new_path, args.out)
    elif args.cmd == "generate":
        asyncio.run(generate(args.worklist, args.out_dir, args.concurrency, args.retries))
