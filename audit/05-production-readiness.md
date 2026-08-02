# 05 — Production-Readiness Review

## Checklist

| # | Requirement | State |
|---|-------------|-------|
| 1 | Reproducible install | `package-lock.json` present. CI uses `npm install` (comment says otherwise; inconsistency in [02-bug-hunt.md#l3](./02-bug-hunt.md)). |
| 2 | Env config documented + enforced | `.env.example` exists. No boot-time enforcement. |
| 3 | Dependencies audited | Dependabot present. |
| 4 | Minimum test bar | **None.** |
| 5 | CI enforcing build | 8 workflows — including thoughtful `pr-agent.yml` aggregating multi-agent reports. |
| 6 | Observability | None — `console.*` only. |
| 7 | Rate limiting | Missing (no `express-rate-limit`). |
| 8 | Security headers | Present via `helmet`. |
| 9 | Backup / restore | SQLite single-file; not documented. |
| 10 | Migrations | try/catch `ALTER TABLE` — self-heals but not versioned. |
| 11 | Admin surface | `AdminDashboard.tsx` — real. |
| 12 | Runbook | Absent. |

## Deploy story

### What exists
- `README.md` documents `NODE_ENV=production npm start` — server serves `dist/` in prod.
- `.vscode/launch.json` for F5 dev debug.
- `agent-reports/` shows a green-in-CI history if you inspect the checked-in artifacts.

### What's missing
- **`Dockerfile`.** Sensible shape: multi-stage — stage 1 builds `dist/`, stage 2 copies `dist/` + `server.ts` + `node_modules` and runs `tsx server.ts`. Or an esbuild bundle for a smaller footprint.
- **A deploy target config** — no `fly.toml` / `render.yaml` / `Procfile`.
- **A managed persistence plan.** SQLite works on Fly's volumes and Render's persistent disks; needs decision + doc. Any container-per-request platform (Vercel, Cloud Run) won't work with SQLite.

## Observability

- **Logging:** `console.log` / `console.warn` / `console.error`. Not structured.
- **Errors:** no Sentry / equivalent.
- **Metrics:** none.
- **`/api/health`:** likely present given the 73 handlers — needs a code read to confirm; if absent, add.
- **Uptime probe:** none wired.

## Data lifecycle

- **Backup:** `better-sqlite3` supports `.backup()`. Wire it to a nightly cron writing to a mounted volume or S3.
- **Restore:** straightforward once backup exists; needs a documented drill.
- **GDPR delete-user:** CASCADE preserves data integrity when a user is hard-deleted, but the actual "delete my account" endpoint needs to exist. Not audited here.
- **PII inventory:** not documented. Given the app stores mental-health check-ins, journal entries, and case notes, this is a real regulatory concern.

## Reliability

- **No graceful shutdown** documented; SIGTERM behaviour unknown.
- **`better-sqlite3` is synchronous.** Every DB call blocks the event loop. Fine for low-to-moderate load; becomes a problem at hundreds of concurrent requests. Consider explicit acceptance in the runbook.
- **No timeout on long routes** — Express default is infinite; add `req.setTimeout(30_000)` on anything that could hang.
- **Rate limiting missing** — see [04-security-review.md](./04-security-review.md).

## Documentation

- `README.md` — comprehensive (25 features + 15 v1→v2 fixes).
- `SECURITY.md` — present.
- `STACK_NOTE.md` — excellent, but not linked from README.
- Meta-tooling docs — the `buildagent/`, `depagent/`, `pragent/`, `scanner/` folders each have a `run.py`; a top-level `docs/meta-agents.md` would help.
- **Runbook** — absent.

## Verdict

The most production-shaped app in the sweep. The gap list is:
1. Rate limiting (missing).
2. Tests (missing).
3. Migrations (self-heal-only).
4. Backup docs (missing).
5. Docker + deploy config (missing).
6. Structured logging + Sentry (missing).
7. Split `server.ts` (see architecture).

Every item is a known solved problem — the plan orders them.
