"""Parent ↔ student links. Same SQLite file as users."""

from app.storage.users import _connect, get_user


def _ensure_table(conn) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS parent_students (
            parent_id TEXT NOT NULL,
            student_id TEXT NOT NULL,
            PRIMARY KEY (parent_id, student_id)
        )
        """
    )
    conn.commit()


def link(parent_id: str, student_id: str) -> None:
    with _connect() as conn:
        _ensure_table(conn)
        conn.execute(
            """
            INSERT OR IGNORE INTO parent_students (parent_id, student_id)
            VALUES (?, ?)
            """,
            (str(parent_id), str(student_id)),
        )
        conn.commit()


def is_linked(parent_id: str, student_id: str) -> bool:
    with _connect() as conn:
        _ensure_table(conn)
        row = conn.execute(
            """
            SELECT 1 FROM parent_students
            WHERE parent_id = ? AND student_id = ?
            """,
            (str(parent_id), str(student_id)),
        ).fetchone()
    return row is not None


def list_children(parent_id: str) -> list[dict]:
    with _connect() as conn:
        _ensure_table(conn)
        rows = conn.execute(
            """
            SELECT u.id, u.name, u.email
            FROM users u
            INNER JOIN parent_students ps
                ON CAST(u.id AS TEXT) = ps.student_id OR u.id = ps.student_id
            WHERE ps.parent_id = ?
            ORDER BY u.name ASC
            """,
            (str(parent_id),),
        ).fetchall()
    return [{"id": str(r["id"]), "name": r["name"], "email": r["email"]} for r in rows]

