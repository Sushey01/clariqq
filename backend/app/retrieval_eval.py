"""Precision@3 for the textbook index. No network, no Chroma."""

from __future__ import annotations

import re

# Textbook wording for a gold phrase, where the syllabus name and the page differ.
TEXTBOOK_WORDING: dict[str, tuple[str, ...]] = {
    "rusting": ("rust",),
    "voltage": ("volt", "potential difference"),
    "potential difference": ("voltage", "volt"),
    "neutralisation": ("neutralization", "neutralise", "neutralize"),
    "cell organelles": ("organelle",),
    "si units": ("si unit", "s.i. unit"),
    "oxidation": ("oxidise", "oxidize", "oxidised", "oxidized"),
    "reduction": ("reduce", "reducing agent"),
    "circulation": ("circulatory", "blood vessel"),
    "immunity": ("immune",),
    "pathogen": ("disease-causing", "germs"),
    "reactivity": ("reactive", "reactivity series"),
    "litmus": ("litmus",),
    "balanced equation": ("balanced chemical equation", "balancing"),
    "rate of reaction": ("rate of chemical reaction", "speed of reaction"),
    "plant hormones": ("phytohormone", "auxin", "gibberellin"),
    "biodiversity": ("biological diversity",),
    "conservation of energy": ("law of conservation of energy", "energy can neither"),
    "human health": ("health",),
}


def _stem(word: str) -> str:
    for suffix in ("isation", "ization", "ing", "es", "s"):
        if word.endswith(suffix) and len(word) - len(suffix) >= 4:
            return word[: -len(suffix)]
    return word


def phrase_forms(phrase: str) -> list[str]:
    """The gold phrase, its singular/stem form, and listed textbook wording."""
    low = phrase.lower().strip()
    forms = {low}
    words = low.split()
    forms.add(" ".join(words[:-1] + [_stem(words[-1])]) if words else low)
    forms.update(TEXTBOOK_WORDING.get(low, ()))
    return sorted(form for form in forms if form)


def chunk_is_relevant(text: str, phrase: str) -> bool:
    low = (text or "").lower()
    return any(form in low for form in phrase_forms(phrase))


def precision_at_3(texts: list[str], phrase: str) -> float:
    """Fraction of the top 3 passages that mention the concept."""
    top = list(texts)[:3]
    hits = sum(1 for text in top if chunk_is_relevant(text, phrase))
    return hits / 3


def exact_precision_at_3(texts: list[str], phrase: str) -> float:
    """Stricter score: the exact gold phrase must appear."""
    low = phrase.lower()
    top = list(texts)[:3]
    return sum(1 for text in top if low in (text or "").lower()) / 3


_FILLER = re.compile(
    r"(\bin (the )?class\s*10( science)?\b"
    r"|\bin (the )?grade\s*10( science)?\b"
    r"|\b(in|for) the see( science)?( syllabus)?\b"
    r"|\bsee science syllabus\b"
    r"|\bwhere should i look in the textbook\??"
    r"|\bi am confused about\b"
    r"|\bi'?m confused about\b"
    r"|\bexplain\b|\bwhat is\b|\bwhat are\b)",
    re.I,
)
_HOW_WORKS = re.compile(r"^how (does|do) (.+?) work$", re.I)


def search_text(query: str) -> str:
    """Keep the science words; drop classroom filler that matches page headers."""
    cleaned = _FILLER.sub(" ", query or "")
    cleaned = re.sub(r"[?.!]+", " ", cleaned)
    cleaned = " ".join(cleaned.split())
    cleaned = _HOW_WORKS.sub(r"\2", cleaned)
    return cleaned or (query or "").strip()
