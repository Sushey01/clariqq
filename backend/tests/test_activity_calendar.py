import os
import tempfile
import unittest
from datetime import date, datetime, timezone
from pathlib import Path
from unittest.mock import patch

from app.storage.mastery import _current_streak, _longest_streak


class StreakMathTests(unittest.TestCase):
    def test_current_uses_yesterday_if_today_empty(self):
        today = date(2026, 9, 30)
        counts = {
            "2026-09-29": 2,
            "2026-09-28": 1,
        }
        self.assertEqual(_current_streak(counts, today), 2)

    def test_current_zero_when_gap(self):
        today = date(2026, 9, 30)
        counts = {"2026-09-27": 1}
        self.assertEqual(_current_streak(counts, today), 0)

    def test_longest_ignores_gaps(self):
        days = ["2026-01-01", "2026-01-02", "2026-01-04", "2026-01-05", "2026-01-06"]
        self.assertEqual(_longest_streak(days), 3)


class ActivityCalendarTests(unittest.TestCase):
    def setUp(self):
        handle, name = tempfile.mkstemp(suffix=".sqlite3")
        os.close(handle)
        self.db_path = Path(name)
        self.patcher = patch("app.storage.mastery.DB_PATH", self.db_path)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()
        self.db_path.unlink(missing_ok=True)

    def test_counts_today_and_reports_streak(self):
        from app.storage.mastery import activity_calendar, apply_score

        apply_score(
            "student-1",
            "phy_buoyancy",
            st=0.8,
            sim=0.4,
            coherence=1.0,
            map_score=0.3,
            question="why does ice float",
        )
        calendar = activity_calendar("student-1", weeks=4)
        today = datetime.now(timezone.utc).date().isoformat()
        today_row = next(item for item in calendar["days"] if item["date"] == today)
        self.assertEqual(today_row["count"], 1)
        self.assertEqual(calendar["current_streak"], 1)
        self.assertEqual(calendar["active_days"], 1)
        self.assertGreaterEqual(len(calendar["days"]), 28)


if __name__ == "__main__":
    unittest.main()
