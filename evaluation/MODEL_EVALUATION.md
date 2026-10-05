# Model evaluation report

**Project:** Clariq — Socratic Grade 10 science tutor  
**Audience:** Supervisor  
**Date:** 29 September 2026  
**Deployment:** Fine-tuned tutor served on **RunPod**. Production Hub optionally adds **textbook RAG**.  
**Cross-evaluation:** The **same 100 held-out questions** and **same rubric** are used on a **named ChatGPT model** and on Clariq. That is what makes the two systems comparable.

This document is a **held-out smoke test**, not a training set. Questions must not be used to fine-tune the model.

---

## 1. Purpose

Show, in a repeatable way, whether the deployed tutor:

1. Stays on the student’s question (Grade 10 science).
2. Behaves as a **tutor** (short guiding question) rather than only a textbook dump.
3. Challenges a **wrong** student claim instead of agreeing.
4. Follows a **topic switch** when the student clearly changes chapter.
5. Asks what the student means when the query is **vague**.

### Cross-evaluation (Clariq vs ChatGPT)

A general chatbot and a specialised tutor cannot be compared by “which essay is longer.” They **can** be compared if:

- both answer the **same questions** (this 100-item set, or a 30-item subset used in a group check);
- both are scored with the **same 0 / 1 / 2 rubric** (on-topic Grade 10 tutor, not Wikipedia completeness);
- the ChatGPT run records the **exact model name** (for example GPT-4o — write the name used in the session).

Then it is fair to say: **on this tutor job, Clariq is evaluated against that ChatGPT model.** It is **not** a claim that Clariq replaces ChatGPT for all tasks.

The full protocol is **three legs** on the **same** smoke set:

| Leg | What is tested | Typical target |
| --- | --- | --- |
| **R — Reference** | Named **ChatGPT** model, same 100 questions, same rubric | ChatGPT UI or API; log model id |
| **A — Model** | Fine-tuned Clariq LLM only (no Hub RAG) | RunPod `/v1/chat/completions` |
| **B — Model + RAG** | Same Clariq weights through the Hub | `POST /api/chat` with retrieval |

**A vs B** isolates RAG. **R vs A** (and R vs B) is the **cross-evaluation** with ChatGPT. A group check of ~30 questions is the same method with a smaller N; this report standardises **N = 100**.

---

## 2. System under test

| Component | Role |
| --- | --- |
| Fine-tuned LLM | Always generates the student-visible reply (Socratic Grade 10 tutor). |
| RAG (Hub only) | Retrieves textbook (and notes) chunks and **passes them into the prompt**. The student never sees RAG as a separate message. |
| RunPod | Hosts the model for inference. |

RAG is intended to **reduce invented facts** when retrieved pages match the **current** question. If retrieval follows a short follow-up word (`sunlight`, `evaporates`) it can **ground the wrong chapter**. That is scored as off-topic, not as “RAG missing.”

---

## 3. Smoke-test design

**N = 100** single-shot items. **20** in each category. Source of truth: [`evaluation/smoke_set.py`](smoke_set.py). Items 1–60 match the earlier 60-item pilot [`eval_set.py`](eval_set.py).

| ID range | Category | What a pass looks like |
| --- | --- | --- |
| 1–20 | Direct conceptual | Stay on **X** in “What is X?”; one useful Grade 10 hint or question — not a random trained skit (e.g. light → only prism). |
| 21–40 | Misconception | **Name the claim as wrong** (or clearly challenge it) and **continue that same idea**. |
| 41–60 | Confused / stuck | Ask **which topic**, or give a tiny hint on the **named** chapter — do not invent a random lesson. |
| 61–80 | Topic switch | Follow the **second** topic in the message. |
| 81–100 | Ambiguous | Ask what they mean — do not start an unrelated chapter. |

**In-bank vs out-of-bank:** about half the items map to a trained concept name; half are `out_of_bank` (generalisation).

**Limitation:** this smoke test is **one user message per item** (except topic-switch text packed into one string). Multi-turn drift (ice → boiling → photosynthesis → prism) is **out of scope** for the 100 scores; it is noted in Section 7.

---

## 4. Scoring rubric

Each item, **each of the three legs**: **0 / 1 / 2**. Category subtotal /40. Grand total **/200** per leg (100 × 2).

Do not give ChatGPT a 2 only because the reply is longer. Score **tutor fitness** the same way as Clariq. A ChatGPT dump that is scientifically correct but never guides may score **2 on science** and **No** on **Guides** — that is expected and is part of the comparison.

| Score | Meaning |
| --- | --- |
| **2** | Fit for a Grade 10 tutor: on topic, useful next step, science not contradicted. |
| **1** | Mixed: partly useful, dump, weak challenge of a myth, or mild topic slip. |
| **0** | Fail: wrong science, wrong chapter, agrees with a myth, or not tutoring. |

Binary flags (yes/no), not added into the /200:

- **Guides:** ends with a genuine question rather than only a definition.
- **On topic:** same chapter as the student asked (after a switch: the **new** chapter).
- **Challenges error:** for misconception items only.

**Smoke pass (operational):** fewer than **10%** hard fails (score 0) per leg, and **On topic** on at least **80%** of items that received a real model reply (exclude HTTP/quota errors).

Automatic flags in [`run_eval.py`](run_eval.py) (script-collapse fingerprints, definition dumps, errors) are **triage**, not the supervisor score.

---

## 5. How to run (RunPod + Hub)

From the repository, with the backend virtualenv (`requests` installed):

```bash
source backend/clariq_env/bin/activate
cd evaluation

# Leg A — RunPod model only (set URL / key / model name from the pod)
python3 run_eval.py --set smoke \
  --url "$RUNPOD_BASE_URL/v1/chat/completions" \
  --api-key "$RUNPOD_API_KEY" \
  --model "$RUNPOD_MODEL" \
  --out smoke_runpod_model.json --tag smoke-a --timeout 180

# Leg B — Hub + RAG (API up, LLM_PROVIDER pointing at the same RunPod weights)
python3 run_eval.py --set smoke \
  --url http://127.0.0.1:8000/api/chat \
  --out smoke_hub_rag.json --tag smoke-b --timeout 180
```

Do not run both legs in parallel if they share one GPU. Each Hub item uses a fresh `session_id` so items do not contaminate each other.

Record in the result table: date, **ChatGPT model name**, RunPod GPU type, Clariq model id, `temperature`, Hub `socratic_mode` (default **strict**).

ChatGPT (leg R) is usually scored by hand or API on the **same 100 strings** in Appendix A. Do not paraphrase the questions.

---

## 6. Result sheet (fill after cross-evaluation)

**Reference model used:** ChatGPT _________________ (exact name / date)

| | R — ChatGPT | A — Clariq (RunPod) | B — Clariq + RAG |
| --- | --- | --- | --- |
| Items completed (no ERROR) | / 100 | / 100 | / 100 |
| Mean score (0–2) | | | |
| Total / 200 | | | |
| Score 2 (count) | | | |
| Score 1 (count) | | | |
| Score 0 (count) | | | |
| On topic (count) | | | |
| Guides (count) | | | |
| Direct conceptual /40 | | | |
| Misconception /40 | | | |
| Confused / stuck /40 | | | |
| Topic switch /40 | | | |
| Ambiguous /40 | | | |

**How to read the cross-evaluation**

- **R vs A:** Can the specialised tutor sit **in the same band** as that ChatGPT model **on this rubric**? Close totals (and more **Guides** on Clariq) support “comparable as a Grade 10 tutor.” Large gaps on **On topic** or misconceptions are real product gaps, not “ChatGPT is bigger.”
- **A vs B:** If B is higher on named chapters, retrieval helped. If B is worse on “What is light?” or vague items, RAG **narrowed to the wrong page**.
- If A and B share the same off-topic skit, the issue is **weights**, not RAG.

Totals are **blank until scored**. Do not present empty cells as completed results.

---

## 7. Findings already observed (smaller pilots)

These are **not** substitutes for the 100-item scores. Use them as known risks while the smoke run completes.

| Behaviour | Example | Implication |
| --- | --- | --- |
| Script collapse | “What is light?” → prism / spectrum | In-bank skit instead of the asked term |
| Wrong chapter via RAG or keywords | “sunlight” in a photosynthesis thread → prism | Retrieval on the **latest words**, not the thread topic |
| Conversation stop | Motion / ice density → “That’s it exactly” / “That’s correct” | Tutor voice without a next question |
| Myth handling mixed | Heavier objects fall faster — may not clearly reject | Misconception category must be scored strictly |
| Pilot size | 60-item set; Space quota left many ERRORs | RunPod should be used for a **full 100×2** pass |

ScienceQA was only **N = 4** in an earlier smoke; it is **not** reported here.

---

## 8. Statement for the supervisor

Clariq is a **specialised Socratic Grade 10 tutor** on **RunPod**, with optional **textbook RAG**. It is **cross-evaluated** against a **named ChatGPT model** using this **held-out 100-question set** and a **shared rubric**. That protocol is what makes the comparison valid: **same questions, same scoring, tutor fitness** — not model size.

A smaller group check (~30 questions, same idea) is consistent with this method; this report is the **standard N = 100** version.

Known product work after scoring: **sticky-topic retrieval** and **multi-turn** correction on the same question.

---

## Appendix A — Smoke questions (N = 100)

Numbering is 1-based for the report; `smoke_set.py` is 0-based in JSON `id` when `--start 0`.

### A. Direct conceptual (1–20)

| # | Question |
| --- | --- |
| 1 | What is light? |
| 2 | What is motion? |
| 3 | What is electric current? |
| 4 | What is a chemical reaction? |
| 5 | What is photosynthesis? |
| 6 | What is velocity? |
| 7 | What is an isotope? |
| 8 | What is a food web? |
| 9 | What is evaporation? |
| 10 | What is DNA? |
| 11 | What is sound? |
| 12 | What is a lever? |
| 13 | What is friction? |
| 14 | What is gravity? |
| 15 | What is an acid? |
| 16 | What is refraction? |
| 17 | What is a food chain? |
| 18 | What is inertia? |
| 19 | What is rusting? |
| 20 | What is the pH scale? |

### B. Misconception (21–40)

| # | Question |
| --- | --- |
| 21 | The sun revolves around the Earth, right? |
| 22 | Heavier objects fall faster than lighter ones, don't they? |
| 23 | Plants only need water to grow, that's it, right? |
| 24 | Lightning never strikes the same place twice, right? |
| 25 | Energy stays the same at every level of a food chain, doesn't it? |
| 26 | Humans only use 10% of their brain, right? |
| 27 | Metals conduct electricity because they're shiny, right? |
| 28 | The Earth is closer to the sun in summer, isn't it? |
| 29 | Sound can travel through space just like light, can't it? |
| 30 | All chemical reactions release heat, don't they? |
| 31 | Bigger animals always need more food than smaller ones, right? |
| 32 | Glass is a type of liquid that flows very slowly, right? |
| 33 | Ice sinks in water because solids are always heavier, right? |
| 34 | We see objects because our eyes send out light, don't they? |
| 35 | Mass and weight are the same thing, right? |
| 36 | Acids are always dangerous and bases are always safe, right? |
| 37 | Current is used up as it goes around a circuit, isn't it? |
| 38 | Plants take in food from the soil through their roots, right? |
| 39 | There is no gravity on the Moon, that's why astronauts float, right? |
| 40 | White light is a single colour with no mix in it, right? |

### C. Confused / stuck (41–60)

| # | Question |
| --- | --- |
| 41 | I don't understand any of this. |
| 42 | Can you explain that again? I'm lost. |
| 43 | This makes no sense to me at all. |
| 44 | I really don't get it, give me a hint. |
| 45 | I'm confused, can you slow down? |
| 46 | None of this is making sense. |
| 47 | I don't know where to even start. |
| 48 | Sorry, I still don't understand after that hint. |
| 49 | Can you explain it a totally different way? |
| 50 | I'm just not following any of this. |
| 51 | I don't get it, can you just simplify? |
| 52 | This is too hard, I'm stuck. |
| 53 | I forgot everything from last class. |
| 54 | Wait, what were we even talking about? |
| 55 | Can you give a smaller step? I'm stuck on the last idea. |
| 56 | I think I mixed two chapters together. |
| 57 | Please don't give the full answer, just unstick me. |
| 58 | I understood until the last sentence, then I lost it. |
| 59 | Is there an everyday example? I'm not getting the words. |
| 60 | I need to start over from the beginning of this topic. |

### D. Topic switch (61–80)

| # | Question |
| --- | --- |
| 61 | What is photosynthesis? ... Actually, what is friction? |
| 62 | Can you explain resistance? ... wait, never mind, tell me about the water cycle instead. |
| 63 | What causes rusting? ... actually can we talk about the human eye instead? |
| 64 | What is an ionic bond? ... hold on, what's an acid actually? |
| 65 | Explain Newton's third law. ... actually I wanted to ask about magnets. |
| 66 | What is DNA? ... never mind, what's a food chain? |
| 67 | Tell me about electric current. ... actually, why is the sky blue? |
| 68 | What is inertia? ... wait, can we do chemistry instead, like acids? |
| 69 | What's a chemical reaction? ... actually forget that, what is gravity? |
| 70 | Explain reflection of light. ... sorry, can we talk about reproduction instead? |
| 71 | What are enzymes? ... actually, what's atomic number about? |
| 72 | Tell me about waves. ... wait, what's a homologous series? |
| 73 | Why does ice float on water? ... actually, what is photosynthesis? |
| 74 | What is motion? ... wait, can we talk about acids and bases instead? |
| 75 | What is light? ... never mind, what is electric current? |
| 76 | Tell me about food chains. ... actually I wanted gravity. |
| 77 | What is an isotope? ... sorry, what's friction? |
| 78 | Explain rusting. ... hold on, what is DNA? |
| 79 | What is a lever? ... actually, why is the sky blue? |
| 80 | What is evaporation? ... wait, can we do Newton's first law? |

### E. Ambiguous (81–100)

| # | Question |
| --- | --- |
| 81 | Why does this happen? |
| 82 | What's going on here? |
| 83 | Can you explain this? |
| 84 | I don't get why. |
| 85 | Can you help me with this chapter? |
| 86 | This doesn't make sense, why does it work that way? |
| 87 | I have a question about the thing we did in class today. |
| 88 | Can you go over this topic with me? |
| 89 | What's the deal with this? |
| 90 | Explain. |
| 91 | I'm stuck on my homework, can you help? |
| 92 | Why? |
| 93 | Help. |
| 94 | I have science homework. |
| 95 | What should I study? |
| 96 | Is this important for the exam? |
| 97 | Can we do the next part? |
| 98 | Same as yesterday. |
| 99 | The diagram in the book, you know. |
| 100 | Just tell me the main point. |

---

## Appendix B — Related files

| File | Role |
| --- | --- |
| [`smoke_set.py`](smoke_set.py) | 100 questions |
| [`eval_set.py`](eval_set.py) | 60-question subset (pilot) |
| [`run_eval.py`](run_eval.py) | `--set smoke` runner |
| [`EVALUATION.md`](EVALUATION.md) | Engineering notes from the 60-item pilot |
