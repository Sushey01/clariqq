"""Classify student turns and drop retrieved chunks that do not match the question."""

from __future__ import annotations

import re
from typing import Iterable

KIND_SCIENCE = "science"
KIND_IDENTITY = "identity"
KIND_META = "meta"

_IDENTITY_RE = re.compile(
    r"\b(who are you|what are you|who is clariq|what is clariq|your name)\b",
    re.I,
)
_META_RE = re.compile(
    r"("
    r"direct answer"
    r"|giving (me )?the answer"
    r"|why are you giving"
    r"|why did you (give|tell|answer)"
    r"|you('re| are) supposed to"
    r"|not supposed to (answer|tell|give)"
    r"|stop (giving|telling|answering)"
    r"|socratic"
    r"|why don'?t you (ask|guide)"
    r")",
    re.I,
)

_STOP = frozenset(
    {
        "a",
        "an",
        "the",
        "is",
        "are",
        "was",
        "were",
        "be",
        "am",
        "do",
        "does",
        "did",
        "what",
        "why",
        "how",
        "when",
        "where",
        "who",
        "which",
        "this",
        "that",
        "these",
        "those",
        "it",
        "its",
        "you",
        "your",
        "we",
        "our",
        "they",
        "them",
        "me",
        "my",
        "i",
        "so",
        "or",
        "and",
        "but",
        "if",
        "of",
        "in",
        "on",
        "to",
        "for",
        "with",
        "from",
        "about",
        "into",
        "just",
        "please",
        "can",
        "could",
        "would",
        "should",
        "tell",
        "explain",
        "define",
        "mean",
        "means",
        "giving",
        "give",
        "gave",
        "direct",
        "answer",
        "answers",
        "question",
        "help",
    }
)

_TOKEN_RE = re.compile(r"[a-z0-9]+", re.I)


def classify_turn(text: str) -> str:
    raw = (text or "").strip()
    if not raw:
        return KIND_SCIENCE
    if _IDENTITY_RE.search(raw):
        return KIND_IDENTITY
    if _META_RE.search(raw):
        return KIND_META
    return KIND_SCIENCE


def tokens(text: str) -> set[str]:
    return {
        word
        for word in _TOKEN_RE.findall((text or "").lower())
        if len(word) > 2 and word not in _STOP
    }


def chunk_is_relevant(question: str, content: str) -> bool:
    query_tokens = tokens(question)
    if not query_tokens:
        return False
    chunk_tokens = tokens(content)
    if query_tokens & chunk_tokens:
        return True
    blob = (content or "").lower()
    return any(token in blob for token in query_tokens if len(token) >= 4)


def filter_relevant_docs(question: str, docs: Iterable) -> list:
    kept = []
    for doc in docs:
        content = getattr(doc, "page_content", "") or ""
        if chunk_is_relevant(question, content):
            kept.append(doc)
    return kept


def canned_non_science_reply(kind: str, topic: str | None) -> str | None:
    """Identity and meta turns skip the LLM so retrieval cannot hijack the topic."""
    thread = topic or "this science idea"
    if kind == KIND_IDENTITY:
        if topic:
            return (
                "I'm Clariq, a Grade 10 science AI tutor. "
                f"Shall we keep going with {thread} — what do you already know?"
            )
        return (
            "I'm Clariq, a Grade 10 science AI tutor. "
            "What Grade 10 science question should we start with?"
        )
    if kind == KIND_META:
        if topic:
            return (
                "You're right — in Strict I should have asked a question instead of defining. "
                f"What have you already heard about {thread}?"
            )
        return (
            "You're right — I should guide with a question instead of handing over the answer. "
            "What Grade 10 science idea should we work on?"
        )
    return None


def last_science_topic(history, current: str) -> str | None:
    """Most recent science question from the student (current turn, else chat history)."""
    if classify_turn(current) == KIND_SCIENCE:
        return _short(current)
    for message in reversed(list(history or [])):
        if getattr(message, "type", None) != "human":
            continue
        text = (getattr(message, "content", None) or "").strip()
        if text and classify_turn(text) == KIND_SCIENCE:
            return _short(text)
    return None


_DEF_QUESTION_RE = re.compile(
    r"^\s*(what(?:'s| is| are)\s+(?:a |an |the )?|define\s+)",
    re.I,
)
_DEF_ANSWER_RE = re.compile(
    r"\b(is a|is an|are a|are an|refers to|defined as)\b",
    re.I,
)


def definition_topic(question: str) -> str | None:
    raw = (question or "").strip()
    if not _DEF_QUESTION_RE.search(raw):
        return None
    cleaned = _DEF_QUESTION_RE.sub("", raw, count=1)
    cleaned = re.sub(r"[?!.]+$", "", cleaned).strip()
    return cleaned or None


def looks_like_definition_dump(answer: str) -> bool:
    return bool(_DEF_ANSWER_RE.search(answer or ""))


def ensure_socratic_reply(answer: str, question: str, mode: str, topic: str | None) -> str:
    """Keep strict/guided from dumping definitions or ending without a question."""
    text = (answer or "").strip()
    if mode not in ("strict", "guided"):
        return text
    def_topic = definition_topic(question)
    if def_topic and looks_like_definition_dump(text):
        return (
            f"What have you already heard about {def_topic}? "
            "Start from anything you remember, even if it is incomplete."
        )
    if "?" not in text:
        thread = topic or def_topic or "this idea"
        if text:
            return f"{text} What smaller part of {thread} should we check next?"
        return f"What do you already know about {thread}?"
    return text


def _short(text: str) -> str:
    cleaned = " ".join((text or "").split())
    if len(cleaned) <= 120:
        return cleaned
    return cleaned[:117] + "..."
