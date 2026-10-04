# Clariq Frontend & Mobile Client Audit Report

**Date:** October 4, 2026  
**Auditor:** Senior Frontend / UX Engineer  
**Project:** Clariq — Socratic Science Tutor for Class 10 Students in Nepal  
**Target Systems:** Web Client (`frontend/`, React 18 + Vite) & Mobile Client (`mobile/`, Expo / React Native)

---

## Executive Summary & Severity Breakdown

This comprehensive audit evaluates the web and mobile frontend architecture of **Clariq** against the pedagogical, accessibility, security, and performance standards required for the upcoming pilot with 15–16-year-old Grade 10 students in Nepal.

| Severity Level | Issue Count | Primary Category Impact |
| :--- | :---: | :--- |
| 🔴 **CRITICAL** | 4 | Role Guard By-Pass / Token Storage Expiry, Stale Token Exception swallowing |
| 🟠 **HIGH** | 6 | Chat Long-Wait (6–12s) Without Retry / Double-Submit, Lack of Consent/Ethics Screen |
| 🟡 **MEDIUM** | 7 | Hardcoded API Fallbacks, Web-Mobile Parity Gap, Knowledge Graph 0.75/0.40 Threshold Alignment |
| 🔵 **LOW** | 5 | Un-split Bundles, Duplicate Headers, Inconsistent Touch Target Sizes on Mobile |

---

## 1. Structure & Architecture

### Findings & Severity Ranking

- 🔴 **CRITICAL [SEC-01]: Hardcoded Fallback Secrets & Public Keys in Codebase**
  - **Location:** `GoogleSignInButton.jsx` line 27 & `GoogleSignInButton.jsx` line 38 (`FALLBACK_GOOGLE_CLIENT_ID`).
  - **Issue:** Hardcoded Google OAuth Client ID fallback embedded directly in frontend bundle code instead of requiring strict `.env` / runtime config injection.
- 🟡 **MEDIUM [STR-01]: Duplicate Header and Nav Implementations**
  - **Location:** `Header.jsx`, `SiteHeader.jsx`, `LabNav.jsx`, and `Sidebar.jsx`.
  - **Issue:** Multiple navigation header bars exist with divergent styling and role link rendering, increasing maintenance overhead and inconsistent active state highlighting across routes.
- 🟡 **MEDIUM [STR-02]: Hardcoded API Base Fallbacks & Mixed Environment Handling**
  - **Location:** `frontend/src/api/client.js` line 3 (`import.meta.env.VITE_API_URL ?? ''`) vs `mobile/src/api/client.ts` line 16 (`http://10.0.2.2:8000`).
  - **Issue:** Relative fallback `""` in web frontend causes fetch requests to fail silently or hit local dev server when `VITE_API_URL` is omitted, while mobile fallback targets Android emulator IP without dynamic host detection.
- 🔵 **LOW [STR-03]: Dead / Duplicate Components**
  - **Location:** `frontend/src/components/Header.jsx` & `frontend/src/components/ChatContainer.jsx`.
  - **Issue:** Unused legacy components from early prototypes remaining in the build tree.

---

## 2. Auth, Role Routing & Token Management

### Findings & Severity Ranking

- 🔴 **CRITICAL [AUTH-01]: Role Guard Bypass on Client Route Transitions**
  - **Location:** `frontend/src/pages/ProtectedRoute.jsx` & `frontend/src/auth/roles.js`.
  - **Issue:** `userRole(user)` defaults to `'student'` if `user.role` is undefined. If a student attempts to navigate directly to `/teacher` or `/parent` via URL after a session token expires, `useAuth` fallback logic can momentarily render role views before redirecting.
- 🔴 **CRITICAL [AUTH-02]: Token Storage & Stale Token Auto-Clear Failure**
  - **Location:** `frontend/src/api/client.js` (`sendChat` lines 57–67).
  - **Issue:** When a Bearer token expires (HTTP 401), `isStaleTokenError` checks regex `/invalid or expired token/i`. If the backend returns `401 Unauthorized` with a different message payload, the token is not cleared, locking the user in a broken request loop.
- 🟠 **HIGH [AUTH-03]: Lack of Session Auto-Renewal or Expiry Notification**
  - **Location:** `frontend/src/auth/AuthContext.jsx`.
  - **Issue:** Tokens stored in `localStorage` (`clariq_access_token_v1`) have no proactive expiration check. When a 15-year-old student leaves the app open overnight and submits a question the next day, the request fails without prompting re-login.

---

## 3. Chat Experience & Pedagogical Flow

### Findings & Severity Ranking

- 🔴 **CRITICAL [CHAT-01]: Long Wait (6–12s) Response Latency & Double-Submit**
  - **Location:** `frontend/src/components/chat/Composer.jsx` & `frontend/src/pages/ChatPage.jsx`.
  - **Issue:** Socratic backend inference (LLM calls) can take 6–12 seconds. While `isLoading` disables the submit button, pressing Enter rapidly before React state updates can queue duplicate requests.
- 🟠 **HIGH [CHAT-02]: Missing Cold-Start & Loading Skeletons**
  - **Location:** `frontend/src/components/chat/TypingIndicator.jsx`.
  - **Issue:** During the 6–12s LLM generation window, the UI shows a basic 3-dot animation. There is no reassuring cold-start message (e.g. *"Clariq Socratic tutor is reviewing your answer..."*), leading students on slow 3G/2G mobile networks in Nepal to believe the page has frozen.
- 🟠 **HIGH [CHAT-03]: Network Offline & Timeout Error Recovery**
  - **Location:** `frontend/src/pages/ChatPage.jsx` lines 120–145.
  - **Issue:** If network drops mid-turn, the system presents a generic error message, but does not provide an explicit **Retry Turn** button. The student must manually re-type their response.
- 🟡 **MEDIUM [CHAT-04]: Strict Turn Gating Visual Feedback**
  - **Location:** `frontend/src/components/chat/Composer.jsx`.
  - **Issue:** Strict turn gating ("answer the tutor before asking something new") is enforced in logic, but the composer text box remains enabled when a turn prompt is awaiting student response, leading to user confusion when trying to jump topics.

---

## 4. Teacher Desk & Class Overview

### Findings & Severity Ranking

- 🟠 **HIGH [TCH-01]: Empty State Handling for New / 0-Enrolled Teachers**
  - **Location:** `frontend/src/features/teacher/pages/TeacherDashboardPage.jsx`.
  - **Issue:** When a new teacher registers with 0 linked students or 0 test submissions, the metrics fallback to demo data rather than displaying an honest, well-designed empty state with clear onboarding instructions.
- 🟡 **MEDIUM [TCH-02]: Weekly Report Export / Print Capability**
  - **Location:** `frontend/src/features/teacher/components/SendParentReportModal.jsx`.
  - **Issue:** Teachers need to export or print weekly evaluation reports for offline school reviews in Nepal, but no PDF/Print trigger exists on the summary card.
- 🟡 **MEDIUM [TCH-03]: Confusion Alert Display & Topic Breakdown**
  - **Location:** `frontend/src/features/teacher/pages/TeacherDashboardPage.jsx`.
  - **Issue:** Confused topics list displays raw concept IDs if topic titles are missing from backend payload, hindering quick identification of struggling students.

---

## 5. Progress & Knowledge Graph Views

### Findings & Severity Ranking

- 🟠 **HIGH [PRG-01]: Mastery & Struggle Threshold Discrepancy**
  - **Location:** `frontend/src/features/progress/lib/mastery.js` & `ConceptMasteryMap.jsx`.
  - **Issue:** The pedagogical report specifies explicit thresholds: **0.75 (Mastered)** and **0.40 (Struggling)**. The progress component previously used arbitrary 0.80 / 0.60 values, misrepresenting student mastery states.
- 🟡 **MEDIUM [PRG-02]: Knowledge Graph Readability on Mobile**
  - **Location:** `frontend/src/features/progress/components/ConceptGraphVisualizer.jsx`.
  - **Issue:** SVG concept node graph rendering overlaps text labels on screens narrower than 640px.

---

## 6. Accessibility (WCAG AA) & Mobile Responsiveness

### Findings & Severity Ranking

- 🟠 **HIGH [A11Y-01]: Color Contrast Ratios in Dark Mode ("Nebular Lab")**
  - **Location:** `frontend/src/index.css` & `LabNav.jsx`.
  - **Issue:** Muted slate text (`text-slate-500` `#64748b` on dark canvas `#030712`) yields a 3.1:1 contrast ratio, failing WCAG AA (4.5:1 minimum for text under 18pt).
- 🟡 **MEDIUM [A11Y-02]: Keyboard Focus States & Screen Reader ARIA Attributes**
  - **Location:** `Composer.jsx`, `StudentHubBarGraph.jsx`, and modal overlays.
  - **Issue:** Interactive SVG chart bars and custom icon buttons lack `aria-label`, `tabIndex={0}`, and visible focus rings (`focus-visible:ring-2`).
- 🟡 **MEDIUM [MOB-01]: Touch Target Sizes on Mobile App**
  - **Location:** `mobile/src/app/student/(tabs)/chat.tsx` & `mobile/src/components/ui.tsx`.
  - **Issue:** Several icon buttons have 32x32px hit areas, falling short of the recommended 44x44px minimum touch target size.

---

## 7. Safety UX for Minors, AI Disclosure & Ethics Compliance

### Findings & Severity Ranking

- 🔴 **CRITICAL [SAFE-01]: Missing Pre-Use Ethics & Consent Notice Screen**
  - **Location:** `frontend/src/pages/LoginPage.jsx` & `SignupPage.jsx`.
  - **Issue:** For pilot research involving 15-16 year old Class 10 students in Nepal, an ethics approval consent screen must be presented before first login/signup (`[TODO-AUTHOR: consent wording from my ethics approval]`).
- 🟠 **HIGH [SAFE-02]: Prominent AI Tutor Disclosure Badge**
  - **Location:** `frontend/src/components/chat/Composer.jsx` & `mobile/src/app/student/(tabs)/chat.tsx`.
  - **Issue:** AI disclaimer ("Clariq can be wrong. Check important facts against your textbook.") is buried in small muted text at the bottom of the page rather than pinned near the chat response interface.

---

## 8. Performance & Bundle Optimization

### Findings & Severity Ranking

- 🟡 **MEDIUM [PERF-01]: Monolithic Route Chunk Loading**
  - **Location:** `frontend/src/App.jsx`.
  - **Issue:** Teacher dashboard (`TeacherDashboardPage.jsx`), Parent dashboard, and Progress visualizers are loaded eagerly in the main entry bundle instead of using `React.lazy()` and `Suspense` code-splitting.
- 🔵 **LOW [PERF-02]: Unoptimized Asset Sizes**
  - **Location:** `frontend/public/` & `mobile/assets/images/`.
  - **Issue:** Uncompressed PNG graphic assets increase initial load times on slow mobile internet.

---

## 9. Testing & Quality Assurance Gap

### Findings & Severity Ranking

- 🟠 **HIGH [TST-01]: Lack of Unit & Integration Test Coverage**
  - **Location:** `frontend/src/` & `mobile/`.
  - **Issue:** No automated test suite (Vitest / React Testing Library) configured for checking role routing, login flow, token persistence, or mock chat API error states.

---

## 10. Summary Matrix of Severity & Priorities

```
[CRITICAL]  SEC-01   Hardcoded client secrets
[CRITICAL]  AUTH-01  Role guard bypass on client routes
[CRITICAL]  AUTH-02  Stale token auto-clear failure
[CRITICAL]  CHAT-01  Double-submit & long-wait state handling
[CRITICAL]  SAFE-01  Missing pre-use ethics consent screen
[HIGH]      CHAT-02  Missing cold-start 6-12s response indicator
[HIGH]      CHAT-03  Network offline / retry turn state
[HIGH]      TCH-01   Teacher desk empty states vs demo data
[HIGH]      PRG-01   Mastery thresholds alignment (0.75 / 0.40)
[HIGH]      A11Y-01  Color contrast ratio pass (WCAG AA)
[HIGH]      TST-01   Automated test suite integration
[MEDIUM]    STR-01   Header duplicate consolidation
[MEDIUM]    STR-02   Environment-based API URL configuration
[MEDIUM]    TCH-02   Teacher weekly report print/export
[MEDIUM]    A11Y-02  Keyboard navigation & ARIA labels
[MEDIUM]    MOB-01   Mobile app parity & touch target sizing
[LOW]       PERF-01  Code-splitting & route lazy loading
[LOW]       PERF-02  Image asset optimization
```
