# Clariq backend plan

Stack: **FastAPI** under `backend/app/`. RAG: Chroma + Ollama embeddings. Tutor: `backend/app/pipelines/rag.py` + `backend/app/prompts.py`. Auth: Google JWT. Materials: SQLite catalog + per-user Chroma chunks.

Goal: keep a **Socratic RAG tutor**. Do not turn `/api/chat` into a dump-the-answer chatbot. Do not rewrite the engine in another framework.

Out of scope for this track: frontend pixels, Three.js, Next.js, replacing Qwen/Groq/HF routing unless it is already in `config.py`.

---

## Current contract

`POST /api/chat` body: `question`, `session_id`, `socratic_mode` (`strict` | `guided` | `direct`).

Response: `answer`, `session_id`.

Optional JWT: personal note chunks + shared textbook (`retrieve_documents` in `backend/app/storage/chroma.py`). Invalid JWT must not block textbook chat (`get_optional_user`).

Other routes: `/health`, `/api/auth/*`, `/api/materials` (+ reindex, delete).

Sessions: Redis or in-memory (`backend/app/storage/sessions.py`).

---

## Work packages

### B1 — Stabilize chat for the new UI (small, compatible)

Add **optional** fields on `ChatResponse` so the frontend can style turns without guessing:

- `move_type`: `question` | `hint` | `explanation` (default `question`)
- `sources`: list of `{ "kind": "notes" | "textbook", "title": str }` from retrieved docs (cap 3)

Keep `answer` as today. Old clients ignore extra JSON.

**Files:** `backend/app/schemas/chat.py`, `backend/app/api/routes.py`, `backend/app/pipelines/rag.py`.

**Heuristic for `move_type` (no extra LLM call):** last non-empty sentence ends with `?` → `question`; `socratic_mode == "guided"` and no `?` → `hint`; `direct` → `explanation` if no `?`. Prompt still requires a closing question in strict/guided.

**Test:** Swagger `POST /api/chat` still returns 200 with `answer`; extra keys present.

### B2 — Do not break Socratic prompts

- Keep one question per turn in `prompts.py`.
- Context label: student notes vs textbook (already in `_format_context`).
- No “dump the PDF”.

**Test:** DNA / photosynthesis threads stay on topic (regression you already care about).

### B3 — Auth and materials (maintenance)

- Materials still JWT-only; guests textbook-only.
- Stale JWT on `/api/chat`: optional user → `None` (already).
- Size limits, Ollama-down → 503 + `indexed: false` (already).

Only change if bugs appear. **Files:** `auth/jwt_tokens.py`, `api/materials_routes.py`.

### B4 — Health honesty

`/health` should keep reflecting the active LLM provider (`LLM_PROVIDER` in `routes.py`) so the frontend badge is not “Groq false = dead” when using HF Space.

No GGUF load on health.

### B5 — Progress API (after F5 exists)

Later, not blocking frontend cards:

- `GET/POST /api/progress` keyed by JWT: topic ids, session counts.
- Until then frontend may use localStorage.

### B6 — Streaming (optional, after B1)

Socratic turns are short; **REST is enough**. If you add streaming:

- Prefer **SSE** `GET` or `POST` `/api/chat/stream` emitting the same final `answer` + `move_type`.
- Do not WebSocket the tutor unless you add live presence.

Do not start B6 until the UI needs it.

---

## Explicitly later (not this backend plan)

- Fine-tuning per student notes
- New vector DB
- OCR / Drive
- LangGraph rewrite

---

## Integration with frontend

Frontend plan F5 can ship with heuristics. F6 consumes B1 fields.

```
Tutor UI  --POST /api/chat-->  rag.ask()  --> Chroma filter user_id|shared  --> LLM  --> { answer, move_type?, sources? }
```

---

## Risks

- Extra LLM classifier for `move_type` = latency and cost; use heuristics first.
- `--reload` + local GGUF can crash; students should use Groq/HF Space as already configured.
- Port 8000: one uvicorn (`app.main:app` from `backend/`), not `main:app`.

---

## Done when

`/api/chat` remains Socratic, RAG isolation holds, and the frontend can style question vs hint vs sources without a breaking change to `answer`.
