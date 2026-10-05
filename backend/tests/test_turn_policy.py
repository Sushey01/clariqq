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
        self.assertEqual(
            classify_turn(
                "Help me understand Newton's first law using Socratic questions."
            ),
            KIND_SCIENCE,
        )
        self.assertEqual(
            classify_turn("why aren't you socratic?"),
            KIND_META,
        )

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
        newton_history = [
            SimpleNamespace(
                type="human",
                content="Help me understand Newton's first law using Socratic questions.",
            ),
            SimpleNamespace(type="ai", content="What happens if nobody pushes the ball?"),
        ]
        self.assertIn(
            "newton",
            last_science_topic(newton_history, "it wont move").lower(),
        )
        self.assertIn(
            "newton",
            last_science_topic(newton_history, "i dont know").lower(),
        )
        self.assertEqual(last_science_topic([], "what is motion?"), "what is motion?")

    def test_strict_prompt_guides_instead_of_defining(self):
        text = system_prompt("strict").lower()
        self.assertIn("no vocabulary guessing", text)
        self.assertIn("<plan>", text)
        self.assertIn("chlorophyll", text)
        self.assertIn("do not state the definition", text)
        self.assertNotIn("define the term directly first", text)
        self.assertNotIn("retrieved", text)

    def test_strict_and_guided_prompts_stay_on_named_topic(self):
        for mode in ("strict", "guided"):
            text = system_prompt(mode).lower()
            self.assertIn("jump back a step", text)
            self.assertIn("exactly one clear question", text)
            self.assertNotIn("snippets", text)

    def test_meta_addendum_mentions_topic(self):
        extra = turn_addendum("meta", "what is proton?")
        self.assertIn("direct answer", extra.lower())
        self.assertIn("what is proton?", extra)
        self.assertEqual(turn_addendum("science", None), "")
        self.assertIn("exactly one clear question", system_prompt("strict").lower())

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

    def test_definition_is_kept_when_student_asks_what_is(self):
        from app.pipelines.turn_policy import ensure_socratic_reply

        leaked = (
            "A proton is a subatomic particle found in the nucleus of an atom, "
            "carrying a positive electric charge. What determines the number?"
        )
        out = ensure_socratic_reply(leaked, "what is proton?", "strict", None)
        self.assertIn("subatomic", out.lower())
        self.assertIn("proton", out.lower())
        self.assertIn("?", out)

        force = ensure_socratic_reply(
            "Force is a push or a pull that can change an object's motion.",
            "what is force?",
            "strict",
            "what is force?",
        )
        self.assertIn("push or a pull", force.lower())
        self.assertIn("?", force)

        leaked_fact = ensure_socratic_reply(
            "Fact: According to Newton's laws of physics, any change in position "
            "over time is defined as motion.",
            "what is motion?",
            "strict",
            "what is motion?",
        )
        self.assertNotIn("fact:", leaked_fact.lower())
        self.assertNotIn("newton", leaked_fact.lower())
        self.assertNotIn("everyday example", leaked_fact.lower())
        self.assertIn("?", leaked_fact)

    def test_plan_is_hidden_from_the_student(self):
        from app.pipelines.turn_policy import ensure_socratic_reply

        raw = (
            "<plan>\nFact: Chlorophyll reflects green light.\n"
            "Goal: ask what happens to unused light.\n</plan>\n"
            "Let's think about how we see colors. "
            "What happens when light hits chlorophyll but isn't used for energy capture?"
        )
        out = ensure_socratic_reply(
            raw,
            "Why are plant leaves green?",
            "strict",
            "Why are plant leaves green?",
        )
        self.assertNotIn("<plan>", out)
        self.assertNotIn("Fact:", out)
        self.assertIn("how we see colors", out)
        self.assertTrue(out.endswith("?"))

    def test_fresh_concept_question_drops_prior_history(self):
        from app.pipelines.turn_policy import is_standalone_new_question

        self.assertTrue(is_standalone_new_question("Why are plant leaves green?"))
        self.assertTrue(is_standalone_new_question("what is energy?"))
        self.assertFalse(is_standalone_new_question("the green color is produced by chlorophyll then?"))
        self.assertFalse(is_standalone_new_question("what is that again?"))

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
