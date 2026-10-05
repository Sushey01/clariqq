"""
Evaluation set for the Socratic science tutor.

NOT training data -- these questions are deliberately kept separate so they
can reveal how the model behaves on things it wasn't spoon-fed an exact
scripted response for.

Each item is (category, question, concept_hint). concept_hint is either the
name of one of the 54 trained concepts (so you can check "does it do a
reasonable job on something it WAS trained on"), or "out_of_bank" (so you
can check "does it generalize the Socratic policy, or fall apart / go
generic / hallucinate on things it never saw").

Categories, ~12 each:
  direct_conceptual  - bare "what is X" questions (the exact failure mode
                        from your transcript -- "what is light?")
  misconception       - a confidently wrong claim, testing whether the
                        model pushes back or just agrees
  confused_stuck      - various ways of saying "I don't get it"
  topic_switch        - a question that pivots mid-conversation
  ambiguous_difficult - vague, underspecified questions
"""

EVAL_SET = [
    # ---------------- direct_conceptual ----------------
    ("direct_conceptual", "What is light?", "Dispersion of light"),
    ("direct_conceptual", "What is motion?", "Newton's first law (inertia)"),
    ("direct_conceptual", "What is electric current?", "Electric current"),
    ("direct_conceptual", "What is a chemical reaction?", "Types of chemical reactions"),
    ("direct_conceptual", "What is photosynthesis?", "Nutrition in plants"),
    ("direct_conceptual", "What is velocity?", "out_of_bank"),
    ("direct_conceptual", "What is an isotope?", "out_of_bank"),
    ("direct_conceptual", "What is a food web?", "out_of_bank"),
    ("direct_conceptual", "What is evaporation?", "out_of_bank"),
    ("direct_conceptual", "What is DNA?", "out_of_bank"),
    ("direct_conceptual", "What is sound?", "out_of_bank"),
    ("direct_conceptual", "What is a lever?", "out_of_bank"),

    # ---------------- misconception ----------------
    ("misconception", "The sun revolves around the Earth, right?", "out_of_bank"),
    ("misconception", "Heavier objects fall faster than lighter ones, don't they?", "Newton's first law (inertia)"),
    ("misconception", "Plants only need water to grow, that's it, right?", "Nutrition in plants"),
    ("misconception", "Lightning never strikes the same place twice, right?", "out_of_bank"),
    ("misconception", "Energy stays the same at every level of a food chain, doesn't it?", "Food chains and energy flow"),
    ("misconception", "Humans only use 10% of their brain, right?", "out_of_bank"),
    ("misconception", "Metals conduct electricity because they're shiny, right?", "Electric current"),
    ("misconception", "The Earth is closer to the sun in summer, isn't it?", "out_of_bank"),
    ("misconception", "Sound can travel through space just like light, can't it?", "Longitudinal vs transverse waves"),
    ("misconception", "All chemical reactions release heat, don't they?", "Exothermic and endothermic reactions"),
    ("misconception", "Bigger animals always need more food than smaller ones, right?", "out_of_bank"),
    ("misconception", "Glass is a type of liquid that flows very slowly, right?", "out_of_bank"),

    # ---------------- confused_stuck ----------------
    ("confused_stuck", "I don't understand any of this.", "Resistance"),
    ("confused_stuck", "Can you explain that again? I'm lost.", "Ohm's Law"),
    ("confused_stuck", "This makes no sense to me at all.", "Electromagnetic induction"),
    ("confused_stuck", "I really don't get it, give me a hint.", "Digestion and enzymes"),
    ("confused_stuck", "I'm confused, can you slow down?", "pH scale and neutralization"),
    ("confused_stuck", "None of this is making sense.", "out_of_bank"),
    ("confused_stuck", "I don't know where to even start.", "Newton's third law (action-reaction)"),
    ("confused_stuck", "Sorry, I still don't understand after that hint.", "Ionic bond formation"),
    ("confused_stuck", "Can you explain it a totally different way?", "Homologous series"),
    ("confused_stuck", "I'm just not following any of this.", "out_of_bank"),
    ("confused_stuck", "I don't get it, can you just simplify?", "Covalent bonding in carbon compounds"),
    ("confused_stuck", "This is too hard, I'm stuck.", "Refraction and bending of light"),

    # ---------------- topic_switch ----------------
    ("topic_switch", "What is photosynthesis? ... Actually, what is friction?", "out_of_bank"),
    ("topic_switch", "Can you explain resistance? ... wait, never mind, tell me about the water cycle instead.", "out_of_bank"),
    ("topic_switch", "What causes rusting? ... actually can we talk about the human eye instead?", "The Human Eye and the Colourful World"),
    ("topic_switch", "What is an ionic bond? ... hold on, what's an acid actually?", "pH scale and neutralization"),
    ("topic_switch", "Explain Newton's third law. ... actually I wanted to ask about magnets.", "Electromagnets and solenoids"),
    ("topic_switch", "What is DNA? ... never mind, what's a food chain?", "Food chains and energy flow"),
    ("topic_switch", "Tell me about electric current. ... actually, why is the sky blue?", "Scattering of light and why the sky is blue"),
    ("topic_switch", "What is inertia? ... wait, can we do chemistry instead, like acids?", "Reaction of acids with metals"),
    ("topic_switch", "What's a chemical reaction? ... actually forget that, what is gravity?", "out_of_bank"),
    ("topic_switch", "Explain reflection of light. ... sorry, can we talk about reproduction instead?", "Asexual reproduction"),
    ("topic_switch", "What are enzymes? ... actually, what's atomic number about?", "Modern periodic law and atomic number"),
    ("topic_switch", "Tell me about waves. ... wait, what's a homologous series?", "Homologous series"),

    # ---------------- ambiguous_difficult ----------------
    ("ambiguous_difficult", "Why does this happen?", "out_of_bank"),
    ("ambiguous_difficult", "What's going on here?", "out_of_bank"),
    ("ambiguous_difficult", "Can you explain this?", "out_of_bank"),
    ("ambiguous_difficult", "I don't get why.", "out_of_bank"),
    ("ambiguous_difficult", "Can you help me with this chapter?", "out_of_bank"),
    ("ambiguous_difficult", "This doesn't make sense, why does it work that way?", "out_of_bank"),
    ("ambiguous_difficult", "I have a question about the thing we did in class today.", "out_of_bank"),
    ("ambiguous_difficult", "Can you go over this topic with me?", "out_of_bank"),
    ("ambiguous_difficult", "What's the deal with this?", "out_of_bank"),
    ("ambiguous_difficult", "Explain.", "out_of_bank"),
    ("ambiguous_difficult", "I'm stuck on my homework, can you help?", "out_of_bank"),
    ("ambiguous_difficult", "Why?", "out_of_bank"),
]

if __name__ == "__main__":
    from collections import Counter
    print("total questions:", len(EVAL_SET))
    print("by category:", Counter(x[0] for x in EVAL_SET))
    print("in-bank vs out-of-bank:", Counter("out_of_bank" if x[2]=="out_of_bank" else "in_bank" for x in EVAL_SET))
