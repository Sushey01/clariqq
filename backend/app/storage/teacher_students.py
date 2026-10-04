"""Teacher ↔ student links. Same SQLite file as users."""

from app.storage.users import _connect, get_user


def _ensure_table(conn) -> None:
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS teacher_students (
            teacher_id TEXT NOT NULL,
            student_id TEXT NOT NULL,
            PRIMARY KEY (teacher_id, student_id)
        )
        """
    )
    conn.commit()


def link(teacher_id: str, student_id: str) -> None:
    with _connect() as conn:
        _ensure_table(conn)
        conn.execute(
            """
            INSERT OR IGNORE INTO teacher_students (teacher_id, student_id)
            VALUES (?, ?)
            """,
            (str(teacher_id), str(student_id)),
        )
        conn.commit()


def is_linked(teacher_id: str, student_id: str) -> bool:
    with _connect() as conn:
        _ensure_table(conn)
        row = conn.execute(
            """
            SELECT 1 FROM teacher_students
            WHERE teacher_id = ? AND student_id = ?
            """,
            (str(teacher_id), str(student_id)),
        ).fetchone()
    return row is not None


def list_students(teacher_id: str) -> list[dict]:
    with _connect() as conn:
        _ensure_table(conn)
        rows = conn.execute(
            """
            SELECT u.id, u.name, u.email
            FROM users u
            INNER JOIN teacher_students ts
                ON CAST(u.id AS TEXT) = ts.student_id OR u.id = ts.student_id
            WHERE ts.teacher_id = ?
            ORDER BY u.name ASC
            """,
            (str(teacher_id),),
        ).fetchall()
    return [{"id": str(r["id"]), "name": r["name"], "email": r["email"]} for r in rows]

