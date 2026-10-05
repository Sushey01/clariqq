"""Load the static SEE concept graph. No database, no LLM."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

_GRAPH_PATH = Path(__file__).resolve().parent / "concepts.json"


@lru_cache(maxsize=1)
def load_graph() -> dict:
    return json.loads(_GRAPH_PATH.read_text(encoding="utf-8"))


def nodes() -> list[dict]:
    return load_graph()["nodes"]


def node_by_id() -> dict[str, dict]:
    return {item["id"]: item for item in nodes()}


def edges() -> list[dict]:
    return load_graph()["edges"]


def counts() -> dict:
    return dict(load_graph()["counts"])
