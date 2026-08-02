# 06 — Architecture Review

## Current shape

```
Browser
   ↓ (Vite dev / built dist/)
tsx server.ts (1,047 LOC)
   ├── helmet
   ├── express.json / express.urlencoded
   ├── ~73 route handlers (auth, admin, users, sessions, posts,
   │    kites, groups, forum, stories, mentorship, checkins, journal,
   │    resources, opportunities, tools, case-tracker, vault, profile,
   │    admin, help-center)
   ├── auth middleware (custom session tokens, crypto.scryptSync)
   ├── DB pragmas (foreign_keys=ON, journal_mode=WAL)
   ├── migrations (try/catch ALTER TABLE)
   └── better-sqlite3 → data/app.db
```

Every backend concern lives in one file. That is a real problem at 1,047 lines and 73 routes.

## Recommended layering

Keep the same runtime shape (Express + better-sqlite3), just spread across files:

```
server.ts                  ← boot: helmet, JSON parsers, mount routers, listen
src/backend/
├── db.ts                  ← better-sqlite3 open + pragmas
├── migrations/
│   ├── index.ts           ← runs all migrations at boot
│   ├── 0001_initial.ts
│   └── 0002_add_kites.ts
├── middleware/
│   ├── requireAuth.ts
│   ├── requireAdmin.ts
│   ├── validateBody.ts    ← zod-backed
│   └── rateLimit.ts       ← express-rate-limit
├── services/
│   ├── auth.ts            ← scrypt hashing, session tokens, TTL sweep
│   ├── users.ts
│   ├── kites.ts
│   ├── groups.ts
│   ├── forum.ts
│   └── ...                ← one per resource
├── routes/
│   ├── index.ts           ← router.use(...) aggregator
│   ├── auth.ts
│   ├── users.ts
│   ├── kites.ts
│   └── ...                ← one file per resource; ~5-15 routes each
└── schemas/               ← zod request/response schemas
    ├── auth.ts
    └── ...
```

Benefits, in order:

1. **Testability.** Each service becomes trivially unit-testable; routes become supertest-friendly.
2. **Change locality.** Editing a feature area doesn't touch a shared 1,047-line file.
3. **Boot speed / hot reload.** `tsx watch` on smaller files is faster.
4. **Migration story.** A dedicated `migrations/` module is a natural place to introduce versioning.

## Meta-agents

`buildagent/`, `depagent/`, `pragent/`, `scanner/` are Python packages that back the CI workflows:

- `security-scan.yml` → `scanner/run.py`
- `dependency-check.yml` → `depagent/run.py`
- `build-production.yml` → `buildagent/run.py`
- `pr-agent.yml` → `pragent/run.py` (aggregator)

Two observations:

1. **This is a lot of custom tooling for one repo.** If the same meta-agents are used across the org's portfolio, extract them into a separate `felonious-tooling/` repo and pull them in as a git submodule or a pip package. If they're bespoke to this repo, the current shape is fine.
2. **`agent-reports/*.json` checked into git** — see [02-bug-hunt.md#b5](./02-bug-hunt.md). These are outputs, not inputs; consider gitignoring.

## Frontend

18 components, all in `src/components/`. At this count a folder-per-feature split starts to pay off:

```
src/features/
├── auth/{Auth.tsx, AuthContext.tsx}
├── dashboard/Dashboard.tsx
├── social/{TheYard.tsx, Kites.tsx, Groups.tsx, Forum.tsx, SuccessStories.tsx}
├── support/{Mentorship.tsx, CheckIns.tsx, Journal.tsx}
├── resources/{Resources.tsx, Opportunities.tsx, Tools.tsx}
├── case-mgmt/{CaseTracker.tsx, Vault.tsx}
├── profile/Profile.tsx
├── admin/AdminDashboard.tsx
└── meta/HelpCenter.tsx
```

Deferred — this is a nicety, not a correctness fix.

## Cross-cutting

- **Config:** loaded via `dotenv`. Fine at this scale.
- **Logging:** `console.*`. See production-readiness.
- **Auth:** custom sessions. See security review.

## Verdict

The architecture is coherent; the single-file backend is the one real drag. Splitting it is a 1–2 day job that unlocks tests, migrations, and every other item on the plan.
