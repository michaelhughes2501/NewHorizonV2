# Engineering Audit — NewHorizonV2

Branch: `claude/engineering-audit-refactor-j2mphk`
Scope: Phase 1 — reports + safe fixes only. Refactor execution deferred.

## Context

NewHorizonV2 is the **feature-richest** New Horizon build in the org's portfolio: 18 React 19 + TS + Tailwind v4 components, an Express 4 + better-sqlite3 backend in a single `server.ts` (1,047 lines, ~73 route handlers), and a fleet of in-repo Python meta-tooling agents (`buildagent/`, `depagent/`, `pragent/`, `scanner/`) that back a well-thought-out CI pipeline.

Per `STACK_NOTE.md`: **this app intentionally does NOT use Supabase** — unlike its siblings NewHorizonWeb and new-horizon-platform. Do not "migrate to Supabase" without a full plan; its Express/SQLite security model would need re-expressing as RLS.

## Reports

| # | File | Focus |
|---|------|-------|
| 1 | [01-deep-engineering-audit.md](./01-deep-engineering-audit.md) | Snapshot |
| 2 | [02-bug-hunt.md](./02-bug-hunt.md) | Concrete defects |
| 3 | [03-dependency-audit.md](./03-dependency-audit.md) | package.json + upgrade path |
| 4 | [04-security-review.md](./04-security-review.md) | Auth, sessions, SQLite hardening, headers |
| 5 | [05-production-readiness.md](./05-production-readiness.md) | Deploy, backup, migrations, observability |
| 6 | [06-architecture-review.md](./06-architecture-review.md) | Splitting server.ts, meta-agents |
| 7 | [07-refactor-plan.md](./07-refactor-plan.md) | Ordered PRs |
| 8 | [08-fixed-project-structure.md](./08-fixed-project-structure.md) | Target tree |

## Safe fixes applied in this pass

- **`.gitignore`** — replaced `.github\instructions\codacy.instructions.md` (Windows path separator, no-op on POSIX / CI) with a POSIX path.
- **`.github/workflows/mayhem-for-api.yml`** — deleted. The file is a **verbatim upstream template** with unmodified placeholders: `./run_your_api.sh` (does not exist), `api-url: http://localhost:8080`, `api-spec: http://localhost:8080/openapi.json`. This app's server runs on port 3000 with no OpenAPI spec, and no `MAYHEM_TOKEN` secret is configured. The workflow runs on every push/PR and fails. Removing it stops the failing runs — the actual security scanning is done by `codeql.yml`, `codacy.yml`, `security-scan.yml`, and `pysa.yml`.

Nothing under `src/`, `server.ts`, `buildagent/`, `depagent/`, `pragent/`, or `scanner/` was modified.

## Not fixed (flagged only)

- **`engineerring report/report.md`** — folder name has a typo (`engineerring` → `engineering`) AND a space. Renaming would risk breaking any external link; deferred to a dedicated PR with a redirect note.
- **`pysa.yml`** — Facebook's Python taint analyzer, runs on push/PR. The meta-agents in this repo (`buildagent/`, `depagent/`, etc.) are Python but do not process untrusted user input, so Pysa has nothing to taint-track. Not a hard failure (it will run and produce clean output) but zero value on this codebase.
