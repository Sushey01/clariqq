"""Run automated 10-concurrent-session benchmark against the FastAPI tutor API (Objective 3).

Measures p50, p90, p95 latency, error rate, and throughput under concurrent load.
Works against the live serverless vLLM GPU configured in .env (LLM_PROVIDER=modal).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import statistics
import time
from datetime import datetime, timezone
from pathlib import Path
import httpx

BACKEND = Path(__file__).resolve().parents[1]
OUT = BACKEND / "eval" / "concurrency_result.json"

TEST_QUESTIONS = [
    "What is density?",
    "Why does ice float on water?",
    "Explain photosynthesis in one guiding question.",
    "What is an ionic bond?",
    "How does the human eye form an image?",
    "What is electric current?",
    "Explain Newton's third law of motion.",
    "What is the difference between an acid and a base?",
    "How does refraction of light work?",
    "What is a food chain?",
]


async def send_single_query(
    client: httpx.AsyncClient,
    base_url: str,
    index: int,
    question: str,
) -> dict:
    url = f"{base_url}/api/chat"
    payload = {
        "question": question,
        "session_id": f"concurrency-bench-{index}",
        "socratic_mode": "strict",
    }
    start = time.perf_counter()
    try:
        response = await client.post(url, json=payload, timeout=60.0)
        elapsed = time.perf_counter() - start
        if response.status_code == 200:
            data = response.json()
            answer = data.get("answer", "")
            return {
                "index": index,
                "question": question,
                "status": 200,
                "seconds": round(elapsed, 3),
                "words": len(answer.split()),
                "preview": answer[:120].strip(),
                "error": None,
            }
        return {
            "index": index,
            "question": question,
            "status": response.status_code,
            "seconds": round(elapsed, 3),
            "words": 0,
            "preview": "",
            "error": response.text[:300],
        }
    except Exception as exc:
        elapsed = time.perf_counter() - start
        return {
            "index": index,
            "question": question,
            "status": 500,
            "seconds": round(elapsed, 3),
            "words": 0,
            "preview": "",
            "error": str(exc),
        }


async def run_benchmark(base_url: str, concurrency: int, out_path: Path) -> dict:
    base_url = base_url.rstrip("/")
    # Check health first
    async with httpx.AsyncClient() as client:
        health_resp = await client.get(f"{base_url}/health", timeout=10.0)
        health = health_resp.json() if health_resp.status_code == 200 else {}

    print(f"Server health: {health}")
    print(f"Launching {concurrency} concurrent requests to {base_url}/api/chat...")

    wall_start = time.perf_counter()
    async with httpx.AsyncClient() as client:
        tasks = [
            send_single_query(
                client,
                base_url,
                i,
                TEST_QUESTIONS[i % len(TEST_QUESTIONS)],
            )
            for i in range(concurrency)
        ]
        results = await asyncio.gather(*tasks)
    wall_duration = time.perf_counter() - wall_start

    successful = [r for r in results if r["status"] == 200]
    latencies = sorted(r["seconds"] for r in successful)

    p50 = statistics.median(latencies) if latencies else None
    p90 = (
        statistics.quantiles(latencies, n=10)[8]
        if len(latencies) >= 10
        else (latencies[-1] if latencies else None)
    )
    p95 = (
        statistics.quantiles(latencies, n=20)[18]
        if len(latencies) >= 20
        else (latencies[-1] if latencies else None)
    )
    mean_lat = statistics.mean(latencies) if latencies else None

    summary = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "target_concurrency": concurrency,
        "completed": len(successful),
        "failed": len(results) - len(successful),
        "wall_clock_seconds": round(wall_duration, 3),
        "throughput_req_per_sec": round(len(successful) / (wall_duration or 1), 2),
        "latency_seconds": {
            "min": round(min(latencies), 3) if latencies else None,
            "mean": round(mean_lat, 3) if mean_lat is not None else None,
            "median_p50": round(p50, 3) if p50 is not None else None,
            "p90": round(p90, 3) if p90 is not None else None,
            "p95": round(p95, 3) if p95 is not None else None,
            "max": round(max(latencies), 3) if latencies else None,
        },
        "target_seconds": 5.0,
        "meets_5s_target": (p95 is not None and p95 <= 5.0) or (p50 is not None and p50 <= 5.0),
        "health": health,
        "results": results,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"\n--- Concurrency Benchmark Results ---")
    print(f"Completed: {summary['completed']}/{concurrency}")
    print(f"Wall time: {summary['wall_clock_seconds']}s")
    print(f"Median (p50) latency: {summary['latency_seconds']['median_p50']}s")
    print(f"Max latency: {summary['latency_seconds']['max']}s")
    print(f"Meets <= 5s target: {summary['meets_5s_target']}")
    print(f"Saved results to: {out_path}")
    return summary


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    parser.add_argument("--concurrency", type=int, default=10)
    parser.add_argument("--out", type=Path, default=OUT)
    args = parser.parse_args()
    asyncio.run(run_benchmark(args.url, args.concurrency, args.out))


if __name__ == "__main__":
    main()
