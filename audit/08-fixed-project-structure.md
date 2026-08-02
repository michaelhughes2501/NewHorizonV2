# 08 — Fixed Project Structure

Target layout after Phases A–F of [07-refactor-plan.md](./07-refactor-plan.md).

```
NewHorizonV2/
│
├── README.md                          ← links STACK_NOTE.md (A7)
├── STACK_NOTE.md                      ← existing (do-not-Supabase policy)
├── SECURITY.md                        ← existing
├── CHANGELOG.md                       ← added
├── LICENSE                            ← added
│
├── .gitignore                         ← POSIX paths + agent-reports/*.json (A4)
├── .env.example
├── .editorconfig                      ← added
├── .prettierrc                        ← added (optional)
│
├── package.json                       ← scripts: dev, start, build, preview, test, lint, typecheck
├── package-lock.json                  ← reconciled with ci.yml (A6)
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts                 ← if promoted from Tailwind v4 inline config
│
├── index.html                         ← Vite entry
│
├── server.ts                          ← bootstrap only: helmet + parsers + mount + listen
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── AuthContext.tsx
│   ├── index.css
│   ├── types.ts
│   │
│   ├── backend/                       ← NEW — was inlined in server.ts
│   │   ├── db.ts                      ← better-sqlite3 open + pragmas (C1)
│   │   ├── migrations/                ← versioned (E1)
│   │   │   ├── index.ts
│   │   │   ├── 0001_initial.ts
│   │   │   └── ...
│   │   ├── middleware/                ← (C2)
│   │   │   ├── requireAuth.ts
│   │   │   ├── requireAdmin.ts
│   │   │   ├── validateBody.ts        ← zod-backed
│   │   │   └── rateLimit.ts
│   │   ├── services/                  ← one per resource (C3)
│   │   │   ├── auth.ts                ← scrypt + session TTL sweep (D3)
│   │   │   ├── users.ts
│   │   │   ├── kites.ts
│   │   │   ├── groups.ts
│   │   │   ├── forum.ts
│   │   │   └── ...
│   │   ├── routes/                    ← one file per resource
│   │   │   ├── index.ts
│   │   │   ├── auth.ts
│   │   │   ├── admin.ts
│   │   │   ├── users.ts
│   │   │   └── ...
│   │   └── schemas/                   ← zod schemas (C5)
│   │       ├── auth.ts
│   │       └── ...
│   │
│   └── features/                      ← optional frontend re-org
│       ├── auth/{Auth.tsx, ...}
│       ├── dashboard/Dashboard.tsx
│       ├── social/{TheYard,Kites,Groups,Forum,SuccessStories}.tsx
│       ├── support/{Mentorship,CheckIns,Journal}.tsx
│       ├── resources/{Resources,Opportunities,Tools}.tsx
│       ├── case-mgmt/{CaseTracker,Vault}.tsx
│       ├── profile/Profile.tsx
│       ├── admin/AdminDashboard.tsx
│       └── meta/HelpCenter.tsx
│
├── data/                              ← gitignored SQLite dir (existing)
├── backups/                           ← gitignored (E2)
├── engineering-report/                ← renamed (A3)
│   └── report.md
├── agent-reports/                     ← gitignored .json outputs (A4)
│   └── .gitkeep
│
├── tests/                             ← added (Phase B)
│   ├── auth.test.ts
│   ├── kites.test.ts
│   └── ...
│
├── docs/
│   ├── runbook.md                     ← backup/restore (E3)
│   ├── meta-agents.md                 ← how the buildagent/depagent/pragent/scanner packages work
│   └── deploy.md                      ← (F2)
│
├── buildagent/  depagent/  pragent/  scanner/  ← unchanged (Python meta-tooling)
├── buildagent.yml  depagent.yml  pragent.yml   ← existing agent configs
├── playground/                        ← unchanged
│
├── ops/                               ← added (Phase F)
│   ├── Dockerfile
│   ├── .dockerignore
│   └── fly.toml  (or render.yaml)
│
└── .github/
    ├── workflows/
    │   ├── ci.yml                     ← existing; runs vitest after B4
    │   ├── codeql.yml                 ← existing
    │   ├── codacy.yml                 ← existing
    │   ├── dependency-check.yml       ← existing
    │   ├── build-production.yml       ← existing
    │   ├── pr-agent.yml               ← existing
    │   ├── security-scan.yml          ← existing
    │   └── pysa.yml                   ← existing (or remove per L1)
    ├── dependabot.yml                 ← existing
    └── instructions/
        └── codacy.instructions.md     ← existing (gitignored)
```

## Explicit call-outs

- **`server.ts` shrinks from 1,047 LOC to ~50 LOC.** Every route handler moves out.
- **`agent-reports/*.json`** are no longer tracked. `.gitkeep` retains the folder.
- **`engineerring report/`** disappears; `engineering-report/` takes its place.
- **`mayhem-for-api.yml`** does not appear (deleted this pass).
- **`data/` and `backups/`** stay gitignored.
- **Meta-tooling** (`buildagent/`, `depagent/`, `pragent/`, `scanner/`) is untouched.

## Sibling parity

Once this lands the repo will look like a bigger, more feature-complete version of:

- `remix-the-yard/` — same Express + better-sqlite3 pattern.
- `ConvictCode/` — same "single-file backend → factored layers" trajectory (Flask side).

Different from:
- `new-horizon-platform/` — Supabase-native. Per `STACK_NOTE.md`, this repo intentionally does not converge with it.
- `NewHorizonWeb/` — also Supabase-native. Same intentional divergence.
