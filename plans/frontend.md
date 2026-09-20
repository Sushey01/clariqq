# Clariq frontend plan

Stack: **Vite + React** (not Next.js). Styling: Tailwind 4 + CSS variables in `frontend/src/index.css`. Routing: React Router in `frontend/src/App.jsx`. Motion already available: GSAP (`frontend/src/gsapSetup.js`) and Framer Motion.

Goal: the UI must read as a **Grade 10 Socratic learning environment**, not ChatGPT with a logo.

Out of scope for this track: Three.js / R3F / Spline, Next.js migration, rewriting FastAPI.

---

## Current surface

| Route | File | Role |
| --- | --- | --- |
| `/` | `frontend/src/pages/LandingPage.jsx` | Marketing; redirects signed-in users to `/app` |
| `/login` `/signup` | auth pages | Google + local email |
| `/demo` | `frontend/src/pages/DemoPage.jsx` | 5-turn guest Socratic chat |
| `/app` | `frontend/src/pages/HubPage.jsx` | Student home, topics, materials |
| `/app/chat` | `frontend/src/pages/ChatPage.jsx` | Tutor thread (ChatGPT-like bubbles today) |

API client: `frontend/src/api/client.js` (`POST /api/chat`, materials, Google auth). Sessions: `frontend/src/hooks/useChatSessions.js` (localStorage).

---

## Visual direction (this track)

**Clean educational + warm landing** (not a 3D science playground).

- Keep existing light/dark tokens (`--bg-canvas`, `--accent` indigo).
- Landing: spacious hero, Ask / Think / Reply, social-proof style *process* copy (inspired by Schoolhouse.world layout, not SAT/Zoom).
- Tutor: replace `chatgpt-markdown` bubble chrome with Socratic cards.
- Hub: keep as learning home (topics + My materials), not a chat inbox.

---

## Work packages

### F1 — Foundation

- Tighten `Button`, `Card`, `Badge` usage so landing/hub/chat share the same radius, type (Outfit headings, Inter body).
- Preserve `ThemeProvider` and comfortable type size.
- **Files:** `frontend/src/index.css`, `frontend/src/components/ui/*`, `frontend/src/theme/ThemeProvider.jsx`.
- **Test:** light and dark on `/`, `/app`, `/app/chat`.

### F2 — Landing

- Expand `LandingPage.jsx`: how it works, what Clariq will not do (dump answers), CTAs (demo + Google).
- Optional GSAP section reveal; honor `prefers-reduced-motion`.
- Do not add WebGL.
- **Test:** logged-out `/`; logged-in still redirects to `/app`.

### F3 — Auth chrome only

- Restyle login/signup to match landing. **Do not** change Google JWT or localStorage email logic unless a bug appears.
- **Files:** `frontend/src/pages/LoginPage.jsx`, `SignupPage.jsx`, `frontend/src/components/auth/*`.

### F4 — Hub (learning home)

- Keep topic grid, continue last thread, `MaterialsPanel`.
- Copy/labels: “session” / “topic” rather than “New chat” where easy.
- **Files:** `HubPage.jsx`, `MaterialsPanel.jsx`, `constants/app.js`.

### F5 — Socratic tutor UI (highest value)

Replace ChatGPT-style `Message.jsx` internals with:

- `SocraticQuestionCard` — AI turn that ends in a question
- `HintCard` — when mode is guided or text looks like a hint
- `StudentTurn` — student reasoning
- `YourTurnBar` — sticky “your turn” (today a Badge if last AI ends with `?`)
- Composer placeholder: “Answer the tutor…” after an AI question
- Keep paperclip upload for Google JWT users
- Keep demo lock at 5 turns

Heuristic until backend sends `move_type`: if assistant text contains `?` as last sentence → question card; `socratic_mode === 'direct'` may use a denser explanation style.

**Files:** `components/chat/*`, `ChatPage.jsx`, `ChatView.jsx`, `DemoPage.jsx`.

**Test:** demo 5 turns; signed-in thread; regenerate; mobile overlay sidebar.

### F6 — Wire new API fields (when backend is ready)

- If `ChatResponse` gains `move_type` or `sources`, render Citation chips (notes vs textbook). Fail open if fields missing.
- **Files:** `frontend/src/api/client.js`, tutor components.

---

## Explicitly later (not this frontend plan)

- `/app/progress` as a full learner model
- React Three Fiber scenes
- Streaming tokens in the composer (needs backend SSE)

---

## Risks

- Restyling chat can regress demo and pending-prompt-from-hub.
- Stale JWT: already cleared and retried in `sendChat`; keep that behavior.
- Do not put 3D next to the conversation.

---

## Done when

A stranger can tell from `/` and `/app/chat` that Clariq asks one question at a time and waits — without thinking it is ChatGPT.
