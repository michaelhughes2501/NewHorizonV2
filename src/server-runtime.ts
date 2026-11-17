// ─────────────────────────────────────────────────────────────
// server-runtime.ts — decides which mode the Express server runs in
// and whether dev-only shortcuts are allowed.
//
// Production is the safe default: the server only runs in development
// or test mode when it is asked to explicitly, so a host that starts
// the app with plain `npm start` and no NODE_ENV never gets dev mode.
// ─────────────────────────────────────────────────────────────

export type RuntimeMode = "development" | "test" | "production";

type Env = Record<string, string | undefined>;

/** CLI flag that `npm run dev` passes to turn on development mode. */
export const DEV_FLAG = "--dev";

/** CLI flag that lets the forgot-password endpoint return the raw reset token. */
export const EXPOSE_RESET_TOKEN_FLAG = "--expose-reset-token";

/** Env var alternative to EXPOSE_RESET_TOKEN_FLAG. Ignored in production mode. */
export const EXPOSE_RESET_TOKEN_ENV = "EXPOSE_DEV_RESET_TOKEN";

/**
 * Resolve the runtime mode.
 * - `--dev` on the command line            → "development"
 * - NODE_ENV=development or NODE_ENV=test  → that mode
 * - anything else, including unset         → "production"
 */
export function resolveRuntimeMode(
  env: Env = process.env,
  argv: readonly string[] = process.argv,
): RuntimeMode {
  if (argv.includes(DEV_FLAG)) return "development";
  const nodeEnv = (env.NODE_ENV ?? "").trim().toLowerCase();
  if (nodeEnv === "development" || nodeEnv === "test") return nodeEnv;
  return "production";
}

/**
 * The raw password-reset token is a full account-takeover credential, so it
 * may only appear in an API response when BOTH are true:
 *   1. the server is not in production mode, and
 *   2. the developer opted in with `--expose-reset-token` or
 *      EXPOSE_DEV_RESET_TOKEN=true.
 * Being in dev mode alone (for example a stray NODE_ENV=development on a
 * host) is not enough.
 */
export function shouldExposeResetToken(
  mode: RuntimeMode,
  env: Env = process.env,
  argv: readonly string[] = process.argv,
): boolean {
  if (mode === "production") return false;
  if (argv.includes(EXPOSE_RESET_TOKEN_FLAG)) return true;
  return (env[EXPOSE_RESET_TOKEN_ENV] ?? "").trim().toLowerCase() === "true";
}

/**
 * Body for POST /api/auth/forgot-password. The response is identical whether
 * or not the email matched an account, and never carries the token unless
 * `exposeToken` is true.
 */
export function forgotPasswordResponse(
  resetToken: string | null,
  exposeToken: boolean,
): { success: true; _devToken?: string } {
  if (exposeToken && resetToken) return { success: true, _devToken: resetToken };
  return { success: true };
}
