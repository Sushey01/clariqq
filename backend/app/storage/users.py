"""SQLite users: Google accounts, email signup, and seeded demo roles."""

from __future__ import annotations

import hashlib
import hmac
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from app.config import BACKEND_DIR

DB_PATH = Path(BACKEND_DIR / "storage" / "users.sqlite3")

DEMO_SUBS = {
    "student": "demo:student",
    "teacher": "demo:teacher",
    "parent": "demo:parent",
}

_PBKDF_ROUNDS = 120_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, _PBKDF_ROUNDS
    )
    return f"{salt.hex()}:{digest.hex()}"


def verify_password(password: str, stored: str | None) -> bool:
    if not stored or ":" not in stored:
        return False
    salt_hex, digest_hex = stored.split(":", 1)
    try:
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(digest_hex)
    except ValueError:
        return False
    actual = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, _PBKDF_ROUNDS
    )
    return hmac.compare_digest(actual, expected)


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
    cols = {row[1] for row in conn.execute("PRAGMA table_info(users)")}
    if "role" not in cols:
        conn.execute(
            "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student'"
        )
    if "password_hash" not in cols:
        conn.execute("ALTER TABLE users ADD COLUMN password_hash TEXT")
    conn.commit()
    return conn


def _from_row(row: sqlite3.Row) -> dict:
    keys = row.keys()
    return {
        "id": str(row["id"]),
        "google_sub": row["google_sub"],
        "email": row["email"],
        "name": row["name"],
        "role": row["role"] if "role" in keys and row["role"] else "student",
        "password_hash": row["password_hash"] if "password_hash" in keys else None,
    }


def _public(user: dict) -> dict:
    return {
        "id": user["id"],
        "google_sub": user.get("google_sub") or "",
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role") or "student",
    }


def upsert_google_user(google_sub: str, email: str, name: str) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE google_sub = ?",
            (google_sub,),
        ).fetchone()
        if row is None:
            cur = conn.execute(
                """
                INSERT INTO users (google_sub, email, name, created_at, role)
                VALUES (?, ?, ?, ?, 'student')
                """,
                (google_sub, email, name, now),
            )
            conn.commit()
            return {
                "id": str(cur.lastrowid),
                "google_sub": google_sub,
                "email": email,
                "name": name,
                "role": "student",
            }
        conn.execute(
            "UPDATE users SET email = ?, name = ? WHERE google_sub = ?",
            (email, name, google_sub),
        )
        conn.commit()
        updated = conn.execute(
            "SELECT * FROM users WHERE google_sub = ?",
            (google_sub,),
        ).fetchone()
        return _public(_from_row(updated))


def get_user(user_id: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    if row is None:
        return None
    return _public(_from_row(row))


def get_user_by_sub(google_sub: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE google_sub = ?",
            (google_sub,),
        ).fetchone()
    if row is None:
        return None
    return _public(_from_row(row))


def get_user_with_secret_by_email(email: str) -> dict | None:
    normalized = email.strip().lower()
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE lower(email) = ?",
            (normalized,),
        ).fetchone()
    if row is None:
        return None
    return _from_row(row)


def create_email_user(name: str, email: str, password: str, role: str = "student") -> dict:
    normalized = email.strip().lower()
    now = datetime.now(timezone.utc).isoformat()
    sub = f"email:{normalized}"
    with _connect() as conn:
        existing = conn.execute(
            "SELECT id FROM users WHERE lower(email) = ? OR google_sub = ?",
            (normalized, sub),
        ).fetchone()
        if existing is not None:
            raise ValueError("An account with that email already exists.")
        cur = conn.execute(
            """
            INSERT INTO users (google_sub, email, name, created_at, role, password_hash)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (sub, normalized, name.strip(), now, role, hash_password(password)),
        )
        conn.commit()
        return {
            "id": str(cur.lastrowid),
            "google_sub": sub,
            "email": normalized,
            "name": name.strip(),
            "role": role,
        }


def _ensure_demo_user(conn: sqlite3.Connection, sub: str, email: str, name: str, role: str) -> str:
    now = datetime.now(timezone.utc).isoformat()
    row = conn.execute(
        "SELECT id FROM users WHERE google_sub = ?",
        (sub,),
    ).fetchone()
    if row is not None:
        conn.execute(
            "UPDATE users SET email = ?, name = ?, role = ? WHERE google_sub = ?",
            (email, name, role, sub),
        )
        return str(row["id"])
    cur = conn.execute(
        """
        INSERT INTO users (google_sub, email, name, created_at, role)
        VALUES (?, ?, ?, ?, ?)
        """,
        (sub, email, name, now, role),
    )
    return str(cur.lastrowid)


def ensure_demo_accounts() -> dict[str, str]:
    """Insert dummy student, teacher, parent and link them. Idempotent."""
    from app.storage.parent_students import link as link_parent
    from app.storage.teacher_students import link as link_teacher

    with _connect() as conn:
        student_id = _ensure_demo_user(
            conn,
            DEMO_SUBS["student"],
            "student@demo.clariq",
            "Demo Student",
            "student",
        )
        teacher_id = _ensure_demo_user(
            conn,
            DEMO_SUBS["teacher"],
            "teacher@demo.clariq",
            "Demo Teacher",
            "teacher",
        )
        parent_id = _ensure_demo_user(
            conn,
            DEMO_SUBS["parent"],
            "parent@demo.clariq",
            "Demo Parent",
            "parent",
        )
        conn.commit()
    link_teacher(teacher_id, student_id)
    link_parent(parent_id, student_id)
    return {"student": student_id, "teacher": teacher_id, "parent": parent_id}
