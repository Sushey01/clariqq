import unittest

from app.knowledge.graph import counts, node_by_id
from app.knowledge.scoring import (
    M0,
    coherence,
    map_concept,
    next_mastery,
    similarity,
)


class GraphCatalogTests(unittest.TestCase):
    def test_one_hundred_thirty_five_nodes(self):
        self.assertEqual(counts()["Physics"], 45)
        self.assertEqual(counts()["Chemistry"], 50)
        self.assertEqual(counts()["Biology"], 40)
        self.assertEqual(len(node_by_id()), 135)


class ScoringTests(unittest.TestCase):
    def test_short_answer_coherence(self):
        self.assertEqual(coherence("yes", "density is mass over volume"), 0.3)

    def test_copy_coherence(self):
        text = "density is mass over volume of the object"
        self.assertEqual(coherence(text, text), 0.5)

    def test_honest_attempt_coherence(self):
        student = "ice is less packed so it sits on the water"
        curriculum = "density is mass per unit volume; ice floats because it is less dense than liquid water"
        self.assertEqual(coherence(student, curriculum), 1.0)

    def test_mastery_moves_toward_st(self):
        self.assertGreater(next_mastery(M0, 0.9), M0)
        self.assertLess(next_mastery(M0, 0.1), M0)

    def test_map_buoyancy_from_ice(self):
        concept_id, score = map_concept("why does ice float on water")
        self.assertEqual(concept_id, "phy_buoyancy")
        self.assertGreater(score, 0.08)

    def test_similarity_nonzero_overlap(self):
        sim = similarity(
            "ice floats because it is less dense",
            "ice floats on water because its density is lower than liquid water",
        )
        self.assertGreater(sim, 0.2)


if __name__ == "__main__":
    unittest.main()
