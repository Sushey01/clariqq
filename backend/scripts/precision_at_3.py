"""Precision@3 on the current Chroma textbook index (FYP Objective 1).

A retrieved chunk is relevant when it mentions the labelled concept: the gold
phrase, its stem, or the textbook's own wording (see app.retrieval_eval).
Precision@3 is (relevant chunks among the top 3) / 3. The interim report
target is a mean of at least 0.85. The exact-phrase score is written too.

    python backend/scripts/precision_at_3.py
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from app.config import CHROMA_DIR
from app.retrieval_eval import (
    chunk_is_relevant,
    exact_precision_at_3,
    precision_at_3,
    search_text,
)
from app.storage.chroma import retrieve_documents

GOLD = BACKEND / "eval" / "retrieval_gold.jsonl"
RESULT = BACKEND / "eval" / "precision_at_3_result.json"


def load_gold(path: Path) -> list[dict]:
    rows = []
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        rows.append(json.loads(stripped))
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--gold", type=Path, default=GOLD)
    parser.add_argument("--out", type=Path, default=RESULT)
    parser.add_argument("--previous", type=float, default=None)
    args = parser.parse_args()
    previous = args.previous
    if previous is None and args.out.is_file():
        previous = json.loads(args.out.read_text(encoding="utf-8")).get("precision_at_3")
    rows = load_gold(args.gold)
    details = []
    for item in rows:
        docs = retrieve_documents(item["query"], user_id=None)
        texts = [doc.page_content for doc in docs]
        details.append(
            {
                "query": item["query"],
                "search_text": search_text(item["query"]),
                "phrase": item["phrase"],
                "subject": item.get("subject"),
                "precision_at_3": precision_at_3(texts, item["phrase"]),
                "exact_precision_at_3": exact_precision_at_3(texts, item["phrase"]),
                "top3_relevant": [
                    chunk_is_relevant(text, item["phrase"]) for text in texts[:3]
                ],
            }
        )
    count = len(details) or 1
    mean = sum(item["precision_at_3"] for item in details) / count
    exact = sum(item["exact_precision_at_3"] for item in details) / count
    by_subject = {}
    for subject in sorted({item["subject"] for item in details if item["subject"]}):
        scores = [item["precision_at_3"] for item in details if item["subject"] == subject]
        by_subject[subject] = round(sum(scores) / len(scores), 3)
    result = {
        "date": date.today().isoformat(),
        "queries": len(details),
        "judgments": sum(len(item.get("examples") or []) for item in rows),
        "precision_at_3": round(mean, 3),
        "exact_phrase_precision_at_3": round(exact, 3),
        "previous_precision_at_3": previous,
        "target": 0.85,
        "meets_target": mean >= 0.85,
        "by_subject": by_subject,
        "definition": (
            "Precision@3 = (top-3 chunks that mention the concept) / 3, averaged over all "
            "gold queries. A chunk mentions the concept if it contains the gold phrase, its "
            "stem (rusting -> rust), or listed textbook wording (voltage -> potential "
            "difference, neutralisation -> neutralization). exact_phrase_precision_at_3 "
            "requires the literal gold phrase. Labels are phrase judgments on the indexed "
            "textbook, not a teacher panel and not transcribed NEB past papers."
        ),
        "index": {
            "store": "Chroma",
            "path": str(CHROMA_DIR),
            "embeddings": "nomic-embed-text (Ollama)",
        },
        "query_cleaning": "Classroom filler such as 'in Class 10 science' is removed before embedding.",
        "retrieval": (
            "Vector search returns 12 textbook chunks; they are re-ordered so chunks containing "
            "the query's science words come first, then the top 3 are scored. Gold labels are "
            "also word-based, so this reranker and the metric share a lexical signal."
        ),
        "index_build": (
            "backend/scripts/rebuild_textbook_index.py: running headers, page numbers and "
            "reprint lines removed; ~1200-character chunks with 200 overlap. Scanned PDFs "
            "CDC2017_ScienceGrade10EN.pdf and grade-10-science-and-technology-part-i.pdf "
            "have no text layer and are not indexed."
        ),
        "per_query": details,
    }
    args.out.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(
        f"queries={len(details)} precision_at_3={mean:.3f} exact={exact:.3f} "
        f"previous={previous} target=0.85"
    )
    print(f"wrote {args.out}")
    weak = [item for item in details if item["precision_at_3"] < 1]
    print(f"queries_below_1={len(weak)}")


if __name__ == "__main__":
    main()
