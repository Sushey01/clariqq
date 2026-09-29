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
            SELECT student_id FROM teacher_students
            WHERE teacher_id = ?
            """,
            (str(teacher_id),),
        ).fetchall()
    students = []
    for row in rows:
        user = get_user(str(row["student_id"]))
        if user:
            students.append(
                {"id": user["id"], "name": user["name"], "email": user["email"]}
            )
    return students
