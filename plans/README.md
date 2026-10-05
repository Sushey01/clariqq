# Clariq implementation plans

Work **frontend** and **backend** first. 3D, Spline, and a Next.js rewrite are out of scope until those two tracks are solid.

| Document | Scope |
| --- | --- |
| [frontend-structure.md](frontend-structure.md) | Folder map, routes, 3D isolation rules — follow this while coding |
| [frontend-research.md](frontend-research.md) | Full Schoolhouse.world research, 3D options, visual directions |
| [frontend.md](frontend.md) | Shorter Vite + React **implementation** work packages (F1–F6) |
| [backend.md](backend.md) | FastAPI, RAG, Socratic replies, auth, materials, **knowledge graph** (135 nodes + progress APIs), remaining B1 / P@3 |

Do not delete existing code. Do not replace the RAG/Socratic engine with a generic chatbot.

**Suggested order:** backend contract fields that the tutor UI needs (`move_type` / sources) can land in parallel with frontend Socratic cards, but the Python tutor loop stays the source of truth.
