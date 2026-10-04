"""Objective 5: Controlled Crossover User Study Configuration & Questions.

Class 10 SEE Science Topics:
1. Acids, Bases, and Salts (Chemistry)
2. Force and Motion / Newton's Laws (Physics)
"""

STUDY_TOPICS = {
    "acids_bases": {
        "id": "acids_bases",
        "title": "Acids, Bases, and Salts",
        "subject": "Chemistry",
        "grade": "Grade 10 SEE",
        "learning_objectives": [
            "Understand the operational definitions of acids and bases (Arrhenius theory).",
            "Explain the concept of pH scale and indicators (litmus, phenolphthalein, universal indicator).",
            "Predict products of neutralization reactions.",
            "Differentiate between strong and weak acids/bases."
        ],
        "cdc_textbook_content": """### Chapter 9: Acids, Bases, and Salts (CDC Nepal Grade 10 Science)

#### 1. Acids
An acid is a substance that produces hydrogen ions (H⁺) when dissolved in water.
- **Physical properties:** Sour taste, turns blue litmus red, pH less than 7.
- **Strong acids:** Completely ionize in water (e.g., Hydrochloric acid HCl, Sulphuric acid H₂SO₄, Nitric acid HNO₃).
- **Weak acids:** Partially ionize in water (e.g., Acetic acid CH₃COOH, Carbonic acid H₂CO₃).

#### 2. Bases and Alkalis
A base is an oxide or hydroxide of a metal that reacts with an acid to form salt and water.
- **Alkalis:** Water-soluble bases that produce hydroxide ions (OH⁻) in aqueous solution (e.g., Sodium hydroxide NaOH, Potassium hydroxide KOH).
- **Physical properties:** Bitter taste, soapy or slippery touch, turns red litmus blue, pH greater than 7.
- **Key rule:** All alkalis are bases, but all bases are not alkalis (e.g., Copper hydroxide Cu(OH)₂ is a base but insoluble in water, so not an alkali).

#### 3. pH Scale and Indicators
The pH scale measures the hydrogen ion concentration in a solution from 0 to 14:
- pH = 7: Neutral (pure water)
- pH < 7: Acidic (lower pH = stronger acid)
- pH > 7: Basic / Alkaline (higher pH = stronger base)

Common indicators:
- **Blue litmus:** Stays blue in base, turns red in acid.
- **Red litmus:** Stays red in acid, turns blue in base.
- **Phenolphthalein:** Colorless in acid/neutral, pink in alkaline solution.
- **Methyl orange:** Red in acid, yellow in alkaline solution.

#### 4. Neutralization Reaction
When an acid reacts with a base, they neutralize each other's properties to produce a salt and water:
Acid + Base → Salt + Water
Example: HCl + NaOH → NaCl + H₂O
Heat is usually evolved during this reaction (exothermic).
""",
        "pre_test": [
            {
                "id": "q1",
                "question": "What ion do all acids produce when dissolved in water according to Arrhenius theory?",
                "options": ["Hydroxide ion (OH⁻)", "Hydrogen ion (H⁺)", "Oxide ion (O²⁻)", "Chloride ion (Cl⁻)"],
                "answer_idx": 1
            },
            {
                "id": "q2",
                "question": "Which of the following statements is chemically correct regarding bases and alkalis?",
                "options": [
                    "All bases are alkalis, but not all alkalis are bases.",
                    "All alkalis are bases, but not all bases are alkalis.",
                    "Alkalis are insoluble in water, while bases dissolve easily.",
                    "Bases and alkalis are completely identical terms with no distinction."
                ],
                "answer_idx": 1
            },
            {
                "id": "q3",
                "question": "A solution tests with a pH of 3. What does this indicate?",
                "options": ["Weakly basic", "Strongly basic", "Neutral", "Strongly acidic"],
                "answer_idx": 3
            },
            {
                "id": "q4",
                "question": "What color does phenolphthalein turn when added to a basic solution such as NaOH?",
                "options": ["Colorless", "Deep red", "Pink", "Yellow"],
                "answer_idx": 2
            },
            {
                "id": "q5",
                "question": "What are the universal products of a neutralization reaction between an acid and a base?",
                "options": ["Salt + Water", "Gas + Water", "Acid + Salt", "Metal + Hydrogen gas"],
                "answer_idx": 0
            }
        ],
        "post_test": [
            {
                "id": "p1",
                "question": "Why is copper(II) hydroxide Cu(OH)₂ classified as a base but NOT an alkali?",
                "options": [
                    "It contains no hydroxide groups.",
                    "It is insoluble in water.",
                    "It has a pH below 7.",
                    "It cannot react with an acid."
                ],
                "answer_idx": 1
            },
            {
                "id": "p2",
                "question": "Solution X has a pH of 2 and Solution Y has a pH of 5. Which of the following is true?",
                "options": [
                    "Solution Y is a stronger acid than Solution X.",
                    "Solution X has a higher concentration of H⁺ ions than Solution Y.",
                    "Both solutions will turn red litmus blue.",
                    "Solution X will turn phenolphthalein bright pink."
                ],
                "answer_idx": 1
            },
            {
                "id": "p3",
                "question": "If stomach acid (HCl) is neutralized by milk of magnesia (Mg(OH)₂), what salt is formed?",
                "options": ["Magnesium sulfate MgSO₄", "Magnesium chloride MgCl₂", "Sodium chloride NaCl", "Magnesium oxide MgO"],
                "answer_idx": 1
            },
            {
                "id": "p4",
                "question": "A student adds drops of universal indicator to an unknown liquid and observes a dark purple color (pH ~ 13). The liquid is most likely:",
                "options": ["Lemon juice", "Pure distilled water", "Dilute vinegar", "Concentrated sodium hydroxide solution"],
                "answer_idx": 3
            },
            {
                "id": "p5",
                "question": "How does a weak acid like acetic acid (CH₃COOH) differ from a strong acid like HCl in water?",
                "options": [
                    "Weak acids do not contain any hydrogen atoms.",
                    "Weak acids completely dissociate, whereas strong acids do not.",
                    "Weak acids only partially ionize, leaving mostly intact molecules in solution.",
                    "Weak acids always have a pH greater than 7."
                ],
                "answer_idx": 2
            }
        ]
    }
}

SUS_QUESTIONS = [
    "I think that I would like to use this learning system frequently.",
    "I found the system unnecessarily complex.",
    "I thought the system was easy to use.",
    "I think that I would need the support of a technical person to be able to use this system.",
    "I found the various functions in this system were well integrated.",
    "I thought there was too much inconsistency in this system.",
    "I would imagine that most students would learn to use this system very quickly.",
    "I found the system very cumbersome/awkward to use.",
    "I felt very confident using the system.",
    "I needed to learn a lot of things before I could get going with this system."
]
