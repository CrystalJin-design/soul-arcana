# Soul Arcana Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-friendly Chinese tarot self-exploration website with server-enforced three-use access codes, resumable questions, rich results, PNG export and public result links.

**Architecture:** React/Vite frontend hosted on GitHub Pages; Supabase Edge Function and Postgres backend. A database transaction reserves one use when a new attempt begins; an existing unfinished attempt resumes without an extra use. Public result tokens disclose only the report, never the access code or raw answers. Local tests use embedded Postgres (PGlite) running the same SQL functions.

**Tech Stack:** Node 24, React, Vite, Supabase Edge Functions/Postgres, PGlite for local verification, html2canvas, qrcode, Playwright.

The user has authorized implementation, dependencies and verification in this session. Proceed through these tasks directly.

### Task 1: Content and visuals
- Create `shared/quiz.js`, `shared/cards.js`, `shared/scoring.js`, `scripts/generate-art.js`.
- Write 24 original scenario questions, eight tendency dimensions, 22 complete original archetype reports and 22 local SVG tarot illustrations.
- Verify deterministic scoring, valid input handling, report completeness, and reachability of all archetypes.

### Task 2: Access and persistence
- Create `supabase/migrations/202610120001_tarot.sql`, `supabase/functions/tarot/index.ts`, `shared/api-handler.js`, `server/index.js`, `scripts/codes.js`.
- Store random voucher hashes and hashed session tokens; use bearer sessions, restricted CORS origins, RLS, input validation and database-backed authentication rate limits.
- Atomically reserve attempts, autosave answers, return completed attempts idempotently, and serve opaque public result URLs.
- Test wrong codes, session ownership, concurrent quota exhaustion, restart persistence, edits and repeat submissions.

### Task 3: Responsive website
- Create `src/App.jsx`, `src/main.jsx`, `src/styles.css`, `index.html`, `vite.config.js`.
- Implement entrance, authenticated start, questions with previous/next controls, restored progress, result report, retest, share, review reward and help dialogs.
- Export the complete report as PNG; use desktop download and mobile image preview with file sharing or long-press fallback.

### Task 4: Verification and delivery
- Create meaningful API/scoring tests in `tests/` and verify the complete browser journey through the supported browser tools.
- Run `npm test`, `npm run build`, Deno function type checking and production dependency audit.
- Visually inspect desktop, mobile and generated long-image screenshots.
- Write `README.md`, GitHub Pages/Supabase deployment instructions, code generation and backup notes.
- Create a fresh demo voucher and open the running site for review.
