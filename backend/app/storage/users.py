"""SQLite users keyed by Google account sub."""

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from app.config import BACKEND_DIR

DB_PATH = Path(BACKEND_DIR / "storage" / "users.sqlite3")


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            google_sub TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    return conn


def upsert_google_user(google_sub: str, email: str, name: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        row = conn.execute(
            "SELECT id, google_sub, email, name FROM users WHERE google_sub = ?",
            (google_sub,),
        ).fetchone()
        if row is None:
            cur = conn.execute(
                "INSERT INTO users (google_sub, email, name, created_at) VALUES (?, ?, ?, ?)",
                (google_sub, email, name, now),
            )
            conn.commit()
            user_id = cur.lastrowid
            return {
                "id": str(user_id),
                "google_sub": google_sub,
                "email": email,
                "name": name,
            }
        conn.execute(
            "UPDATE users SET email = ?, name = ? WHERE google_sub = ?",
            (email, name, google_sub),
        )
        conn.commit()
        return {
            "id": str(row["id"]),
            "google_sub": row["google_sub"],
            "email": email,
            "name": name,
        }


def get_user(user_id: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT id, google_sub, email, name FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    if row is None:
        return None
    return {
        "id": str(row["id"]),
        "google_sub": row["google_sub"],
        "email": row["email"],
        "name": row["name"],
    }
