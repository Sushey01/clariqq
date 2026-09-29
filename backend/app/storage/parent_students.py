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
            SELECT student_id FROM parent_students
            WHERE parent_id = ?
            """,
            (str(parent_id),),
        ).fetchall()
    children = []
    for row in rows:
        user = get_user(str(row["student_id"]))
        if user:
            children.append(
                {"id": user["id"], "name": user["name"], "email": user["email"]}
            )
    return children
