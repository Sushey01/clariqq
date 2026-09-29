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
    r"|not being socratic"
    r"|be (more )?socratic"
    r"|why (aren'?t|are not) you socratic"
    r"|why don'?t you (ask|guide)"
    r")",
    re.I,
)

_ASK_RE = re.compile(
    r"\b(what|why|how|when|where|which|explain|define|help me|understand|teach)\b",
    re.I,
)
_STUCK_RE = re.compile(
    r"\b(i don'?t know|dont know|idk|not sure|still confused|confused|no idea)\b",
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


def is_science_query(text: str) -> bool:
    """True when the student is asking about a science idea, not answering one."""
    raw = (text or "").strip()
    if not raw or classify_turn(raw) != KIND_SCIENCE:
        return False
    if _STUCK_RE.search(raw):
        return False
    if "?" in raw or _ASK_RE.search(raw):
        return True
    return len(tokens(raw)) >= 8


def retrieval_query(question: str, topic: str | None) -> str:
    """Embed the live science thread, not short answers like 'photon' or 'idk'."""
    if is_science_query(question):
        return question
    if topic:
        return f"{topic}\n{question}".strip()
    return question


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
    """Most recent science *question*, not a short student answer."""
    if is_science_query(current):
        return _short(current)
    for message in reversed(list(history or [])):
        if getattr(message, "type", None) != "human":
            continue
        text = (getattr(message, "content", None) or "").strip()
        if text and is_science_query(text):
            return _short(text)
    if classify_turn(current) == KIND_SCIENCE and current.strip():
        return _short(current)
    return None


_DEF_QUESTION_RE = re.compile(
    r"^\s*(what(?:'s| is| are)\s+(?:a |an |the )?|define\s+)",
    re.I,
)


def definition_topic(question: str) -> str | None:
    raw = (question or "").strip()
    if not _DEF_QUESTION_RE.search(raw):
        return None
    cleaned = _DEF_QUESTION_RE.sub("", raw, count=1)
    cleaned = re.sub(r"[?!.]+$", "", cleaned).strip()
    return cleaned or None


_PHI3_SPECIAL_RE = re.compile(r"\|?<\|[^|>]+?\|>")


def strip_phi3_specials(text: str) -> str:
    """Remove leaked Phi-3 role tokens so they are not saved into chat history."""
    cleaned = _PHI3_SPECIAL_RE.sub("", text or "")
    return cleaned.rstrip("|").strip()


_ROLE_LEAKS = (
    "\nuser",
    "\nUser",
    "\nstudent",
    "\nStudent",
    "\nHuman",
    "<|im_start|>",
    "<|im_end|>",
    "<|endoftext|>",
)

_STANDALONE_STARTERS = (
    "what is ",
    "what are ",
    "explain ",
    "define ",
    "why is ",
    "why do ",
    "why are ",
)
_STANDALONE_PRONOUNS = frozenset(
    {"it", "that", "this", "these", "those", "more", "simply", "again"}
)


def is_standalone_new_question(message: str) -> bool:
    """A fresh concept question should not carry the previous topic into the model."""
    msg = (message or "").strip().lower().rstrip("?").strip()
    if not any(msg.startswith(starter) for starter in _STANDALONE_STARTERS):
        return False
    words = msg.split()
    if not 2 <= len(words) <= 8:
        return False
    return not any(word in _STANDALONE_PRONOUNS for word in words)


def _drop_leaked_fact(text: str) -> str:
    """The Space hides 'Fact:' inside <plan>. A bare Fact line is not the reply."""
    kept = []
    for line in (text or "").splitlines():
        if re.match(r"^\s*fact\s*:", line, re.I):
            continue
        kept.append(line)
    cleaned = "\n".join(kept).strip()
    cleaned = re.sub(
        r"^\s*fact\s*:[^.?!]*[.?!]\s*",
        "",
        cleaned,
        count=1,
        flags=re.I,
    )
    return cleaned.strip()


def visible_tutor_reply(answer: str) -> str:
    """Hide the Space-style <plan> and cut a simulated student turn."""
    text = strip_phi3_specials(answer or "")
    for leak in _ROLE_LEAKS:
        if leak in text:
            text = text.split(leak)[0]
    if "<plan>" in text and "</plan>" in text:
        plan_start = text.find("<plan>") + len("<plan>")
        plan_end = text.find("</plan>")
        plan = text[plan_start:plan_end].strip()
        reply = text[plan_end + len("</plan>") :].strip()
        if reply:
            return _drop_leaked_fact(reply)
        for line in plan.splitlines():
            if "?" in line and not re.match(r"^\s*fact\s*:", line, re.I):
                return line.strip()
        return ""
    if "<plan>" in text:
        return ""
    return _drop_leaked_fact(text)


def _concept_label(question: str, topic: str | None) -> str:
    named = definition_topic(question)
    if named:
        return named
    raw = (topic or question or "this idea").strip()
    raw = re.sub(r"[?!.]+$", "", raw).strip()
    raw = re.sub(
        r"^(why|what|how|when|where|which)\s+(are|is|do|does|did|can)\s+",
        "",
        raw,
        flags=re.I,
    )
    return raw or "this idea"


def ensure_socratic_reply(answer: str, question: str, mode: str, topic: str | None) -> str:
    """Show the student-facing tutor text. Keep a closing question, except on goodbye."""
    text = visible_tutor_reply(answer)
    if mode not in ("strict", "guided"):
        return text
    if re.search(
        r"\b(thank you|thanks|i'?m done|that'?s all|goodbye|\bbye\b|no more questions)\b",
        question,
        re.I,
    ):
        return text
    if "?" in text:
        return text
    thread = _concept_label(question, topic)
    if text:
        return f"{text} What do you notice about {thread}?"
    return f"What do you notice about {thread}?"


def _short(text: str) -> str:
    cleaned = " ".join((text or "").split())
    if len(cleaned) <= 120:
        return cleaned
    return cleaned[:117] + "..."
