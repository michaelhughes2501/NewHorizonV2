# 07 — Refactor Plan

## Ground rules

- `npm run build` (Vite) must succeed on every PR.
- `npm start` must launch the server without error.
- No PR silently disables `helmet`, the `foreign_keys` pragma, WAL, or the CASCADE FKs.
- The `STACK_NOTE.md` policy — no Supabase migration — is load-bearing.

## Phase A — Correctness + hygiene

### A1. (Done) Delete `mayhem-for-api.yml`
Done in this pass.

### A2. (Done) Fix `.gitignore` Windows separator
Done in this pass.

### A3. Rename `engineerring report/` → `engineering-report/`
- Effort: 5 min + git-mv.

### A4. Untrack `agent-reports/*.json`, keep `.gitkeep`
- Effort: 15 min. Reduces per-commit noise.

### A5. Rename `lint` script → `typecheck`; add real `lint` backed by ESLint
- Effort: 45 min. Config + typescript-eslint + react-hooks + tailwind.

### A6. Reconcile `ci.yml` `npm install` vs the committed `package-lock.json`
- Effort: 15 min. Either `npm ci` + updated comment, or delete the lockfile.

### A7. Add `README.md` link to `STACK_NOTE.md`
- Effort: 2 min.

## Phase B — Test bar

### B1. Add `vitest` + `supertest` + `@testing-library/react`
- Effort: 1 hr.

### B2. Write functional tests for the auth flow (register, login, logout, delete)
- Effort: 3 hrs.

### B3. Write one smoke test per resource route (18 resources)
- Effort: 6 hrs.

### B4. Wire `npm test` into `ci.yml`
- Effort: 15 min.

## Phase C — Split `server.ts`

### C1. Extract `db.ts` (open + pragmas + close)
- Effort: 30 min.

### C2. Extract `middleware/{requireAuth, requireAdmin, validateBody, rateLimit}.ts`
- Effort: 2 hrs.

### C3. Extract one router per resource
- Effort: 6 hrs (18 resources × ~20 min each including tests).

### C4. Wire everything into `server.ts` as a thin bootstrap
- Effort: 30 min.

### C5. Add `zod` schemas for every request body
- Effort: 4 hrs.

## Phase D — Security hardening

### D1. Add `express-rate-limit` on `/api/auth/*`
- Effort: 30 min.

### D2. Migrate `nh_token` from `localStorage` to `httpOnly` cookie
- Effort: 2 hrs (frontend + backend + session refresh flow).

### D3. Add expired-session sweep (cron via `node-cron` or `setInterval`)
- Effort: 30 min.

### D4. Verify every admin route has `requireAdmin`
- Effort: 30 min (read every admin route).

### D5. Wire Sentry / equivalent
- Effort: 30 min.

## Phase E — Migrations + backup

### E1. Introduce versioned migrations (`src/backend/migrations/`)
- Effort: 3 hrs. Convert the current try/catch pattern into numbered up() functions.

### E2. Wire nightly `Database.backup()` to a `backups/` folder
- Effort: 45 min. Add `backups/` to `.gitignore`.

### E3. Document restore procedure in `docs/runbook.md`
- Effort: 30 min.

## Phase F — Deploy

### F1. `Dockerfile` + `.dockerignore`
- Effort: 45 min.

### F2. Pick a deploy target and commit config
- Effort: 45 min.

### F3. Provision managed volume for `data/app.db` + document
- Effort: 1 hr.

## Effort estimate

| Phase | Steps | Effort |
|-------|-------|--------|
| A | 7 | ~2 hrs |
| B | 4 | ~10 hrs |
| C | 5 | ~13 hrs |
| D | 5 | ~4 hrs |
| E | 3 | ~5 hrs |
| F | 3 | ~2.5 hrs |
| **Total** | **27 PRs** | **~36 hrs** |

## Explicit non-goals

- **Migrate to Supabase.** Per `STACK_NOTE.md`. Do not.
- **Rewrite the frontend in Next.js.** Vite + React is fine.
- **Introduce a message queue.** Nothing needs one yet.
- **Add TypeScript to the meta-agents (buildagent/, etc.).** They're Python — keep them Python.
