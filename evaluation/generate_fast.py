"""
generate_fast.py

Concurrent generation of diverse Socratic examples via Groq, for the topics
listed in script_collapse_worklist.csv.

Speed levers used here (none of them are GPU/CPU related — Groq does the inference):
  1. Splits each topic's 16 examples into 4 smaller calls of 4 examples each
     -> shorter generations, less truncation, faster individual responses.
  2. Runs multiple calls concurrently with asyncio + a semaphore
     -> the real fix for "57/108 is slow", since sequential calls waste time
        waiting on network + generation for each one before starting the next.
  3. Retries on rate-limit / transient errors with backoff, instead of stalling.
  4. Resumable: writes each topic's output to its own file as soon as it's
     done, and skips topics that already have a completed file, so a crash
     or Ctrl+C doesn't lose progress on topics already finished.

Setup:
    pip install groq
    export GROQ_API_KEY=your_key_here

Usage:
    python generate_fast.py --worklist script_collapse_worklist.csv --out_dir regenerated --concurrency 8
"""
import argparse, asyncio, csv, json, os, re, time
from pathlib import Path

from groq import AsyncGroq
from dotenv import load_dotenv

MODEL = "openai/gpt-oss-20b"
REPO_ROOT = Path(__file__).resolve().parents[1]
EXAMPLES_PER_TOPIC = 16
EXAMPLES_PER_CALL = 4  # 4 calls of 4 per topic instead of 1 call of 16

PROMPT_TEMPLATE = """You are generating training data for a Socratic science tutor chatbot (Grade 10, Nepal SEE curriculum). The tutor NEVER gives the final answer directly, guides with questions, and adapts to the student's actual response.

Topic / student opener: "{topic}"

Generate {n} SEPARATE example conversations for this exact opener. Each must be DISTINCT — do not reuse sentence structure, phrasing, or the same underlying fact pattern across examples. This is batch {batch_idx} of 4 for this topic; make sure these examples differ from typical templated responses (avoid starting every example with "Here's a question for you:", "Consider this:", "Let's think about this:" — vary freely, including no lead-in at all).

Rotate across these axes:
ENTRY FRAMING: broad/definitional, phenomenon-specific, compare/contrast, misconception-as-fact
STUDENT STATE on the follow-up turn: correct (tutor acknowledges AND MOVES ON, no redundant question), partially correct, wrong/misconception (tutor challenges), "I don't know" (tutor gives a concrete hint), off-topic switch

Keep tutor turns to 1-3 sentences.

Output ONLY a valid JSON array, no commentary, no markdown fences. Schema:
[{{"messages": [{{"role": "system", "content": "..."}}, {{"role": "user", "content": "..."}}, {{"role": "assistant", "content": "..."}}, {{"role": "user", "content": "..."}}, {{"role": "assistant", "content": "..."}}]}}]
"""


def extract_json_array(text):
    text = text.strip()
    text = re.sub(r"^```(json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1:
        raise ValueError("No JSON array found in response")
    value = json.loads(text[start:end + 1])
    if not isinstance(value, list) or len(value) != EXAMPLES_PER_CALL:
        raise ValueError(f"Expected exactly {EXAMPLES_PER_CALL} examples, got {len(value) if isinstance(value, list) else type(value).__name__}")
    return value


async def generate_batch(client, sem, topic, batch_idx, max_retries=4):
    prompt = PROMPT_TEMPLATE.format(topic=topic, n=EXAMPLES_PER_CALL, batch_idx=batch_idx)
    async with sem:
        for attempt in range(max_retries):
            try:
                resp = await client.chat.completions.create(
                    model=MODEL,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.9,
                )
                message = resp.choices[0].message
                content = message.content or getattr(message, "reasoning", "")
                if not content:
                    raise ValueError("Model returned empty content and reasoning")
                return extract_json_array(content)
            except Exception as e:
                wait = 2 ** attempt
                print(f"  [{topic[:40]}] batch {batch_idx} attempt {attempt+1} failed: {e} -> retry in {wait}s")
                await asyncio.sleep(wait)
        print(f"  [{topic[:40]}] batch {batch_idx} FAILED after {max_retries} attempts, skipping")
        return []


async def generate_topic(client, sem, topic, out_dir):
    safe_name = re.sub(r"[^a-zA-Z0-9]+", "_", topic)[:60]
    out_path = os.path.join(out_dir, f"{safe_name}.jsonl")
    if os.path.exists(out_path):
        print(f"SKIP (already done): {topic[:60]}")
        return

    batches = await asyncio.gather(*[
        generate_batch(client, sem, topic, i + 1) for i in range(4)
    ])
    all_examples = [ex for batch in batches for ex in batch]

    with open(out_path, "w") as f:
        for ex in all_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    print(f"DONE ({len(all_examples)} examples): {topic[:60]}")


async def main(worklist_path, out_dir, concurrency):
    os.makedirs(out_dir, exist_ok=True)
    load_dotenv(REPO_ROOT / ".env", override=False)

    with open(worklist_path) as f:
        reader = csv.DictReader(f)
        topics = [row["opener"] for row in reader]

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise SystemExit("Set GROQ_API_KEY environment variable first.")

    client = AsyncGroq(api_key=api_key)
    # semaphore limits concurrent in-flight calls (4 sub-calls per topic),
    # tune this down if you hit Groq rate-limit errors repeatedly
    sem = asyncio.Semaphore(concurrency)

    t0 = time.time()
    await asyncio.gather(*[generate_topic(client, sem, t, out_dir) for t in topics])
    print(f"\nAll topics processed in {time.time() - t0:.0f}s. Output dir: {out_dir}")
    print("Next: cat regenerated/*.jsonl > regenerated_topics.jsonl, then run diversity_gate.py audit on it.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--worklist", required=True)
    parser.add_argument("--out_dir", default="regenerated")
    parser.add_argument("--concurrency", type=int, default=8,
                         help="Max concurrent in-flight API calls. Lower this if you hit rate limits.")
    args = parser.parse_args()

    asyncio.run(main(args.worklist, args.out_dir, args.concurrency))
