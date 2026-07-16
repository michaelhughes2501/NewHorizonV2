# NewHorizonV2 — Stack Note

**This app intentionally runs on Express + better-sqlite3, not Supabase.**

The rest of the New Horizon web family (NewHorizonWeb, new-horizon-platform) uses Supabase. NewHorizonV2 is the **feature-richest** New Horizon build — it carries modules the others don't (CaseTracker, CheckIns, Forum, Groups, HelpCenter, Journal, Kites, Mentorship, Opportunities, SuccessStories, TheYard, Tools, Vault) — and was deliberately kept on its own Express + SQLite backend during the 2026-07 consolidation.

**Do not migrate it to Supabase without a proper plan.** Its server-side security (`src/server-security.ts`) and auth (`src/AuthContext.tsx`) assume the Express/SQLite backend; a Supabase move would need those re-expressed as RLS policies. Treat V2 as its own app.

See `../CONSOLIDATION_STATUS.md` for the full portfolio picture.
