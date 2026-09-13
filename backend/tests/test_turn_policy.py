import unittest
from types import SimpleNamespace

from app.pipelines.turn_policy import (
    KIND_IDENTITY,
    KIND_META,
    KIND_SCIENCE,
    chunk_is_relevant,
    classify_turn,
    filter_relevant_docs,
    last_science_topic,
)
from app.prompts import system_prompt, turn_addendum


class TurnPolicyTests(unittest.TestCase):
    def test_classify_identity_and_meta(self):
        self.assertEqual(classify_turn("who are you?"), KIND_IDENTITY)
        self.assertEqual(
            classify_turn("why are you giving direct answer or what?"), KIND_META
        )
        self.assertEqual(classify_turn("what is proton?"), KIND_SCIENCE)
        self.assertEqual(classify_turn("what is motion?"), KIND_SCIENCE)

    def test_relevance_drops_prism_for_proton(self):
        proton = "A proton is a subatomic particle in the nucleus."
        prism = "White light passing through a prism spreads into violet to red."
        self.assertTrue(chunk_is_relevant("what is proton?", proton))
        self.assertFalse(chunk_is_relevant("what is proton?", prism))
        docs = [
            SimpleNamespace(page_content=prism),
            SimpleNamespace(page_content=proton),
        ]
        kept = filter_relevant_docs("what is proton?", docs)
        self.assertEqual([d.page_content for d in kept], [proton])

    def test_last_science_topic_from_history(self):
        history = [
            SimpleNamespace(type="human", content="what is motion?"),
            SimpleNamespace(type="ai", content="What makes the cart move?"),
            SimpleNamespace(type="human", content="what is proton?"),
            SimpleNamespace(type="ai", content="A proton is..."),
        ]
        self.assertEqual(
            last_science_topic(history, "why are you giving direct answer or what?"),
            "what is proton?",
        )
        self.assertEqual(last_science_topic(history, "who are you?"), "what is proton?")
        self.assertEqual(last_science_topic([], "what is motion?"), "what is motion?")

    def test_strict_prompt_bans_definition_dump(self):
        text = system_prompt("strict").lower()
        self.assertIn("do not dump the full mechanism", text)
        self.assertIn("that's it exactly", text)
        self.assertIn("ignore", text)

    def test_strict_and_guided_prompts_ground_on_student_topic(self):
        for mode in ("strict", "guided"):
            text = system_prompt(mode).lower()
            self.assertIn("must use words from the student's latest topic", text)
            self.assertIn("younger student", text)
            self.assertIn("unknowns", text)
            self.assertIn("what we learned earlier", text)
            self.assertIn("name that topic", text)
            self.assertIn("do not invent a new chapter", text)

    def test_meta_addendum_mentions_topic(self):
        extra = turn_addendum("meta", "what is proton?")
        self.assertIn("direct answer", extra.lower())
        self.assertIn("what is proton?", extra)
        self.assertEqual(turn_addendum("science", None), "")
        self.assertIn("question mark", system_prompt("strict").lower())

    def test_canned_meta_stays_on_proton(self):
        from app.pipelines.turn_policy import canned_non_science_reply

        reply = canned_non_science_reply("meta", "what is proton?")
        self.assertIsNotNone(reply)
        self.assertIn("proton", reply.lower())
        self.assertNotIn("prism", reply.lower())
        self.assertNotIn("light", reply.lower())
        who = canned_non_science_reply("identity", "what is proton?")
        self.assertIn("Clariq", who)
        self.assertIn("proton", who.lower())

    def test_ensure_socratic_question_appends_when_missing(self):
        from app.pipelines.turn_policy import ensure_socratic_reply

        patched = ensure_socratic_reply(
            "That's it exactly.",
            "we push it with force so",
            "strict",
            "what is motion?",
        )
        self.assertIn("?", patched)
        self.assertEqual(
            ensure_socratic_reply(
                "Why does the cart move?", "what is motion?", "strict", None
            ),
            "Why does the cart move?",
        )
        self.assertEqual(
            ensure_socratic_reply("A proton is positive.", "what is proton?", "direct", None),
            "A proton is positive.",
        )

    def test_definition_dump_is_rewritten_in_strict(self):
        from app.pipelines.turn_policy import ensure_socratic_reply

        leaked = (
            "A proton is a subatomic particle found in the nucleus of an atom, "
            "carrying a positive electric charge. What determines the number?"
        )
        out = ensure_socratic_reply(leaked, "what is proton?", "strict", None)
        self.assertNotIn("subatomic", out.lower())
        self.assertNotIn("positive electric charge", out.lower())
        self.assertIn("proton", out.lower())
        self.assertIn("?", out)

    def test_ensure_socratic_strips_phi3_specials(self):
        from app.pipelines.turn_policy import ensure_socratic_reply, strip_phi3_specials

        leaked = (
            "What do you already know for sure, and what are the unknowns?"
            "|<|system|>"
        )
        self.assertEqual(
            strip_phi3_specials(leaked),
            "What do you already know for sure, and what are the unknowns?",
        )
        out = ensure_socratic_reply(leaked, "Guide me through DNA replication", "strict", None)
        self.assertNotIn("<|", out)
        self.assertNotIn("system", out)
        self.assertIn("?", out)


if __name__ == "__main__":
    unittest.main()
