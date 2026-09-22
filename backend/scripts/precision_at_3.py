"""Precision@3 on the current Chroma textbook index (FYP Objective 1).

Does not migrate to pgvector. Fill gold JSONL with NEB-style queries as you label them.

    python backend/scripts/precision_at_3.py --gold backend/eval/retrieval_gold.sample.jsonl

Gold line:

    {"query": "why does ice float", "relevant": ["substring that must appear in a retrieved chunk"]}
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.storage.chroma import retrieve_documents


def precision_at_3(query: str, needles: list[str]) -> float:
    docs = retrieve_documents(query, user_id=None)[:3]
    if not docs:
        return 0.0
    hits = 0
    blob = " ".join(doc.page_content.lower() for doc in docs)
    for needle in needles:
        if needle.lower() in blob:
            hits += 1
    return hits / max(len(needles), 1)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--gold",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "eval" / "retrieval_gold.sample.jsonl",
    )
    args = parser.parse_args()
    lines = [
        json.loads(line)
        for line in args.gold.read_text(encoding="utf-8").splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    scores = [precision_at_3(item["query"], item["relevant"]) for item in lines]
    mean = sum(scores) / len(scores) if scores else 0.0
    print(f"queries={len(scores)} mean_overlap_precision={mean:.3f}")
    print("Target in the interim report is Precision@3 >= 0.85 on 100 labelled NEB queries.")
    print("This sample file is a template; expand it with 300 passage judgments.")


if __name__ == "__main__":
    main()
