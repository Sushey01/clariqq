"""Build 100 retrieval labels from the indexed textbook, without the embedder.

A passage is relevant when it contains the concept phrase. Three example
snippets are stored per query (300 judgments). Phrases that match fewer
than 3 chunks, or more than 80, are left out so the label is neither
empty nor a word that appears on almost every page.

    python backend/scripts/build_retrieval_gold.py
"""

from __future__ import annotations

import json
import sqlite3
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
DB = BACKEND / "storage" / "chroma_db" / "chroma.sqlite3"
GRAPH = BACKEND / "app" / "knowledge" / "concepts.json"
OUT = BACKEND / "eval" / "retrieval_gold.jsonl"

# Single words that show up across unrelated chapters.
DENY = {
    "water",
    "cell",
    "light",
    "heat",
    "energy",
    "force",
    "mass",
    "atom",
    "air",
    "organ",
    "carbon",
    "work",
    "power",
    "sound",
    "acid",
    "acids",
    "base",
    "bases",
    "metal",
    "metals",
    "salt",
    "life",
    "gas",
    "iron",
    "food",
}

# Extra SEE phrases that are not already concept names, still in the index.
EXTRAS = [
    ("Physics", "newton"),
    ("Physics", "gravity"),
    ("Physics", "transformer"),
    ("Physics", "generator"),
    ("Physics", "series circuit"),
    ("Physics", "motor"),
    ("Physics", "charge"),
    ("Physics", "voltage"),
    ("Physics", "current electricity"),
    ("Chemistry", "isotope"),
    ("Chemistry", "alkali"),
    ("Chemistry", "alloy"),
    ("Chemistry", "balanced equation"),
    ("Chemistry", "ph scale"),
    ("Chemistry", "litmus"),
    ("Chemistry", "corrosion"),
    ("Chemistry", "soap"),
    ("Chemistry", "detergent"),
    ("Chemistry", "ethanol"),
    ("Chemistry", "reactivity"),
    ("Biology", "dna"),
    ("Biology", "hormone"),
    ("Biology", "enzyme"),
    ("Biology", "kidney"),
    ("Biology", "heart"),
    ("Biology", "chlorophyll"),
    ("Biology", "stomata"),
    ("Biology", "alveoli"),
    ("Biology", "nephron"),
    ("Biology", "neuron"),
    ("Biology", "nitrogen cycle"),
    ("Biology", "carbon cycle"),
    ("Biology", "ozone"),
    ("Biology", "greenhouse"),
    ("Biology", "evolution"),
    ("Biology", "solar system"),
    ("Biology", "punnett"),
]


def load_docs() -> list[tuple[str, str]]:
    con = sqlite3.connect(DB)
    rows = con.execute(
        """
        SELECT d.string_value, COALESCE(f.string_value, '')
        FROM embedding_metadata d
        LEFT JOIN embedding_metadata f ON d.id = f.id AND f.key = 'file_path'
        WHERE d.key = 'chroma:document'
        """
    ).fetchall()
    return [(text or "", path or "") for text, path in rows]


def candidates() -> list[tuple[str, str]]:
    graph = json.loads(GRAPH.read_text(encoding="utf-8"))
    rows = []
    seen = set()
    for node in graph["nodes"]:
        name = node["name"].strip()
        low = name.lower()
        if low in DENY or low in seen:
            continue
        if len(name) < 6 and " " not in name:
            continue
        seen.add(low)
        rows.append((node["subject"], name))
    for subject, phrase in EXTRAS:
        if phrase.lower() not in seen:
            seen.add(phrase.lower())
            rows.append((subject, phrase))
    return rows


def snippet(text: str, phrase: str) -> str:
    low = text.lower()
    at = low.find(phrase.lower())
    if at < 0:
        at = 0
    start = max(0, at - 40)
    return " ".join(text[start : start + 180].split())


def examples_for(docs: list[tuple[str, str]], phrase: str) -> list[str]:
    hits = []
    for text, path in docs:
        if phrase.lower() not in text.lower():
            continue
        grade = 0 if "OptScienceGrade-10" in path else 1
        hits.append((grade, snippet(text, phrase)))
    hits.sort(key=lambda item: item[0])
    chosen = []
    seen = set()
    for _grade, text in hits:
        if text in seen:
            continue
        seen.add(text)
        chosen.append(text)
        if len(chosen) == 3:
            break
    return chosen


def query_for(index: int, phrase: str) -> str:
    shown = phrase if phrase[:1].isupper() else phrase
    patterns = (
        "What is {p}?",
        "Explain {p} in Class 10 science.",
        "How does {p} work in the SEE science syllabus?",
        "I am confused about {p}. Where should I look in the textbook?",
    )
    return patterns[index % 4].format(p=shown)


def main() -> None:
    docs = load_docs()
    grouped: dict[str, list[dict]] = {"Physics": [], "Chemistry": [], "Biology": []}
    for subject, phrase in candidates():
        count = sum(1 for text, _path in docs if phrase.lower() in text.lower())
        if not 3 <= count <= 80:
            continue
        picked = examples_for(docs, phrase)
        if len(picked) < 3:
            continue
        grouped.setdefault(subject, []).append(
            {
                "subject": subject,
                "phrase": phrase,
                "matching_chunks": count,
                "examples": picked,
            }
        )

    ordered = []
    buckets = [grouped["Physics"], grouped["Chemistry"], grouped["Biology"]]
    while any(buckets) and len(ordered) < 100:
        for bucket in buckets:
            if bucket and len(ordered) < 100:
                ordered.append(bucket.pop(0))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    lines = []
    for index, item in enumerate(ordered):
        lines.append(
            {
                "query": query_for(index, item["phrase"]),
                "phrase": item["phrase"],
                "subject": item["subject"],
                "matching_chunks": item["matching_chunks"],
                "examples": item["examples"],
            }
        )
    OUT.write_text(
        "\n".join(json.dumps(line, ensure_ascii=False) for line in lines) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {len(lines)} queries to {OUT}")
    print(
        "subjects",
        {name: sum(1 for line in lines if line["subject"] == name) for name in grouped},
    )


if __name__ == "__main__":
    main()
