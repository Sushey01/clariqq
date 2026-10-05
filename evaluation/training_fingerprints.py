"""
Complete script-collapse fingerprint set -- one distinctive phrase per
trained concept (54 total), auto-extracted from each concept's guiding
question opening clause. Use in run_eval.py's flag_response() in place
of the 4-concept starter dict, to catch collapse onto ANY of the 54
trained concepts, not just the 4 originally hardcoded as examples.
"""

TRAINING_FINGERPRINTS = {
    "Nutrition in plants": "plants don't eat like we do",
    "Respiration": "when you run fast",
    "Excretion": "your body's cells constantly produce chemical waste from their reactions",
    "Reflex action": "when you touch something hot",
    "Hormones and the endocrine system": "unlike nerve signals",
    "Coordination in plants": "a plant has no nerves or brain",
    "Asexual reproduction": "an amoeba splits into two identical amoebas without any partner",
    "Fertilization": "a sperm cell and an egg cell each carry half the genetic",
    "Puberty and reproductive maturity": "around this age",
    "Electric current": "when a bulb connected to a battery lights up",
    "Resistance": "a thin nichrome wire heats up more than a thick copper wire carrying the same current",
    "Ohm's Law": "if you increase the voltage across a resistor while keeping resistance constant",
    "Balancing chemical equations": "in a chemical reaction",
    "Types of chemical reactions": "when iron rusts",
    "Oxidation and corrosion": "silver jewellery reacts slowly with substances in the air over time",
    "Inherited traits and dominant alleles": "if a tall-plant allele and a short-plant allele are both present in an offspring",
    "Sex determination in humans": "every child gets one sex chromosome from their mother and one from their father",
    "Magnetic field around a current-carrying conductor": "when oersted placed a compass near a current-carrying wire",
    "Electromagnetic induction": "if you move a magnet in and out of a coil of wire",
    "Why stars twinkle but planets don't": "stars are extremely far away and appear as tiny points of light",
    "Phases of the Moon": "the moon doesn't produce its own light \u2014 it only reflects sunlight",
    "Accommodation of the eye": "when you shift your gaze from a distant tree to a book in your hand",
    "Dispersion of light": "white light passing through a glass prism spreads out into a band",
    "Myopia (short-sightedness)": "in a person with myopia",
    "Atmospheric pressure and altitude": "as you climb higher up a mountain",
    "Pressure and surface area": "a sharp knife and a blunt knife can be pushed with exactly the same force",
    "Why gases exert pressure on container walls": "a gas is made of countless tiny particles moving randomly in all",
    "Longitudinal vs transverse waves": "in a sound wave",
    "Binary data representation": "a computer's circuits are electronic switches that can only be in one",
    "Food chains and energy flow": "when a deer eats grass",
    "Biodegradable vs non-biodegradable waste": "a banana peel left in soil disappears within weeks",
    "Basis of five-kingdom classification": "a mushroom cannot make its own food through photosynthesis like a plant does",
    "Newton's first law (inertia)": "when a bus you're standing in suddenly brakes",
    "Newton's third law (action-reaction)": "a rocket expels hot gas downward and out the back at high speed",
    "Laws of reflection": "a mirror's surface is extremely smooth",
    "Refraction and bending of light": "light travels at different speeds in air and in water",
    "pH scale and neutralization": "scientists use a scale from 0 to 14 to describe how acidic or basic a solution is",
    "Digestion and enzymes": "large food molecules like proteins and starches are too big for your",
    "Periodic trends in groups": "lithium",
    "Reactivity series and displacement reactions": "when an iron nail is placed into a blue copper sulphate solution",
    "Saturated vs unsaturated hydrocarbons": "in a saturated hydrocarbon",
    "Covalent bonding in carbon compounds": "carbon has four electrons in its outermost shell \u2014 not close to empty or full",
    "Soap and detergent cleansing action": "oil and water don't mix",
    "Division of labour and pollination": "in a honeybee colony",
    "Electromagnets and solenoids": "a coil of insulated wire wrapped around an iron rod becomes strongly",
    "Exothermic and endothermic reactions": "when quicklime (calcium oxide) is mixed with water",
    "Reaction of acids with metals": "when zinc granules are added to dilute hydrochloric acid",
    "Water of crystallization": "blue copper sulphate crystals turn white and powdery when strongly heated",
    "Modern periodic law and atomic number": "early periodic tables arranged elements by atomic mass",
    "Physical properties: malleability and ductility": "a gold sheet can be hammered thinner and thinner without breaking",
    "Ionic bond formation": "sodium has one electron in its outer shell that it can easily lose",
    "Homologous series": "methane",
    "Functional groups": "ethane is just carbon and hydrogen",
    "Scattering of light and why the sky is blue": "sunlight looks white",
}

# Observed model wording that is the same skit but not a verbatim opening clause.
_ALIASES = {
    "Dispersion of light": (
        "white light passing through a prism",
        "band of colours from violet to red",
        "band of colors from violet to red",
    ),
    "Newton's first law (inertia)": (
        "bus you are standing in suddenly brakes",
    ),
    "Nutrition in plants": (
        "plants do not eat like we do",
    ),
}

# One-to-four-word openings collide with normal Grade 10 language.
_MIN_WORDS = 5


def fingerprint_matchers() -> dict[str, tuple[str, ...]]:
    """Phrases safe to substring-match. Strings are never iterated as characters."""
    out: dict[str, tuple[str, ...]] = {}
    for concept, phrase in TRAINING_FINGERPRINTS.items():
        phrases = [phrase, *_ALIASES.get(concept, ())]
        kept = []
        seen = set()
        for raw in phrases:
            text = " ".join(str(raw).lower().replace("\u2014", " ").split())
            if text in seen:
                continue
            is_alias = raw in _ALIASES.get(concept, ())
            if not is_alias and len(text.split()) < _MIN_WORDS:
                continue
            seen.add(text)
            kept.append(text)
        if kept:
            out[concept] = tuple(kept)
    return out


if __name__ == "__main__":
    from collections import Counter

    print("concepts:", len(TRAINING_FINGERPRINTS))
    short = [
        k
        for k, v in TRAINING_FINGERPRINTS.items()
        if len(v.split()) < _MIN_WORDS
    ]
    print("skipped as too generic:", len(short))
    for name in short:
        print(" ", name, "->", TRAINING_FINGERPRINTS[name])
    matchers = fingerprint_matchers()
    print("concepts with usable matchers:", len(matchers))
    print("phrase counts:", Counter(len(v) for v in matchers.values()))
