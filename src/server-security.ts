// ─────────────────────────────────────────────────────────────
// server-security.ts — SERVER-SIDE security utilities.
// These run in the Express process and CANNOT be bypassed by a
// client. (Client-side checks are UX only; this is the real gate.)
// ─────────────────────────────────────────────────────────────

// ── Input sanitisation ────────────────────────────────────────
export const sanitise = (input: unknown, maxLength = 2000): string => {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")        // strip HTML tags (XSS)
    .replace(/javascript:/gi, "")   // strip JS URIs
    .replace(/on\w+\s*=/gi, "")     // strip inline event handlers
    .replace(/\0/g, "")             // strip null bytes
    .trim()
    .slice(0, maxLength);
};

export const isValidEmail = (email: string): boolean =>
  /^[a-zA-Z0-9._%+\-]{1,64}@[a-zA-Z0-9.\-]{1,253}\.[a-zA-Z]{2,}$/.test(
    (email || "").trim()
  );

// ── Server-side rate limiting (sliding window, in-memory) ──────
// For multi-instance production, back this with Redis. For a
// single Node process (this app) in-memory is correct and real.
const _windows = new Map<string, number[]>();

export const RATE_LIMITS = {
  login:         { limit: 5,  windowMs: 15 * 60 * 1000 },
  register:      { limit: 3,  windowMs: 60 * 60 * 1000 },
  message:       { limit: 30, windowMs: 60 * 1000 },
  post:          { limit: 15, windowMs: 60 * 1000 },
  report:        { limit: 10, windowMs: 24 * 60 * 60 * 1000 },
  passwordReset: { limit: 3,  windowMs: 60 * 60 * 1000 },
  write:         { limit: 60, windowMs: 60 * 1000 },
} as const;

export type RateAction = keyof typeof RATE_LIMITS;

export const checkRate = (
  action: RateAction,
  id: string
): { ok: boolean; resetIn: number } => {
  const { limit, windowMs } = RATE_LIMITS[action];
  const key = `${action}:${id}`;
  const now = Date.now();
  const hits = (_windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    const resetIn = Math.ceil((windowMs - (now - hits[0])) / 1000);
    _windows.set(key, hits);
    return { ok: false, resetIn };
  }
  hits.push(now);
  _windows.set(key, hits);
  return { ok: true, resetIn: 0 };
};

// Periodic cleanup so the map can't grow unbounded.
setInterval(() => {
  const now = Date.now();
  const maxWindow = 24 * 60 * 60 * 1000;
  for (const [key, hits] of _windows) {
    const live = hits.filter((t) => now - t < maxWindow);
    if (live.length === 0) _windows.delete(key);
    else _windows.set(key, live);
  }
}, 60 * 60 * 1000).unref?.();

// ── Content moderation (threats / scams) ──────────────────────
const THREAT_PATTERNS = [
  /\bi (will|gonna|going to) (kill|hurt|find|come for) you\b/i,
  /\bi know where you live\b/i,
];
const SCAM_TERMS = [
  "wire transfer", "western union", "moneygram", "bitcoin address",
  "send me your money", "nigerian prince",
];

export interface Moderation { action: "allow" | "warn" | "block"; flags: string[] }

export const moderate = (text: string): Moderation => {
  const lower = (text || "").toLowerCase();
  const flags: string[] = [];
  if (THREAT_PATTERNS.some((p) => p.test(text))) flags.push("threat");
  SCAM_TERMS.forEach((t) => { if (lower.includes(t)) flags.push(`scam:${t}`); });
  const action = flags.includes("threat") ? "block" : flags.length ? "warn" : "allow";
  return { action, flags };
};
