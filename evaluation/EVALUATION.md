# Clariq tutor evaluation notes

Working notes for a later quality report. This folder is **not** training data. The 60 questions are held out so they can show how the tutor behaves when it does not have an exact scripted reply.

**Date of first run:** 17 September 2026  
**Live Hub provider that day:** `LLM_PROVIDER=hf_space` (`Susu11/socratic`, Qwen3-4B Instruct + Socratic LoRA)  
**Local GGUF (not used for the 60-item files):** `models/socratic-phi3-q8_0.gguf` (Phi-3)

---

## 1. What this eval is for

Separate **model behaviour** from **Hub + RAG behaviour**.

| File | Role |
| --- | --- |
| `eval_set.py` | 60 fixed questions |
| `run_eval.py` | Sends questions, cheap red-flag scan, writes JSON |
| `raw_model.json` | Fine-tuned Space only (no Clariq RAG, no Hub prompts) |
| `rag_hub.json` | Production path: `POST /api/chat` (RAG + Hub prompts + turn policy + same Space) |

The intended comparison: same 60 prompts, two stacks. The **diff** answers “is the bad reply the weights, or retrieval/prompt wrapping?”

---

## 2. Eval set design

Each row is `(category, question, concept_hint)`.

`concept_hint` is either one of the ~54 **trained Socratic concepts**, or `out_of_bank`.

Twelve items in each category:

| Category | What it tests |
| --- | --- |
| `direct_conceptual` | Bare “what is X?” — the failure from the student transcript (“what is light?”) |
| `misconception` | Confidently wrong claim: push back vs agree |
| `confused_stuck` | “I don’t get it” with **no prior turn** in this eval (single-shot) |
| `topic_switch` | Pivot inside one user message |
| `ambiguous_difficult` | Underspecified (“why?”, “explain this”) |

Example in-bank mapping that matters for the report: **“What is light?”** is labelled `Dispersion of light`. That is the training-script collapse we are measuring, not a gold “correct chapter.”

---

## 3. How to run

From the repo, with the backend venv (needs `requests`, and `gradio_client` for `hf_space`):

```bash
source backend/clariq_env/bin/activate
cd evaluation

# Raw fine-tuned Space (no RAG)
python3 run_eval.py --url hf_space --out raw_model.json --tag raw --timeout 180

# Hub + RAG (FastAPI must be up)
python3 run_eval.py --url http://127.0.0.1:8000/api/chat --out rag_hub.json --tag hub --timeout 180
```

Optional OpenAI-compatible raw server (llama.cpp / Modal):

```bash
python3 run_eval.py --url "$MODAL_BASE_URL/chat/completions" \
  --out raw_model.json --api-key "$MODAL_API_KEY" --model socratic-phi3
```

Useful flags: `--limit N`, `--start N`, `--mode strict`. Hub items use a fresh `session_id` (`eval-{tag}-{id}`) so questions do not bleed into each other.

Do **not** run Space and Hub in parallel: both hit the same ZeroGPU Space.

---

## 4. Automatic flags (not human grades)

`run_eval.py` only triages. Manual reading still required.

| Flag | Meaning |
| --- | --- |
| `ERROR` | HTTP / quota / empty provider failure |
| `EMPTY_OR_TOO_SHORT` | Fewer than 3 words |
| `NO_QUESTION_MARK` | Did not ask a question (Strict/Socratic leak) |
| `POSSIBLY_MALFORMED` | Broken punctuation / truncated sentence |
| `POSSIBLE_MEMORIZATION_LEAK:{concept}` | Training fingerprint on a **different** concept |
| `SCRIPT_COLLAPSE:{concept}` | Generic “what is X?” answered with that concept’s **scripted vignette** |
| `DIRECT_DEFINITION` | Looks like a definition dump on a conceptual question |
| `MAY_HAVE_AGREED` | Possible agreement with a misconception |
| `DID_NOT_FOLLOW_TOPIC_SWITCH` | Second topic in a pivot not mentioned |

Training fingerprints used as leak detectors include:

- Dispersion: “white light passing through a (glass) prism”, “band of colo(u)rs from violet to red”
- Inertia: bus suddenly brakes
- Electric current: bulb connected to a battery lights up
- Nutrition in plants: plants don’t eat like we do

Absence of a flag is **not** a pass. Example: “What is an isotope?” → carbon bonding had **no** fingerprint flag but is still off-topic.

---

## 5. First-run results (17 Sep 2026)

### 5.1 Infrastructure (confounds for the report)

- Hub was **Hugging Face Space**, not Modal and not local GGUF.
- Modal `.../v1/chat/completions` returned **404** (GPU server not serving that path).
- ZeroGPU **free quota exhausted** mid-run (~180s requested vs leftover seconds; reset quoted ~24h).
- Local Phi-3 Q8 on CPU: **~21 s load + ~702 s for 54 tokens** on 8 threads. Full 60-item local GGUF eval is not practical on this machine.

So `raw_model.json` vs `rag_hub.json` is **not** a clean 60-vs-60 ablation. Treat them as a **pilot**.

### 5.2 Raw Space (`raw_model.json`)

- **60** items written.
- **49** `ERROR` (ZeroGPU quota).
- **11** real generations (enough to see the failure mode).

Real replies worth quoting in a report:

| ID | Question | What happened |
| --- | --- | --- |
| 2 | What is electric current? | In-bank **battery–bulb** script (`SCRIPT_COLLAPSE:Electric current`) |
| 4 | What is photosynthesis? | **“Plants don’t eat like we do”** (`SCRIPT_COLLAPSE:Nutrition in plants`) |
| 6 | What is an isotope? (`out_of_bank`) | **Carbon covalent bonds / chains and rings** — wrong chapter |
| 9 | What is DNA? | Etymology of “deoxyribonucleic” — on-topic but pedantic |
| 11 | What is a lever? | Full definition + first-class lever (`DIRECT_DEFINITION`) |
| 13 | Heavier objects fall faster… | Feather vs coin — reasonable Socratic pushback |
| 15 | Lightning never strikes twice | Electrostatic / cloud charge — relevant enough |
| 17 | Humans use 10% of the brain | Challenges the myth |
| 21 | All reactions release heat | Points at “exothermic” |
| 23 | Glass is a slow liquid | Melting sand / cooling — reasonable |
| 27 | “Give me a hint” (hint labelled digestion) | Kinetic energy of a moving object — **no topic, invented a lesson** (`NO_QUESTION_MARK`) |

**Claim this supports:** script collapse and off-bank hijack happen **without RAG**. The LoRA/Space model is already mapping generic questions onto memorized Grade 10 vignettes.

### 5.3 Hub + RAG (`rag_hub.json`)

- Almost all rows are **`502` from `/api/chat`** after quota (Space is the Hub’s LLM).
- **ID 0** was filled from a successful Hub call **before** quota death (see `note` on that object).

Hub reply to **“What is light?”**:

> Here's a question for you: White light passing through a prism splits into a band of colours from violet to red. Since all these colours were hidden inside the white light, what do you think must be different about each colour that causes them to separate?

That is the **dispersion/prism training turn**, not a general account of light.

Earlier student transcript (same product bug, not in these JSON files but should go in the report):

1. “What is motion?” → shopping-cart / force (good opener).
2. “We push it with force so” → “That’s it exactly.” (loop died).
3. “What is proton?” → full definition (Strict broken).
4. “Why are you giving a direct answer?” → **prism / colours of light** (meta ignored, chapter hijack).

Hub now has canned identity/meta replies in `backend/app/pipelines/turn_policy.py`. Those were not in this 60-item single-shot science set.

### 5.4 Local Phi-3 GGUF (one-off, not in the JSON)

Prompt: Socratic Grade 10 tutor, **“What is light?”**, `max_tokens=80`.

Reply (paraphrase from the run): light travels in straight **rays**; **refraction** air→water; straw looks bent.

Same failure **class** as the Space (nearest “light” lesson instead of the asked question) but a **different vignette** (refraction vs dispersion). Do not treat Space Qwen and local Phi-3 as the same model in the report.

### 5.5 RAG retrieval (Chroma, same day)

`retrieve_documents` + `filter_relevant_docs` on the textbook index:

| Query | Retrieved / kept | What came back |
| --- | --- | --- |
| What is light? | 3 / 3 | NCERT/CDC light chapter: rainbow, rays, **prism spectrum / dispersion** |
| What is an isotope? | 3 / 3 | Glossary isotopes — **on topic** (model still talked carbon bonding on Space) |
| What is a food web? | 3 / 3 | Food web definitions — on topic |
| “Give me a hint.” | 3 / **0 kept** | Unrelated (magnetic flux, doping, eye test). Filter dropped them; if Hub still injects unfiltered context in any path, this is the hijack source. |
| “Why are you giving a direct answer?” | 3 / **0 kept** | Textbook junk (food web MCQ, visible spectrum). Meta should skip RAG (canned path). |

**Claim this supports:** for “What is light?”, RAG **agrees with the training script** (prism). Retrieval is “relevant” by keyword `light` but **narrows** a generic question to Chapter “Colourful World.” That is contamination by **over-specific context**, not empty context.

Hub also prepends system + “Retrieved context” into the **user** message (`hf_space_chat.split_space_payload`) while the Space `generate_response` already applies `SOCRATIC_SYSTEM_PROMPT`. Double instruction + PDF dump is a second quality risk.

---

## 6. Diagnosis (use this as the report thesis)

The tutor is failing because it was trained as a **bank of ~54 Socratic skits**, then deployed with **“never give the final answer”** and **textbook RAG**.

1. **Script collapse.** Generic “what is X?” is answered with the skit for the nearest trained concept (light → prism; photosynthesis → plants don’t eat; current → battery and bulb).
2. **Poor out-of-bank generalisation.** “What is an isotope?” became carbon chemistry on the Space, despite RAG containing a real isotope glossary.
3. **No-topic turns invent a lesson.** Confused/ambiguous prompts still emit a guiding question about some chapter.
4. **RAG reinforces (1)** when the query token matches a famous chapter (`light` → dispersion).
5. **Stack mismatch.** Production chat was Qwen-on-Space; local eval GGUF is Phi-3; Modal was 404. Quality complaints can mix three runtimes.

This is **not** primarily “the 4B model is too small to know science.” Several misconception items were fine. The failure is **policy + training format + retrieval narrowing**.

---

## 7. What a later report should still measure

When ZeroGPU quota (or Modal / a warm llama.cpp server) is available, re-run **both** JSON files to 60/60 without `ERROR`, then count:

- Script collapse on `direct_conceptual` (in-bank vs out-of-bank)
- Off-topic rate (`isotope`, `food web`, confused_stuck)
- Topic-switch follow-through
- Clarify-vs-invent on `ambiguous_difficult`
- Misconception: challenge vs agree
- Definition dumps in Strict

Fair ablation requires the **same weights** on both legs (e.g. both Modal GGUF, or both Space). Today’s Hub vs Space comparison is the same Qwen LoRA; Hub vs local Phi-3 is not.

---

## 8. Suggested report outline

1. Problem: student transcript (motion / proton / meta → prism).
2. Method: 60 held-out items, raw vs Hub.
3. Limitations: quota, 404 Modal, CPU GGUF latency, single-shot (no multi-turn history except topic_switch packed into one message).
4. Results: tables from the JSON + quotes in §5.
5. Root cause: scripted fine-tune + Socratic constraint + RAG chapter narrowing + dual prompts.
6. Recommendations (not implemented in this eval pass):
   - Retrain / mix generic definition openers that stay on X, not a sub-lesson.
   - If question is “what is X?”, retrieve only chunks about X as a **term**, or skip RAG on first turn.
   - If tokens after stopword stripping are empty, **ask what topic** — do not retrieve.
   - Stop stuffing Hub system+context into the Space user slot; pass system separately or merge once.
   - Eval on one runtime; keep Space vs GGUF as a **model** comparison, not a RAG comparison.

---

## 9. Commands to regenerate numbers from saved JSON

```bash
python3 - << 'PY'
import json
from collections import Counter
from pathlib import Path
here = Path("evaluation")
for name in ("raw_model.json", "rag_hub.json"):
    rows = json.loads((here / name).read_text())
    flags = Counter(f for r in rows for f in r["flags"])
    errors = sum(1 for r in rows if "ERROR" in r["flags"])
    real = [r for r in rows if "ERROR" not in r["flags"]]
    print(name, "n=", len(rows), "errors=", errors, "real=", len(real))
    print("  flags", dict(flags))
    for r in real:
        print(f"  id={r['id']} {r['category']}: {r['question'][:60]!r}")
        print(f"    flags={r['flags']}")
        print(f"    { ' '.join(r['answer'].split())[:160] }")
PY
```
