# 02 — Bug Hunt

## Confirmed bugs

### B1 — `.gitignore` line 12 uses a Windows path separator
- **File:** `.gitignore` (line 12)
- **Symptom:** `.github\instructions\codacy.instructions.md` — no-op on POSIX; the Codacy AI-rules file is not ignored on Linux/macOS/CI.
- **Fix:** POSIX slash. **Applied in this pass.**

### B2 — `mayhem-for-api.yml` is a broken template
- **File:** `.github/workflows/mayhem-for-api.yml`
- **Symptom:** `./run_your_api.sh` (nonexistent), `api-url: http://localhost:8080` (this app uses port 3000), `api-spec: http://localhost:8080/openapi.json` (this app publishes no OpenAPI spec), and no `MAYHEM_TOKEN` secret configured. Runs on every push/PR to `master` and fails.
- **Fix:** Delete. **Applied in this pass.**

### B3 — `lint` script does not lint
- **File:** `package.json` (line 10)
- **Symptom:** Same as Felon_connect / others in the org — `"lint": "tsc --noEmit"` is a typecheck, not a lint. Contributors run it and assume the code has been style-checked; it hasn't.
- **Fix:** Rename to `typecheck`; add a real `lint` script backed by ESLint + typescript-eslint. Deferred — behavioural change to a script name.

### B4 — `engineerring report/report.md` — folder name has a typo AND a space
- **File:** `engineerring report/`
- **Symptom:** The folder name is misspelled (`engineerring`) and contains a space. Space in paths breaks tab-completion, requires quoting in every shell command, and (on Windows) is a magnet for tooling bugs. Nothing in the codebase references it (`grep` for `engineerring` returned only the file itself).
- **Fix:** Rename to `engineering-report/`. Deferred — rename of a folder with contents deserves a dedicated PR so the diff is easy to review.

### B5 — `agent-reports/*.json` are checked into version control
- **Files:** `agent-reports/build-agent.json`, `dependency-agent.json`, `security-scanner.json`
- **Symptom:** These are output artefacts from the CI meta-agents (`buildagent/`, `depagent/`, `scanner/`). They will drift with every push, generating gratuitous diffs. `pr-agent.yml` also consumes them from `workflow_run` artifacts — so the committed copies serve mostly as historical curiosity.
- **Fix:** Add `agent-reports/*.json` to `.gitignore`; keep a `.gitkeep` in the folder. Deferred — deleting tracked files is a diff-heavy change and the repo may reference them elsewhere.

## Latent bugs

### L1 — `pysa.yml` scans code that has no user-input attack surface
- **File:** `.github/workflows/pysa.yml`
- **Symptom:** Pysa is a taint analyzer meant for web apps and services that ingest untrusted input. The Python code in this repo is CI/agent tooling; there is no user input to taint-track. Pysa will still run and produce a report, but the signal is close to zero.
- **Fix:** Either remove or explicitly configure Pysa's taint model. Not applied.

### L2 — `README.md` doesn't link to `STACK_NOTE.md`
- **File:** `README.md`
- **Symptom:** A dev following the Quick Start would not know about the "do not migrate to Supabase without a plan" policy. Any AI that scans the README will miss it too.
- **Fix:** Add a `> **See also**: [STACK_NOTE.md](./STACK_NOTE.md)` line under the intro. Not applied — trivial but a real doc change.

### L3 — `ci.yml` uses `npm install` (per comment: no committed `package-lock.json` — actually, `package-lock.json` is present)
- **File:** `.github/workflows/ci.yml`
- **Symptom:** The workflow's comment says "this repo has no committed package-lock.json", but `package-lock.json` **does** exist at the repo root (72 lines). Either the comment is stale or `npm install` is being used when `npm ci` would be faster and safer.
- **Fix:** Reconcile — either remove the comment and switch to `npm ci`, or delete `package-lock.json`. Not applied; needs a decision from the owner.

### L4 — `server.ts` is 1,047 lines
- **File:** `server.ts`
- **Symptom:** Not a bug, but a maintenance smell. 73 route handlers, session management, DB migrations, and the SQLite pragma configuration all in one module. Any edit fights every other edit in the file.
- **Fix:** Split (see [06-architecture-review.md](./06-architecture-review.md)). Deferred — biggest lift in the plan.

### L5 — `data/app.db` file survives across dev restarts but is never migrated
- **File:** `README.md` (line 105) mentions `server.ts` runs the app.
- **Symptom:** The v1→v2 bug list includes "ALTER TABLE migrations caused crashes on re-run — wrapped each in try/catch". That means schema drift is handled by try/catch, not versioned migrations. On the next major schema change, this will bite.
- **Fix:** Introduce a real migration story (see [07-refactor-plan.md](./07-refactor-plan.md)).

## Not-a-bug

- **`helmet` at pinned exact version `8.3.0` (no caret)** — deliberate. Pinning helmet is fine; the caret would risk a breaking change in the CSP defaults.
- **`STACK_NOTE.md` referring to a `../CONSOLIDATION_STATUS.md` that isn't in this repo** — the reference is intentional; that file lives in a portfolio-level directory, not in-repo.

## Nothing else surfaced from a partial read

The main risks are structural (server.ts size, no tests, no migrations, no linter) rather than defects. The reports below cover them.
