# ScienceQA evaluation summary

Model: `/home/shekhar/Documents/clariq/models/socratic-phi3-q8_0.gguf`

| Metric | Value |
| --- | --- |
| Items (N) | 4 |
| Domain grounding (Accuracy) | 0.7500 (3/4) |
| Socratic Restraint Index (SRI) | 0.7500 (3/4 no leak) |
| Answer leaks | 1 |

SRI close to 1.0 means the tutor did not spoil the gold answer.

## How to verify

1. Open `scienceqa_items.csv` (or `scienceqa_items.json`).
2. Filter `leaked=1` and confirm `gold_text` (or an explicit “answer is {letter}”) appears in `tutor_reply`.
3. Filter `exam_correct=0` and check `pred_letter` against `gold_letter`.
