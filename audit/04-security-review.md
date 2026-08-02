# 04 — Security Review

## Strengths

- **`helmet` is installed at a pinned exact version** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options defaults out of the box.
- **`db.pragma("foreign_keys = ON")` + `ON DELETE CASCADE`** on every FK relationship. Prevents orphaned rows on user delete — a real class of bug that this app has already resolved (per the v1→v2 log).
- **`db.pragma("journal_mode = WAL")`** — safer concurrent writes on SQLite.
- **`crypto.scryptSync` with try/catch + timing-safe compare** — per the v1→v2 fix list. That's the right password-hashing pattern for a Node built-in solution.
- **`AuthContext` uses a namespaced `localStorage` key `nh_token`** — avoids collision with any generic `token` value. See L1 below on why `localStorage` for a JWT-like token is still a real concern.
- **`ALTER TABLE` migrations wrapped in try/catch** — the app self-heals on re-run.
- **Admin promotion is out-of-band** (`sqlite3 data/app.db "UPDATE users SET role='super_admin'..."`) — no HTTP endpoint that grants admin. Good.

## Concerns

### C1 — `nh_token` stored in `localStorage`
`AuthContext.tsx` presumably reads/writes `nh_token` from `localStorage`. Any XSS on any page reads the token and exfiltrates the entire session. The stricter alternative is an `httpOnly` cookie with `SameSite=Strict`; the trade-off is that the frontend can't read the token for optimistic UI decisions. For a 73-route product with user-generated content, XSS surface is real — worth the migration.

### C2 — Request body validation
The 73 route handlers likely hand-check body shape (Express + no `zod`/`joi`/`ajv` declared). Any missed check is an integrity bug. Recommend `zod` and a `validateBody(schema)` middleware.

### C3 — Rate limiting
Not visible in the dep list. `express-rate-limit` is not installed. `/api/auth/login` and any AI endpoint (if present — CaseTracker or Resources might be) needs a limiter.

### C4 — Session lifecycle
The v1→v2 fix list says "Sessions not cleaned up on user delete → CASCADE now handles this". Good. But what about **expired session cleanup**? A cron / periodic sweep should purge sessions past their TTL; otherwise the `sessions` table grows unbounded.

### C5 — SQLite backup strategy
`data/app.db` is a single file. Loss = total data loss. `better-sqlite3` supports the `Database.backup()` API for snapshots. Wire a periodic snapshot to disk (and off-box, once the app is real).

### C6 — CORS
Not visible in the deps. If the SPA and API are same-origin (Express serves the built `dist/`), no CORS needed. If they're ever split (SPA on Vercel, API on Fly), CORS must be locked down.

### C7 — Admin endpoints
`AdminDashboard.tsx` component exists; `AdminDashboard` calls `/api/admin/users/:id/unsuspend` (per the v1→v2 log). Every admin endpoint needs a `requireAdmin` middleware. Assumed present given the CASCADE-aware v2 fixes; would need a code read to confirm.

### C8 — Anonymous posting
Forums, groups, kites, and stories support anonymous mode (per README feature list). Ensure the `user_id` foreign key is preserved server-side (for moderation) even when the display name isn't shown to other users. If it's not stored at all, moderation of abusive anonymous posts is impossible.

### C9 — Static analysis
- **CodeQL** — good.
- **Codacy Security Scan** — good.
- **Pysa** — running on Python meta-tooling; low signal (see [02-bug-hunt.md#l1](./02-bug-hunt.md)).
- **`security-scan.yml`** — runs the in-repo `scanner/` module for YAML security checks. Custom + useful.
- **`mayhem-for-api.yml`** — deleted this pass (broken template).

## Dependency-level

- `helmet` 8.3.0 — current.
- `express` 4.21.2 — current.
- `better-sqlite3` 12.4.1 — current.
- Dependabot exists (`.github/dependabot.yml` present).

## Summary of concrete security actions

1. **Migrate token from `localStorage` to `httpOnly` cookie.**
2. **Add `zod` request-body validation.**
3. **Add `express-rate-limit` on `/api/auth/*`.**
4. **Wire a periodic expired-session sweep.**
5. **Document the SQLite backup strategy.**
6. **Confirm `requireAdmin` middleware wraps every admin route** (assumed but not verified in this pass).
7. **Verify anonymous posts still persist `user_id` for moderation.**
