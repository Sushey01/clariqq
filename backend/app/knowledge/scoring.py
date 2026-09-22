"""Mastery formulas from the FYP interim report §4.1.

st = sim * coherence
m_{t+1} = m_t + alpha * (st - m_t)
m0 = 0.5, alpha = 0.25
confused if st < 0.40 on three consecutive updates for the same node.

Embeddings are optional. Token overlap is the default so chat still works
when Ollama is down, and tests do not need a live embedder.
"""

from __future__ import annotations

import math
import re

from app.knowledge.graph import nodes

ALPHA = 0.25
M0 = 0.5
LOW_ST = 0.40
CONFUSED_STREAK = 3
COPY_OVERLAP = 0.80
MAP_FLOOR = 0.08

_TOKEN_RE = re.compile(r"[a-z0-9]+", re.I)
_STOP = frozenset(
    {
        "a",
        "an",
        "the",
        "is",
        "are",
        "was",
        "what",
        "why",
        "how",
        "do",
        "does",
        "of",
        "in",
        "to",
        "and",
        "or",
        "for",
        "with",
        "about",
        "you",
        "your",
        "i",
        "we",
        "it",
    }
)


def tokens(text: str) -> set[str]:
    return {
        word
        for word in _TOKEN_RE.findall((text or "").lower())
        if len(word) > 2 and word not in _STOP
    }


def cosine_sets(left: set[str], right: set[str]) -> float:
    if not left or not right:
        return 0.0
    overlap = len(left & right)
    return overlap / math.sqrt(len(left) * len(right))


def similarity(student_text: str, curriculum_text: str) -> float:
    return cosine_sets(tokens(student_text), tokens(curriculum_text))


def coherence(student_text: str, curriculum_text: str) -> float:
    words = [word for word in (student_text or "").split() if word.strip()]
    if len(words) < 5:
        return 0.3
    student = tokens(student_text)
    curriculum = tokens(curriculum_text)
    if student and curriculum:
        overlap = len(student & curriculum) / len(student)
        if overlap >= COPY_OVERLAP:
            return 0.5
    return 1.0


def next_mastery(m: float, st: float) -> float:
    updated = m + ALPHA * (st - m)
    return max(0.0, min(1.0, updated))


def map_concept(text: str) -> tuple[str | None, float]:
    """Best node id by alias/name token overlap. None if below MAP_FLOOR."""
    query = tokens(text)
    if not query:
        return None, 0.0
    best_id = None
    best = 0.0
    for item in nodes():
        blob = " ".join(
            [item["id"].replace("_", " "), item["name"], item["chapter"], *item.get("aliases", [])]
        )
        score = cosine_sets(query, tokens(blob))
        if score > best:
            best = score
            best_id = item["id"]
    if best < MAP_FLOOR:
        return None, best
    return best_id, best
