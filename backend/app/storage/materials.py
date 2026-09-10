"""SQLite catalog of student-uploaded files (not the vector search index)."""

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
        CREATE TABLE IF NOT EXISTS materials (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            mime TEXT NOT NULL,
            path TEXT NOT NULL,
            indexed INTEGER NOT NULL DEFAULT 0,
            index_error TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    return conn


def _row_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "filename": row["filename"],
        "mime": row["mime"],
        "path": row["path"],
        "indexed": bool(row["indexed"]),
        "index_error": row["index_error"],
        "created_at": row["created_at"],
    }


def create_material(
    material_id: str,
    user_id: str,
    filename: str,
    mime: str,
    path: str,
) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO materials (id, user_id, filename, mime, path, indexed, index_error, created_at)
            VALUES (?, ?, ?, ?, ?, 0, NULL, ?)
            """,
            (material_id, user_id, filename, mime, path, now),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM materials WHERE id = ?", (material_id,)).fetchone()
    return _row_to_dict(row)


def set_indexed(material_id: str, indexed: bool, index_error: str | None = None) -> None:
    with _connect() as conn:
        conn.execute(
            "UPDATE materials SET indexed = ?, index_error = ? WHERE id = ?",
            (1 if indexed else 0, index_error, material_id),
        )
        conn.commit()


def list_materials(user_id: str) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT * FROM materials WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,),
        ).fetchall()
    return [_row_to_dict(row) for row in rows]


def get_material(material_id: str, user_id: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM materials WHERE id = ? AND user_id = ?",
            (material_id, user_id),
        ).fetchone()
    return _row_to_dict(row) if row else None


def delete_material(material_id: str, user_id: str) -> dict | None:
    existing = get_material(material_id, user_id)
    if existing is None:
        return None
    with _connect() as conn:
        conn.execute(
            "DELETE FROM materials WHERE id = ? AND user_id = ?",
            (material_id, user_id),
        )
        conn.commit()
    return existing
