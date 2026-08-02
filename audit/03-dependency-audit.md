# 03 — Dependency Audit

## Direct dependencies

Runtime:

| Package | Pin | Notes |
|---------|-----|-------|
| `@tailwindcss/vite` | `^4.1.14` | Tailwind v4. Correct pairing with `tailwindcss` v4 devDep. |
| `@types/react`, `@types/react-dom` | `^19.2.14`, `^19.2.3` | React 19 types. **Anomalous placement in `dependencies` instead of `devDependencies`.** Not harmful, but non-standard. |
| `@vitejs/plugin-react` | `^5.0.4` | Matches Vite 6. |
| `better-sqlite3` | `^12.4.1` | Current stable. Native module — needs Node ABI to match; watch the deploy target's Node version. |
| `clsx` | `^2.1.1` | Tiny classname helper. Fine. |
| `date-fns` | `^4.1.0` | Current stable. |
| `dotenv` | `^17.2.3` | v17 — recent major bump. Verify `dotenv.config()` still works as-called. |
| `express` | `^4.21.2` | Express 4. Deliberate (Express 5's wildcard route change is called out in the v1→v2 fix list as an issue). Fine. |
| `helmet` | `8.3.0` (exact) | Exact pin, good hardening call. |
| `lucide-react` | `^0.546.0` | Fine. |
| `motion` | `^12.23.24` | Framer Motion rebrand. Fine. |
| `react`, `react-dom` | `^19.0.0` | Current stable. Good. |
| `tailwind-merge` | `^3.5.0` | Fine. |
| `vite` | `^6.2.0` | Vite 6. Consistent with `@vitejs/plugin-react` 5. |

Dev:

| Package | Pin | Notes |
|---------|-----|-------|
| `@types/better-sqlite3` | `^7.6.12` | Fine. |
| `@types/express` | `^4.17.21` | Matches Express 4. |
| `@types/node` | `^22.14.0` | Node 22 types; CI uses Node 22. Consistent. |
| `autoprefixer` | `^10.4.21` | Consumed by Tailwind v4 via the Vite plugin. Fine. |
| `tailwindcss` | `^4.1.14` | v4. |
| `tsx` | `^4.21.0` | Runs `server.ts` in dev + prod. Fine. |
| `typescript` | `~5.8.2` | Current stable. |

## Missing / anomalous

- **`@types/react` in `dependencies`** — belongs in `devDependencies`. React types are not needed at runtime.
- **No auth library declared** — the app rolls its own session tokens via `crypto` (Node built-in). Fine, but note that this is real cryptographic code with no third-party test coverage.
- **No test runner** — no `vitest`, `jest`, `mocha`. Zero tests can exist.
- **No lint deps** — no ESLint, no `typescript-eslint`, no `eslint-plugin-react-hooks`, no `eslint-plugin-react-refresh`.
- **No `bcrypt` / `argon2`** — password hashing uses `crypto.scryptSync` (per the v1→v2 fix list). That's a legit Node built-in choice; note that scrypt hashes are ~155 chars — the SQLite column must be wide enough (`TEXT` is unbounded, safe).
- **No `zod` / `valibot`** — request body validation is hand-rolled. See [04-security-review.md](./04-security-review.md).
- **No structured logger** — `console.log` only.
- **No CORS lib** — Express + custom CORS if needed. Fine if only same-origin; note if the API is called cross-origin.

## Known vulnerabilities (best-effort)

- `dotenv` v17 has been advisory-quiet.
- `express` v4 has one open advisory around the `body-parser` limits — mitigated by helmet + explicit size limits (need to confirm those are set in `server.ts`).
- `better-sqlite3` — no open advisories.
- `helmet` 8.3.0 — current.
- `motion` — replaces `framer-motion`, has no open advisories.

## Recommendations, in order

1. **Move `@types/react` and `@types/react-dom` to `devDependencies`.**
2. **Add ESLint + typescript-eslint + `eslint-plugin-react-hooks`.**
3. **Add `vitest` + `supertest` + `@testing-library/react`.**
4. **Add `zod`** for input validation on the 73 route handlers.
5. **Add `pino`** for structured logging.
6. **Bump `helmet` if a newer minor exists** — verify CSP behaviour unchanged.
7. **Verify `express.json({ limit: '1mb' })` (or lower) is set** in `server.ts` to cap request-body size.
