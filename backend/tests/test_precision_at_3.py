import unittest

from app.retrieval_eval import (
    chunk_is_relevant,
    exact_precision_at_3,
    phrase_forms,
    precision_at_3,
    search_text,
)


class PrecisionAt3Tests(unittest.TestCase):
    def test_all_three_relevant(self):
        texts = [
            "Photosynthesis uses chlorophyll.",
            "The photosynthesis equation needs light.",
            "Leaves do photosynthesis in chloroplasts.",
        ]
        self.assertEqual(precision_at_3(texts, "photosynthesis"), 1.0)

    def test_one_of_three(self):
        texts = [
            "Density is mass divided by volume.",
            "The prism splits white light.",
            "A series circuit has one path.",
        ]
        self.assertAlmostEqual(precision_at_3(texts, "density"), 1 / 3)

    def test_none_relevant(self):
        self.assertEqual(precision_at_3(["prism", "lens", "mirror"], "kidney"), 0.0)

    def test_fewer_than_three_docs_still_divides_by_three(self):
        self.assertAlmostEqual(precision_at_3(["the kidney filters blood"], "kidney"), 1 / 3)

    def test_phrase_match_is_case_insensitive(self):
        self.assertTrue(chunk_is_relevant("DNA is in the chromosome.", "dna"))


class TextbookWordingTests(unittest.TestCase):
    def test_rust_counts_for_rusting(self):
        self.assertTrue(chunk_is_relevant("Iron forms a brown flaky rust.", "Rusting"))

    def test_potential_difference_counts_for_voltage(self):
        self.assertTrue(
            chunk_is_relevant("The potential difference is measured in volts.", "voltage")
        )

    def test_american_spelling_counts(self):
        self.assertTrue(chunk_is_relevant("Neutralization gives salt and water.", "Neutralisation"))

    def test_organelle_counts_for_cell_organelles(self):
        self.assertTrue(chunk_is_relevant("Each organelle has a job.", "Cell organelles"))

    def test_unrelated_text_still_fails(self):
        self.assertFalse(chunk_is_relevant("The prism splits white light.", "voltage"))

    def test_exact_score_ignores_wording(self):
        texts = ["brown flaky rust", "rusting of iron", "a prism"]
        self.assertAlmostEqual(exact_precision_at_3(texts, "rusting"), 1 / 3)
        self.assertAlmostEqual(precision_at_3(texts, "rusting"), 2 / 3)

    def test_forms_include_phrase(self):
        self.assertIn("si units", phrase_forms("SI units"))


class SearchTextTests(unittest.TestCase):
    def test_drops_class_filler(self):
        self.assertEqual(search_text("Explain litmus in Class 10 science."), "litmus")

    def test_drops_syllabus_filler(self):
        self.assertEqual(
            search_text("How does Oxidation work in the SEE science syllabus?"),
            "Oxidation",
        )

    def test_drops_confused_filler(self):
        self.assertEqual(
            search_text("I am confused about Pathogen. Where should I look in the textbook?"),
            "Pathogen",
        )

    def test_keeps_physics_work(self):
        self.assertEqual(search_text("What is work?"), "work")

    def test_ordinary_question_kept(self):
        self.assertEqual(search_text("why does ice float on water"), "why does ice float on water")


if __name__ == "__main__":
    unittest.main()
