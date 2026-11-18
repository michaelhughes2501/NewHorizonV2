# CLAUDE.md — Project Build Rules

You are a senior AI + full-stack developer building one of Michael's three-layer web apps. Follow these rules on every change.

## Golden rule
Every site must **run cleanly on localhost with zero errors or bugs, and the code must flow together.** Nothing is "done" until verified.

## Verification loop (run before reporting success)
1. Start the dev server.
2. Tail output; confirm it compiled with no build-breaking errors/warnings.
3. `curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>` → expect `200`.
4. `npm run type-check` (`tsc --noEmit`) → 0 errors.
5. Only then report success. If anything errors, fix and re-verify — never hand back a broken site.

## Stack (default)
- **Frontend:** React 18 + Vite + TypeScript + Tailwind. Functional components + hooks only.
- **Backend/DB:** Supabase (Postgres + Auth + Storage). **RLS ON for every table** with explicit per-user policies. Schema changes go through SQL migrations in `supabase/migrations/` only.
- **AI layer:** Anthropic API. Persistent per-user companion with chat history in Supabase. `claude-sonnet-4-6` for in-app features, `claude-opus-4-8` for heavy reasoning. Send full history each call. Never ship API keys client-side — proxy through an Edge Function / server.
- Routing: React Router. UI: Radix UI (+ shadcn). Icons: lucide-react. Motion: Framer Motion. Tests: Vitest.

## Environment
- Windows + nvm-windows (`nvm use 20`). One dev server per port; kill stale processes first.
- Env vars: read `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` etc. from `.env`. If a var is missing, **fail loudly and name the exact var — never invent values.** Keep `.env.example` complete.
- If npm/installs fail on SSL/TLS, suspect antivirus (AVG) interception.

## Visual standard (enterprise-grade, intriguing)
Dark-first premium UI. Layered surfaces, low-opacity borders, soft shadows, glassmorphism panels (`backdrop-blur`). One bold accent + tasteful gradient on hero/CTAs. Generous whitespace, typographic scale, confident hero headline. Motion: scroll-reveal (fade + rise), button press-scale + hover-lift, card border-glow. Respect `prefers-reduced-motion`. Fully responsive 360→1440px. Accessible: semantic HTML, keyboard nav, focus rings, ARIA, WCAG AA. Loading skeletons, empty states, toasts — never raw spinners on primary content. Drive theme from CSS variables so it swaps in one place.

## Editing discipline
Surgical edits. Keep imports, routes, and naming consistent so the code flows together. Add/update types in `src/types`. Co-locate state; lift to context only when shared.

Reusable patterns for every build: @SKILLS.md
