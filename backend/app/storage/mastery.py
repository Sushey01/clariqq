"""SQLite mastery rows. Separate tables from materials, same users.sqlite3 file."""

from __future__ import annotations

import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

from app.config import BACKEND_DIR
from app.knowledge.scoring import CONFUSED_STREAK, LOW_ST, M0, next_mastery

DB_PATH = Path(BACKEND_DIR / "storage" / "users.sqlite3")


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge_mastery (
            user_id TEXT NOT NULL,
            concept_id TEXT NOT NULL,
            m REAL NOT NULL,
            confused INTEGER NOT NULL DEFAULT 0,
            low_streak INTEGER NOT NULL DEFAULT 0,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (user_id, concept_id)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS knowledge_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            concept_id TEXT NOT NULL,
            st REAL NOT NULL,
            sim REAL NOT NULL,
            coherence REAL NOT NULL,
            map_score REAL NOT NULL,
            question TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    return conn


def get_mastery_row(user_id: str, concept_id: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT * FROM knowledge_mastery
            WHERE user_id = ? AND concept_id = ?
            """,
            (user_id, concept_id),
        ).fetchone()
    if row is None:
        return None
    return dict(row)


def list_mastery(user_id: str) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT * FROM knowledge_mastery
            WHERE user_id = ?
            ORDER BY confused DESC, m ASC
            """,
            (user_id,),
        ).fetchall()
    return [dict(row) for row in rows]


def apply_score(
    user_id: str,
    concept_id: str,
    *,
    st: float,
    sim: float,
    coherence: float,
    map_score: float,
    question: str,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT * FROM knowledge_mastery
            WHERE user_id = ? AND concept_id = ?
            """,
            (user_id, concept_id),
        ).fetchone()
        previous_m = float(row["m"]) if row else M0
        low_streak = int(row["low_streak"]) if row else 0
        confused = bool(row["confused"]) if row else False

        m = next_mastery(previous_m, st)
        if st < LOW_ST:
            low_streak += 1
        else:
            low_streak = 0
        if low_streak >= CONFUSED_STREAK:
            confused = True

        conn.execute(
            """
            INSERT INTO knowledge_mastery
                (user_id, concept_id, m, confused, low_streak, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id, concept_id) DO UPDATE SET
                m = excluded.m,
                confused = excluded.confused,
                low_streak = excluded.low_streak,
                updated_at = excluded.updated_at
            """,
            (user_id, concept_id, m, 1 if confused else 0, low_streak, now),
        )
        conn.execute(
            """
            INSERT INTO knowledge_events
                (user_id, concept_id, st, sim, coherence, map_score, question, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, concept_id, st, sim, coherence, map_score, question[:500], now),
        )
        conn.commit()

    return {
        "user_id": user_id,
        "concept_id": concept_id,
        "m_before": previous_m,
        "m": m,
        "st": st,
        "sim": sim,
        "coherence": coherence,
        "map_score": map_score,
        "confused": confused,
        "low_streak": low_streak,
    }


def events_since(user_id: str, days: int = 7) -> list[dict]:
    start = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT * FROM knowledge_events
            WHERE user_id = ? AND created_at >= ?
            ORDER BY created_at DESC
            """,
            (user_id, start),
        ).fetchall()
    return [dict(row) for row in rows]


def activity_calendar(user_id: str, weeks: int = 53) -> dict:
    """Daily scored-turn counts for a GitHub-style heatmap."""
    today = datetime.now(timezone.utc).date()
    span = max(1, weeks) * 7
    start = today - timedelta(days=span - 1)
    while start.weekday() != 6:
        start -= timedelta(days=1)
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS n
            FROM knowledge_events
            WHERE user_id = ? AND created_at >= ?
            GROUP BY day
            """,
            (user_id, start.isoformat()),
        ).fetchall()
    counts = {row["day"]: int(row["n"]) for row in rows}
    days = []
    cursor = start
    while cursor <= today:
        key = cursor.isoformat()
        days.append({"date": key, "count": counts.get(key, 0)})
        cursor += timedelta(days=1)
    return {
        "days": days,
        "current_streak": _current_streak(counts, today),
        "longest_streak": _longest_streak(sorted(counts)),
        "active_days": sum(1 for item in days if item["count"] > 0),
    }


def _current_streak(counts: dict, today) -> int:
    cursor = today
    if counts.get(cursor.isoformat(), 0) == 0:
        cursor = today - timedelta(days=1)
        if counts.get(cursor.isoformat(), 0) == 0:
            return 0
    streak = 0
    while counts.get(cursor.isoformat(), 0) > 0:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _longest_streak(sorted_days: list[str]) -> int:
    if not sorted_days:
        return 0
    best = 1
    run = 1
    for index in range(1, len(sorted_days)):
        prev = datetime.fromisoformat(sorted_days[index - 1]).date()
        cur = datetime.fromisoformat(sorted_days[index]).date()
        if (cur - prev).days == 1:
            run += 1
            best = max(best, run)
        else:
            run = 1
    return best
