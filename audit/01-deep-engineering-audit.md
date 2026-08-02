# 01 — Deep Engineering Audit

## Snapshot

| Dimension | State |
|-----------|-------|
| Frontend | React 19 + TypeScript + Tailwind v4 + Vite 6 |
| Backend | Express 4 + `better-sqlite3` (single-file: `server.ts`, 1,047 LOC, ~73 route handlers) |
| Auth | Custom session tokens in SQLite + `AuthContext.tsx` in the client |
| Security middleware | `helmet` 8.3.0 already installed and (presumably) wired |
| Icons + motion | `lucide-react`, `motion` (Framer Motion successor) |
| Dev server | `tsx server.ts` (dev), `NODE_ENV=production tsx server.ts` (prod) |
| Tests | **None.** No test runner declared. |
| Lint | `lint` script runs `tsc --noEmit` — typecheck, not real lint. |
| Static analysis | CodeQL + Codacy + Pysa (see notes) + custom `security-scan` via `scanner/` module |
| CI | 8 workflows — most thoughtful, one broken (`mayhem-for-api.yml`, deleted this pass) |
| Meta-tooling | In-repo Python agents: `buildagent/`, `depagent/`, `pragent/`, `scanner/` |
| Docs | `README.md`, `SECURITY.md`, `STACK_NOTE.md`, `agent-reports/*.json` |

## What works well

- **`STACK_NOTE.md` is refreshing.** Explicitly documents *why* this app diverges from its siblings ("Do not migrate it to Supabase without a proper plan") — the kind of load-bearing decision that usually only lives in a person's head.
- **Real bug-fix log in the README.** 15 v1→v2 fixes listed with root cause and fix — genuine forensic history. The `db.pragma("journal_mode = WAL")` + `foreign_keys = ON` + `ON DELETE CASCADE` fixes are exactly what a mature SQLite deploy needs.
- **`helmet` is already installed.** Ahead of every other backend in the org's portfolio.
- **CI wiring is intentional and cross-linked.** `pr-agent.yml` fires on `workflow_run` to aggregate reports from `security-scan.yml`, `dependency-check.yml`, and `build-production.yml`. The workflows are commented with real reasoning ("Uses `npm install` rather than `npm ci`: this repo has no committed package-lock.json (npm workspace member locally, standalone repo on GitHub)").
- **The meta-agents check `agent-reports/*.json`** into git as build artefacts. Fine for a portfolio project; questionable for production (they'll go stale).
- **Every component has a real page** (Auth, Dashboard, TheYard, Kites, Groups, Forum, SuccessStories, Mentorship, CheckIns, Journal, Resources, Opportunities, Tools, CaseTracker, Vault, Profile, AdminDashboard, HelpCenter). Not a scaffold — an actual product surface.

## Concrete gaps

### G1 — `server.ts` is 1,047 lines and holds 73 route handlers
This is the biggest single lift in the repo. `server.ts` is the entire backend: DB connection, migrations, auth middleware, session logic, and every route. See [06-architecture-review.md](./06-architecture-review.md) for the recommended split (`routes/`, `services/`, `middleware/`).

### G2 — No tests
Zero test files anywhere. For a 73-route backend with custom sessions and CASCADE-sensitive migrations, this is the biggest risk on the plan. Recommend `vitest` + `supertest` + a smoke test per resource.

### G3 — `lint` script is not a linter
`"lint": "tsc --noEmit"` — same anti-pattern flagged in Felon_connect. Add real ESLint with typescript-eslint + Tailwind rules.

### G4 — `mayhem-for-api.yml` was a broken template
`./run_your_api.sh` doesn't exist; `api-url` and `api-spec` are unmodified template values. **Fixed in this pass (deleted).**

### G5 — `pysa.yml` scans a project without any real Python attack surface
The Python code in this repo is meta-tooling. Not a bug per se; consider disabling if it produces false positives regularly.

### G6 — `engineerring report/` folder has a typo AND a space
A one-file folder called `engineerring report/report.md`. The typo alone would be worth a rename; the space in the folder name breaks tab-completion in most shells and requires quoting everywhere. Flagged, not fixed (renames of folders with contents deserve their own PR).

### G7 — `.gitignore` had a Windows separator
Same as every other repo in the sweep. **Fixed in this pass.**

### G8 — `agent-reports/*.json` is committed
Build artefacts under version control drift with every push. Consider gitignoring and re-deriving on demand.

### G9 — `data/` (SQLite DB) is gitignored — good
The `data/app.db` file lives in a gitignored directory. Correct.

### G10 — `README.md` documents 25 features + 15 bug fixes — but does not link to `STACK_NOTE.md`
A dev landing on the README would not know about the "do not migrate to Supabase" policy without opening `STACK_NOTE.md`. Add a link.

## Verdict

This is the most mature app in the sweep so far. The gap list is short and mechanical: split `server.ts`, add tests, add real ESLint, delete/rename the typo folder, delete the broken Mayhem workflow (done this pass). Everything else is polish.
