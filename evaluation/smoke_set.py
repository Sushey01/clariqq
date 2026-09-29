"""
100-question smoke test (held out). Not training data.

20 items in each category. The first 60 match evaluation/eval_set.py so
earlier pilots can be compared with this protocol.

Each item is (category, question, concept_hint).
concept_hint is a trained-concept name or "out_of_bank".
"""

from eval_set import EVAL_SET

_EXTRA = [
    # ---------------- direct_conceptual (8) ----------------
    ("direct_conceptual", "What is friction?", "out_of_bank"),
    ("direct_conceptual", "What is gravity?", "out_of_bank"),
    ("direct_conceptual", "What is an acid?", "pH scale and neutralization"),
    ("direct_conceptual", "What is refraction?", "Refraction and bending of light"),
    ("direct_conceptual", "What is a food chain?", "Food chains and energy flow"),
    ("direct_conceptual", "What is inertia?", "Newton's first law (inertia)"),
    ("direct_conceptual", "What is rusting?", "out_of_bank"),
    ("direct_conceptual", "What is the pH scale?", "pH scale and neutralization"),
    # ---------------- misconception (8) ----------------
    ("misconception", "Ice sinks in water because solids are always heavier, right?", "out_of_bank"),
    ("misconception", "We see objects because our eyes send out light, don't they?", "out_of_bank"),
    ("misconception", "Mass and weight are the same thing, right?", "out_of_bank"),
    ("misconception", "Acids are always dangerous and bases are always safe, right?", "pH scale and neutralization"),
    ("misconception", "Current is used up as it goes around a circuit, isn't it?", "Electric current"),
    ("misconception", "Plants take in food from the soil through their roots, right?", "Nutrition in plants"),
    ("misconception", "There is no gravity on the Moon, that's why astronauts float, right?", "out_of_bank"),
    ("misconception", "White light is a single colour with no mix in it, right?", "Dispersion of light"),
    # ---------------- confused_stuck (8) ----------------
    ("confused_stuck", "I forgot everything from last class.", "out_of_bank"),
    ("confused_stuck", "Wait, what were we even talking about?", "out_of_bank"),
    ("confused_stuck", "Can you give a smaller step? I'm stuck on the last idea.", "Electric current"),
    ("confused_stuck", "I think I mixed two chapters together.", "out_of_bank"),
    ("confused_stuck", "Please don't give the full answer, just unstick me.", "Nutrition in plants"),
    ("confused_stuck", "I understood until the last sentence, then I lost it.", "Newton's first law (inertia)"),
    ("confused_stuck", "Is there an everyday example? I'm not getting the words.", "Refraction and bending of light"),
    ("confused_stuck", "I need to start over from the beginning of this topic.", "Food chains and energy flow"),
    # ---------------- topic_switch (8) ----------------
    (
        "topic_switch",
        "Why does ice float on water? ... actually, what is photosynthesis?",
        "Nutrition in plants",
    ),
    (
        "topic_switch",
        "What is motion? ... wait, can we talk about acids and bases instead?",
        "pH scale and neutralization",
    ),
    (
        "topic_switch",
        "What is light? ... never mind, what is electric current?",
        "Electric current",
    ),
    (
        "topic_switch",
        "Tell me about food chains. ... actually I wanted gravity.",
        "out_of_bank",
    ),
    (
        "topic_switch",
        "What is an isotope? ... sorry, what's friction?",
        "out_of_bank",
    ),
    (
        "topic_switch",
        "Explain rusting. ... hold on, what is DNA?",
        "out_of_bank",
    ),
    (
        "topic_switch",
        "What is a lever? ... actually, why is the sky blue?",
        "Scattering of light and why the sky is blue",
    ),
    (
        "topic_switch",
        "What is evaporation? ... wait, can we do Newton's first law?",
        "Newton's first law (inertia)",
    ),
    # ---------------- ambiguous_difficult (8) ----------------
    ("ambiguous_difficult", "Help.", "out_of_bank"),
    ("ambiguous_difficult", "I have science homework.", "out_of_bank"),
    ("ambiguous_difficult", "What should I study?", "out_of_bank"),
    ("ambiguous_difficult", "Is this important for the exam?", "out_of_bank"),
    ("ambiguous_difficult", "Can we do the next part?", "out_of_bank"),
    ("ambiguous_difficult", "Same as yesterday.", "out_of_bank"),
    ("ambiguous_difficult", "The diagram in the book, you know.", "out_of_bank"),
    ("ambiguous_difficult", "Just tell me the main point.", "out_of_bank"),
]

SMOKE_SET = EVAL_SET + _EXTRA

assert len(SMOKE_SET) == 100, len(SMOKE_SET)
assert len(_EXTRA) == 40

if __name__ == "__main__":
    from collections import Counter

    print("total:", len(SMOKE_SET))
    print("by category:", Counter(x[0] for x in SMOKE_SET))
    print(
        "in-bank vs out-of-bank:",
        Counter("out_of_bank" if x[2] == "out_of_bank" else "in_bank" for x in SMOKE_SET),
    )
