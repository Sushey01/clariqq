import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

os.environ.setdefault("JWT_SECRET", "test-role-desks-secret")


class RoleDeskTests(unittest.TestCase):
    def setUp(self):
        handle, name = tempfile.mkstemp(suffix=".sqlite3")
        os.close(handle)
        self.db_path = Path(name)
        self.patches = [
            patch("app.storage.users.DB_PATH", self.db_path),
            patch("app.storage.mastery.DB_PATH", self.db_path),
        ]
        for item in self.patches:
            item.start()
        from app.storage.users import ensure_demo_accounts

        ensure_demo_accounts()
        from fastapi.testclient import TestClient
        from app.main import app

        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()
        for item in self.patches:
            item.stop()
        self.db_path.unlink(missing_ok=True)

    def _login(self, role: str) -> dict:
        response = self.client.post("/api/auth/demo-login", json={"role": role})
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def test_demo_student_jwt_matches_seed(self):
        from app.storage.users import DEMO_SUBS, get_user_by_sub

        data = self._login("student")
        seeded = get_user_by_sub(DEMO_SUBS["student"])
        self.assertEqual(data["user"]["id"], seeded["id"])
        self.assertEqual(data["user"]["role"], "student")
        self.assertTrue(data["access_token"])

    def test_teacher_reads_linked_student_weekly(self):
        student = self._login("student")
        teacher = self._login("teacher")
        headers = {"Authorization": f"Bearer {teacher['access_token']}"}
        listed = self.client.get("/api/teacher/students", headers=headers)
        self.assertEqual(listed.status_code, 200)
        students = listed.json()
        self.assertEqual(len(students), 1)
        self.assertEqual(students[0]["id"], student["user"]["id"])
        weekly = self.client.get(
            f"/api/teacher/students/{student['user']['id']}/weekly",
            headers=headers,
        )
        self.assertEqual(weekly.status_code, 200)
        self.assertEqual(weekly.json()["user_id"], student["user"]["id"])

    def test_parent_reads_linked_child_weekly(self):
        student = self._login("student")
        parent = self._login("parent")
        headers = {"Authorization": f"Bearer {parent['access_token']}"}
        child = self.client.get("/api/parent/child", headers=headers)
        self.assertEqual(child.status_code, 200)
        self.assertEqual(child.json()["id"], student["user"]["id"])
        weekly = self.client.get("/api/parent/child/weekly", headers=headers)
        self.assertEqual(weekly.status_code, 200)
        self.assertEqual(weekly.json()["user_id"], student["user"]["id"])

    def test_teacher_cannot_read_unlinked_student(self):
        teacher = self._login("teacher")
        headers = {"Authorization": f"Bearer {teacher['access_token']}"}
        weekly = self.client.get(
            "/api/teacher/students/999999/weekly",
            headers=headers,
        )
        self.assertEqual(weekly.status_code, 403)

    def test_email_signup_reaches_api(self):
        response = self.client.post(
            "/api/auth/signup",
            json={
                "name": "Ada",
                "email": "ada@school.edu",
                "password": "secret1",
            },
        )
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["user"]["role"], "student")
        login = self.client.post(
            "/api/auth/login",
            json={"email": "ada@school.edu", "password": "secret1"},
        )
        self.assertEqual(login.status_code, 200)


if __name__ == "__main__":
    unittest.main()
