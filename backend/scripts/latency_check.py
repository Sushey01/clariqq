"""Time POST /api/chat on the API that is already running.

Writes one JSON result. Does not start a server and does not change the model.

    python backend/scripts/latency_check.py --url http://127.0.0.1:8000
"""

from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
OUT = BACKEND / "eval" / "latency_result.json"

QUESTIONS = [
    "What is density?",
    "Why does ice float on water?",
    "Explain photosynthesis in one guiding question.",
    "What is an ionic bond?",
    "How does the human eye form an image?",
]


def post_json(url: str, payload: dict, timeout: float) -> tuple[int, dict, float]:
    data = json.dumps(payload).encode()
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    started = time.perf_counter()
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            body = json.loads(response.read().decode())
            return response.status, body, time.perf_counter() - started
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode(errors="replace")
        try:
            body = json.loads(raw)
        except json.JSONDecodeError:
            body = {"detail": raw[:500]}
        return exc.code, body, time.perf_counter() - started


def get_json(url: str, timeout: float) -> dict:
    with urllib.request.urlopen(url, timeout=timeout) as response:
        return json.loads(response.read().decode())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    parser.add_argument("--timeout", type=float, default=180)
    parser.add_argument("--out", type=Path, default=OUT)
    args = parser.parse_args()
    base = args.url.rstrip("/")
    health = get_json(f"{base}/health", timeout=10)
    rows = []
    for index, question in enumerate(QUESTIONS):
        status, body, elapsed = post_json(
            f"{base}/api/chat",
            {
                "question": question,
                "session_id": f"latency-{date.today().isoformat()}-{index}",
                "socratic_mode": "strict",
            },
            timeout=args.timeout,
        )
        answer = body.get("answer") if isinstance(body, dict) else ""
        rows.append(
            {
                "question": question,
                "status": status,
                "seconds": round(elapsed, 3),
                "answer_words": len((answer or "").split()),
                "error": None if status == 200 else body,
            }
        )
        print(f"{index + 1}/{len(QUESTIONS)} status={status} seconds={elapsed:.1f}")
    ok = [row["seconds"] for row in rows if row["status"] == 200]
    result = {
        "date": date.today().isoformat(),
        "health": health,
        "target_seconds": 5,
        "note": (
            "Sequential single-user times. The interim bar is also 10 concurrent "
            "sessions, which this run does not simulate. If status is not 200, "
            "seconds is the time until the error, not the time until a tutor reply."
        ),
        "queries": rows,
        "ok": len(ok),
        "median_seconds": round(sorted(ok)[len(ok) // 2], 3) if ok else None,
        "max_seconds": round(max(ok), 3) if ok else None,
        "meets_5s": bool(ok) and max(ok) <= 5,
    }
    args.out.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(f"wrote {args.out}")


if __name__ == "__main__":
    main()
