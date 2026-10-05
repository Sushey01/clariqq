import unittest

from app.ai_engine.groq_chat import chat_completions_url


class OpenAICompatUrlTests(unittest.TestCase):
    def test_accepts_origin_v1_or_full_path(self):
        self.assertEqual(
            chat_completions_url("https://example.modal.run"),
            "https://example.modal.run/v1/chat/completions",
        )
        self.assertEqual(
            chat_completions_url("https://example.modal.run/v1"),
            "https://example.modal.run/v1/chat/completions",
        )
        self.assertEqual(
            chat_completions_url("https://example.modal.run/v1/chat/completions"),
            "https://example.modal.run/v1/chat/completions",
        )


if __name__ == "__main__":
    unittest.main()
