import unittest

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.ai_engine.hf_space_chat import (
    SPACE_FORMAT_HINT,
    assistant_text_from_space,
    space_src,
    split_space_payload,
)


class HfSpaceChatPayloadTests(unittest.TestCase):
    def test_split_includes_system_in_question(self):
        question, history = split_space_payload(
            [
                SystemMessage(content="Stay Socratic."),
                HumanMessage(content="earlier"),
                AIMessage(content="What did you notice?"),
                HumanMessage(content="photosynthesis"),
            ]
        )
        self.assertIn("Stay Socratic.", question)
        self.assertIn("photosynthesis", question)
        self.assertEqual(
            history,
            [
                {"role": "user", "content": "earlier"},
                {"role": "assistant", "content": "What did you notice?"},
            ],
        )

    def test_space_src_skips_huggingface_hub_dns(self):
        self.assertEqual(
            space_src("Susu11/socratic"),
            "https://susu11-socratic.hf.space",
        )
        self.assertEqual(
            space_src("https://susu11-socratic.hf.space/"),
            "https://susu11-socratic.hf.space",
        )

    def test_assistant_text_from_string_and_messages(self):
        self.assertEqual(assistant_text_from_space("  hello  "), "hello")
        self.assertEqual(
            assistant_text_from_space(
                [{"role": "user", "content": "q"}, {"role": "assistant", "content": "a"}]
            ),
            "a",
        )
        self.assertIn("tuple", SPACE_FORMAT_HINT.lower())


if __name__ == "__main__":
    unittest.main()
