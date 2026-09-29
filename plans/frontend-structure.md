# Frontend structure (easy follow)

Vite + React. Theme stays in CSS variables (`frontend/src/index.css`). **3D is last and isolated.**

## How to use this file

1. Put a new screen in `pages/`.
2. Put reusable UI in `components/ui/`.
3. Put Socratic pieces in `components/tutor/` — never in `3d/`.
4. Talk to FastAPI only through `api/client.js`.
5. Leave `components/3d/` empty until a later FYP demo.

## Folder map

```
frontend/src/
  main.jsx                 # app boot
  App.jsx                  # routes
  gsapSetup.js
  index.css                # theme tokens (do not invent a second palette)
  api/client.js            # fetch /api/chat, auth, materials
  auth/                    # session + JWT storage
  theme/                   # ThemeProvider
  constants/app.js         # subjects, starter topics, modes
  hooks/                   # useChatSessions, useBackendHealth
  pages/                   # one file per route
    LandingPage.jsx        # /
    LoginPage.jsx
    SignupPage.jsx
    DemoPage.jsx           # 5-turn guest
    HubPage.jsx            # /app learning home
    ChatPage.jsx           # /app/chat session
    ProtectedRoute.jsx
  components/
    ui/                    # Button, Card, Badge, Input, Modal, …
    layout/                # Header, Sidebar, session list
    auth/                  # AuthLayout, Google button, demo CTA
    tutor/                 # Socratic cards, YourTurnBar (2D only)
    chat/                  # ChatView, Composer, MessageList
    learning/              # MaterialsPanel, future topic cards
    settings/              # SettingsModal
    3d/                    # empty on purpose — see README inside
```

## Routes (keep this small)

| URL | Page | What the student does |
| --- | --- | --- |
| `/` | Landing | Understand Socratic; try demo or sign in |
| `/demo` | Demo | 5 turns, no account |
| `/login` `/signup` | Auth | Google or email |
| `/app` | Hub | Topics, materials, continue session |
| `/app/chat` | Chat | Socratic session |

Do not add `/app/tutor` until you are ready to alias chat. Do not add a 3D route until Phase 8.

## 3D rules (from research)

Checked against [frontend-research.md](frontend-research.md) section 7–8:

- Schoolhouse.world does **not** use Three.js on the marketing site. Do not copy 3D from them.
- **Never** put WebGL next to tutor text (`Message.jsx`, `SocraticMoveCard.jsx`).
- Physics vectors: 2D/SVG is clearer.
- Chemistry molecule / orbit: optional later, lazy load, desktop only.
- Stack later: R3F + Drei. Skip Spline.
- Until then: GSAP + CSS + your theme.

## What goes where (decision rule)

- **Page-only layout** → `pages/`
- **Used on 2+ pages** → `components/`
- **Dumb styled control** → `components/ui/`
- **Socratic meaning** (question, hint, your turn) → `components/tutor/`
- **Session chrome** (list, composer shell) → `components/chat/` + `layout/`
- **Notes upload** → `components/learning/`
- **Canvas / GLB** → `components/3d/` only, dynamic import

## Build order (still)

Landing and hub polish → tutor cards (done) → API `move_type` when backend is ready → 3D last.
