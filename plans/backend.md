# Clariq backend plan

Stack: **FastAPI** under `backend/app/`. RAG: Chroma + Ollama embeddings. Tutor: `backend/app/pipelines/rag.py` + `backend/app/prompts.py`. Auth: Google JWT. Materials: SQLite catalog + per-user Chroma chunks. Knowledge graph: `backend/app/knowledge/` (FYP Objective 4).

Goal: keep a **Socratic RAG tutor**. Do not turn `/api/chat` into a dump-the-answer chatbot. Do not rewrite the engine in another framework.

Out of scope for this track: frontend pixels, Three.js, Next.js, replacing Qwen/Groq/HF routing unless it is already in `config.py`. DistilBERT dump-classifier and classroom WebSockets are **not** in the current cut (thesis can cite `turn_policy.ensure_socratic_reply` instead).

**Status (22 Sep 2026):** Core tutor + auth + materials are live. The SEE knowledge graph (135 nodes, mastery, inspect APIs) is live as a **side package**. Chat JSON is still `{ answer, session_id }` only.

---

## What we already had (do not rip out)

| Piece | Where | Notes |
| --- | --- | --- |
| `POST /api/chat` | `backend/app/api/routes.py`, `pipelines/rag.py` | Socratic `ask()`. Optional JWT for notes + textbook. |
| Turn policy | `pipelines/turn_policy.py`, `prompts.py` | Classify science/identity/meta; keep a `?` in strict/guided. |
| Sessions | `storage/sessions.py` | Redis or in-memory. |
| Health | `GET /health` | Reports `llm_provider` (Groq / HF Space / Modal / local). |
| Google JWT | `api/auth_routes.py` | `/api/auth/config`, `/google`, `/me`. Email/password is frontend-only. |
| Materials | `api/materials_routes.py` | JWT upload / reindex / delete. Ollama down → 503 + `indexed: false`. |
| Textbook index | `scripts/data_ingestion.py`, `storage/chroma.py` | Shared `user_id=shared`. Not pgvector (document that vs the interim report). |

**Chat contract (unchanged on purpose):** body `question`, `session_id`, `socratic_mode`. Response `answer`, `session_id`. Invalid JWT must not block textbook chat.

---

## What we just shipped (knowledge graph)

FYP Objective 4 in software, **without rewriting RAG**. Inspect: `backend/app/knowledge/README.md`.

| Piece | Where | What it does |
| --- | --- | --- |
| Catalog | `knowledge/concepts.json` | 135 nodes (Physics 45, Chemistry 50, Biology 40) + prerequisite edges. Rebuild: `python backend/scripts/build_concepts_json.py`. |
| Formulas | `knowledge/scoring.py` | `st = sim × coherence`; `m ← m + 0.25(st − m)`; `m0 = 0.5`; confused after 3× `st < 0.40`. Token overlap (no extra LLM; works if Ollama is down). |
| Store | `storage/mastery.py` | SQLite tables `knowledge_mastery`, `knowledge_events` in `users.sqlite3`. |
| Hook | `knowledge/record.py` | After a **successful** `ask()`, `routes.py` calls this in try/except. Guests skipped. Identity/meta skipped. Chat still returns if scoring fails. |
| Inspect APIs | `api/progress_routes.py` | See table below. |

| URL | Auth | Use |
| --- | --- | --- |
| `GET /api/knowledge/catalog` | none | Open in the browser: all nodes, edges, `counts`. |
| `GET /api/progress` | JWT | Nodes this student has touched. |
| `GET /api/progress/graph` | JWT | Full graph with `m`, `seen`, `confused`. |
| `GET /api/reports/weekly` | JWT | Last 7 days: weakest, confused, mean `st`. Demo export: `REPORT_EXPORT_SECRET` + header `X-Report-Export` + `?user_id=`. |

Earth remains a **tutor subject** on the frontend. The **FYP graph is Physics / Chemistry / Biology only**, as in the interim report.

Cohen’s κ is **offline** (teacher spreadsheet), not an API. No teacher school login.

Tests: `backend/tests/test_knowledge_scoring.py`.

---

## What we are doing now / still open

### B1 — Optional chat fields (not started)

Left untouched so `ChatResponse` stays `{ answer, session_id }`. When you want UI citations without heuristics:

- `move_type`: `question` | `hint` | `explanation`
- `sources`: up to 3 `{ kind: notes|textbook, title }`

**Files (when you start):** `schemas/chat.py`, then a **small** addition on the chat response. Prefer not to rewrite `rag.py`; attach sources from a second retrieve or a return-tuple later.

Frontend F5 already infers kind from `?` in `socraticKind.js`. F6 waits on this.

### B2 — Socratic prompts (maintenance)

Done. Re-run DNA / photosynthesis threads after any prompt change. Do not “improve” by answering more.

### B3 — Auth and materials (maintenance)

Done unless a bug appears.

### B4 — Health honesty (done)

`/health` already exposes `llm_provider` and provider flags.

### B5 — Progress API (engine done; UI not wired)

Backend **GET** progress/graph/weekly is live. Hub still uses **localStorage session counts**, which is not the same as mastery `m`. Next product step (only if you ask): a thin `/app` or `/app/progress` page that **reads** the new APIs. Do not mix those numbers.

### B6 — Streaming (later)

REST is enough for Socratic wait. No SSE/WebSocket until the UI needs it.

### O1 — Precision@3 (harness started, gold set not finished)

- Script: `backend/scripts/precision_at_3.py`
- Sample labels: `backend/eval/retrieval_gold.sample.jsonl` (3 template queries)
- **Now:** grow to 100 NEB-style queries and 300 passage judgments; measure P@3 on current Chroma. Do **not** migrate to pgvector unless P@3 is stuck and you have weeks.

### O3 — Latency ≤ 5s (not measured)

Log or load-test p95 on `POST /api/chat` with ~10 concurrent sessions. Bottleneck is the LLM, not the graph hook.

### O2 / serving (thesis alignment, not a rewrite)

Live router is Groq / HF Space / Modal / local GGUF (`config.LLM_PROVIDER`). Final report should **match that**, not assume LLaMA-3-8B is inside FastAPI unless you actually serve that file.

---

## Explicitly later

- Fine-tuning per student notes
- New vector DB / pgvector migration
- OCR / Drive
- LangGraph
- DistilBERT “direct answer” classifier
- Classroom WebSockets
- Teacher JWT / school class roster

---

## Integration sketch

```
Tutor UI --POST /api/chat--> rag.ask() --> Chroma --> LLM --> { answer, session_id }
                              \ after success, JWT science turn
                               record_student_turn() --> SQLite mastery
Progress UI (future) --GET /api/progress/graph--> knowledge_mastery + concepts.json
```

---

## Risks

- Scoring uses a **second** textbook retrieve in `record.py` (RAG file not modified). Extra Chroma call; must never fail the chat.
- Token-overlap `sim` is weaker than sentence-transformers cosine in the report. Good enough to demo; mention in the write-up.
- `--reload` + local GGUF can crash; prefer Groq/HF Space as configured.
- Port 8000: `uvicorn app.main:app` from `backend/`.

---

## Done when (this track)

Chat stays Socratic; RAG isolation holds; you can **open `/api/knowledge/catalog` and `/api/progress/graph`** and see 135 nodes plus a student’s `m`. Optional: labelled P@3, B1 fields, a progress page.
