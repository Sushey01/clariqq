import unittest
from fastapi.testclient import TestClient
from app.main import app


class StudyRoutesTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_get_study_topics(self):
        response = self.client.get("/api/study/topics")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data), 0)
        self.assertEqual(data[0]["id"], "acids_bases")

    def test_get_study_topic_detail(self):
        response = self.client.get("/api/study/topic/acids_bases")
        self.assertEqual(response.status_code, 200)
        topic = response.json()
        self.assertEqual(len(topic["pre_test"]), 5)
        self.assertEqual(len(topic["post_test"]), 5)
        self.assertEqual(len(topic["sus_questions"]), 10)
        self.assertTrue("Chapter 9: Acids" in topic["cdc_textbook_content"])

    def test_submit_study_session(self):
        payload = {
            "participant_id": "TEST_P01",
            "topic_id": "acids_bases",
            "condition": "clariq",
            "pre_test_answers": [1, 1, 3, 2, 0],  # 5/5
            "post_test_answers": [1, 1, 1, 3, 2],  # 5/5
            "learning_seconds": 360.0,
            "sus_scores": [5, 1, 5, 1, 5, 1, 5, 1, 5, 1],  # SUS = 100
            "feedback": "Great Socratic dialogue!",
        }
        response = self.client.post("/api/study/submit", json=payload)
        self.assertEqual(response.status_code, 200)
        result = response.json()["result"]
        self.assertEqual(result["pre_test_score"], 5)
        self.assertEqual(result["post_test_score"], 5)
        self.assertEqual(result["retention_gain"], 0)
        self.assertEqual(result["sus_score"], 100.0)


if __name__ == "__main__":
    unittest.main()
