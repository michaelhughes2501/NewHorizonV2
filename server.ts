import express from "express";
import helmet from "helmet";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import crypto from "crypto";
import fs from "fs";
import { sanitise, isValidEmail, checkRate, moderate, type RateAction } from "./src/server-security.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Database Setup ───────────────────────────────────────────────────────────
const dbDir = path.join(__dirname, "data");
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const db = new Database(path.join(dbDir, "app.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ─── Schema ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    bio TEXT,
    location TEXT,
    facility TEXT,
    role TEXT DEFAULT 'user',
    is_admin INTEGER DEFAULT 0,
    is_mentor INTEGER DEFAULT 0,
    is_suspended INTEGER DEFAULT 0,
    is_verified INTEGER DEFAULT 0,
    hide_location INTEGER DEFAULT 0,
    hide_history INTEGER DEFAULT 0,
    recovery_stage TEXT DEFAULT 'early',
    interests TEXT DEFAULT '[]',
    push_token TEXT,
    avatar_color TEXT DEFAULT '#4F46E5',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS password_resets (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS kites (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_anonymous INTEGER DEFAULT 0,
    is_read INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    created_by TEXT NOT NULL,
    is_private INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(created_by) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS group_members (
    group_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(group_id, user_id),
    FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS group_messages (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_anonymous INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    is_anonymous INTEGER DEFAULT 0,
    is_flagged INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS replies (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    author_id TEXT NOT NULL,
    content TEXT NOT NULL,
    is_anonymous INTEGER DEFAULT 0,
    is_flagged INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE,
    FOREIGN KEY(author_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    is_read INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    description TEXT,
    salary_range TEXT,
    is_felony_friendly INTEGER DEFAULT 1,
    support_level TEXT DEFAULT 'medium',
    category TEXT DEFAULT 'general',
    posted_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(posted_by) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS job_applications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    date_applied TEXT,
    status TEXT DEFAULT 'applied',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS housing (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    location TEXT,
    contact_info TEXT,
    description TEXT,
    posted_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(posted_by) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS mentorships (
    id TEXT PRIMARY KEY,
    mentor_id TEXT NOT NULL,
    mentee_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(mentor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(mentee_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS legal_cases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    case_number TEXT,
    court TEXT,
    status TEXT DEFAULT 'active',
    next_hearing_date TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    file_name TEXT,
    file_type TEXT,
    file_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS moderation_logs (
    id TEXT PRIMARY KEY,
    moderator_id TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(moderator_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(reporter_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    mood INTEGER NOT NULL,
    note TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    is_shared INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    badge TEXT NOT NULL,
    label TEXT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS success_stories (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_anonymous INTEGER DEFAULT 0,
    upvotes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS peer_matches (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    matched_id TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(matched_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS blocked_users (
    blocker_id TEXT NOT NULL,
    blocked_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(blocker_id, blocked_id),
    FOREIGN KEY(blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(blocked_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// ─── Migrations (safe ALTER TABLE) ────────────────────────────────────────────
const migrations = [
  "ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0",
  "ALTER TABLE users ADD COLUMN recovery_stage TEXT DEFAULT 'early'",
  "ALTER TABLE users ADD COLUMN interests TEXT DEFAULT '[]'",
  "ALTER TABLE users ADD COLUMN avatar_color TEXT DEFAULT '#4F46E5'",
  "ALTER TABLE threads ADD COLUMN is_anonymous INTEGER DEFAULT 0",
  "ALTER TABLE replies ADD COLUMN is_anonymous INTEGER DEFAULT 0",
  "ALTER TABLE kites ADD COLUMN is_anonymous INTEGER DEFAULT 0",
  "ALTER TABLE kites ADD COLUMN is_read INTEGER DEFAULT 0",
  "ALTER TABLE jobs ADD COLUMN salary_range TEXT",
  "ALTER TABLE jobs ADD COLUMN support_level TEXT DEFAULT 'medium'",
  "ALTER TABLE jobs ADD COLUMN category TEXT DEFAULT 'general'",
];
for (const m of migrations) {
  try { db.exec(m); } catch (_) {}
}

// ─── Password Hashing ─────────────────────────────────────────────────────────
const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, stored: string): boolean => {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const hashBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(hashBuffer, Buffer.from(hash, "hex"));
  } catch { return false; }
};

// ─── Peer Match Score ──────────────────────────────────────────────────────────
function calcMatchScore(a: any, b: any): number {
  let score = 0;
  if (a.facility && b.facility && a.facility === b.facility) score += 30;
  if (a.location && b.location && a.location === b.location) score += 20;
  if (a.recovery_stage && b.recovery_stage && a.recovery_stage === b.recovery_stage) score += 25;
  try {
    const ai = JSON.parse(a.interests || "[]");
    const bi = JSON.parse(b.interests || "[]");
    const common = ai.filter((x: string) => bi.includes(x)).length;
    score += common * 10;
  } catch (_) {}
  return Math.min(score, 100);
}

// ─── Award Achievement Helper ──────────────────────────────────────────────────
function awardAchievement(userId: string, badge: string, label: string) {
  try {
    const exists = db.prepare("SELECT id FROM achievements WHERE user_id = ? AND badge = ?").get(userId, badge);
    if (!exists) {
      db.prepare("INSERT INTO achievements (id, user_id, badge, label) VALUES (?, ?, ?, ?)").run(
        crypto.randomUUID(), userId, badge, label
      );
    }
  } catch (_) {}
}

// ─── Server ───────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(express.json({ limit: "50mb" }));

  // ─── Hardened security headers (CSP on) ──────────────────────────────────────
  app.use(helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'"],
      "object-src": ["'none'"],
      "frame-ancestors": ["'none'"],
    },
  }));

  // ─── Recursive body sanitiser (strips HTML/JS from all string fields) ────────
  const sanitiseBody = (req: any, _res: any, next: any) => {
    const walk = (v: any): any => {
      if (typeof v === "string") return sanitise(v, 50000);
      if (Array.isArray(v)) return v.map(walk);
      if (v && typeof v === "object") {
        for (const k of Object.keys(v)) v[k] = walk(v[k]);
        return v;
      }
      return v;
    };
    if (req.body && typeof req.body === "object") walk(req.body);
    next();
  };
  app.use(sanitiseBody);

  // ─── Server-side rate limiter (real, non-bypassable) ─────────────────────────
  const rateLimit = (action: RateAction) => (req: any, res: any, next: any) => {
    const id = req.userId || req.ip || "anon";
    const r = checkRate(action, String(id));
    if (!r.ok) return res.status(429).json({ error: `Too many requests. Try again in ${r.resetIn}s.` });
    next();
  };

  // ─── Content moderation guard for user-generated text ────────────────────────
  const moderateField = (field: string) => (req: any, res: any, next: any) => {
    const text = req.body?.[field];
    if (typeof text === "string") {
      const m = moderate(text);
      if (m.action === "block") return res.status(422).json({ error: "Message blocked: prohibited content." });
    }
    next();
  };

  // ─── Auth Middleware ─────────────────────────────────────────────────────────
  const requireAuth = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token" });
    const session = db.prepare("SELECT user_id FROM sessions WHERE token = ?").get(token) as any;
    if (!session) return res.status(401).json({ error: "Invalid token" });
    const user = db.prepare("SELECT is_suspended FROM users WHERE id = ?").get(session.user_id) as any;
    if (user?.is_suspended === 1) return res.status(403).json({ error: "Account suspended" });
    req.userId = session.user_id;
    next();
  };

  const requireRole = (roles: string[]) => (req: any, res: any, next: any) => {
    const user = db.prepare("SELECT role, is_admin FROM users WHERE id = ?").get(req.userId) as any;
    const effectiveRole = user?.is_admin === 1 ? "super_admin" : (user?.role || "user");
    if (!roles.includes(effectiveRole)) return res.status(403).json({ error: "Forbidden" });
    next();
  };

  // ─── Health ──────────────────────────────────────────────────────────────────
  app.get("/api/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));

  // ─── Auth Routes ─────────────────────────────────────────────────────────────
  app.post("/api/auth/register", rateLimit("register"), (req, res) => {
    const { username, email, password, facility, location, bio, recovery_stage, interests } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password required" });
    if (email && !isValidEmail(email)) return res.status(400).json({ error: "Invalid email format" });
    if (String(password).length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
    try {
      const id = crypto.randomUUID();
      const avatarColors = ['#4F46E5','#7C3AED','#DB2777','#DC2626','#D97706','#059669','#0284C7'];
      const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
      db.prepare(
        "INSERT INTO users (id, username, email, password, facility, location, bio, recovery_stage, interests, avatar_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
      ).run(id, username, email || null, hashPassword(password), facility || null, location || null, bio || null, recovery_stage || 'early', JSON.stringify(interests || []), color);
      const token = crypto.randomUUID();
      db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, id);
      awardAchievement(id, "welcome", "Welcome to New Horizon");
      const user = db.prepare("SELECT id, username, email, facility, location, bio, role, is_admin, is_mentor, is_verified, recovery_stage, interests, avatar_color FROM users WHERE id = ?").get(id);
      res.json({ token, user });
    } catch (e: any) {
      res.status(400).json({ error: e.message?.includes("UNIQUE") ? "Username or email already taken" : "Registration failed" });
    }
  });

  app.post("/api/auth/login", rateLimit("login"), (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    if (!user || !verifyPassword(password, user.password)) return res.status(401).json({ error: "Invalid credentials" });
    if (user.is_suspended === 1) return res.status(403).json({ error: "Account suspended" });
    const token = crypto.randomUUID();
    db.prepare("INSERT INTO sessions (token, user_id) VALUES (?, ?)").run(token, user.id);
    const safeUser = { id: user.id, username: user.username, email: user.email, facility: user.facility, location: user.location, bio: user.bio, role: user.is_admin === 1 ? "super_admin" : user.role, is_admin: user.is_admin, is_mentor: user.is_mentor, is_verified: user.is_verified, recovery_stage: user.recovery_stage, interests: user.interests, avatar_color: user.avatar_color };
    res.json({ token, user: safeUser });
  });

  app.get("/api/auth/me", requireAuth, (req: any, res) => {
    const user = db.prepare("SELECT id, username, email, facility, location, bio, role, is_admin, is_mentor, is_verified, recovery_stage, interests, avatar_color FROM users WHERE id = ?").get(req.userId) as any;
    if (!user) return res.status(404).json({ error: "User not found" });
    user.role = user.is_admin === 1 ? "super_admin" : user.role;
    res.json({ user });
  });

  app.post("/api/auth/logout", requireAuth, (req: any, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    res.json({ success: true });
  });

  app.post("/api/auth/forgot-password", rateLimit("passwordReset"), (req, res) => {
    const { email } = req.body;
    const user = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000).toISOString();
      db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(user.id);
      db.prepare("INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)").run(resetToken, user.id, expires);
      // _devToken is a local-testing convenience only — there is no email provider wired up yet.
      // Never expose the raw reset token in a real deployment (it's a full account-takeover token).
      const devPayload = process.env.NODE_ENV !== "production" ? { _devToken: resetToken } : {};
      res.json({ success: true, ...devPayload });
    } else {
      res.json({ success: true });
    }
  });

  app.post("/api/auth/reset-password", (req, res) => {
    const { token, newPassword } = req.body;
    const reset = db.prepare("SELECT user_id, expires_at FROM password_resets WHERE token = ?").get(token) as any;
    if (!reset) return res.status(400).json({ error: "Invalid token" });
    if (new Date(reset.expires_at) < new Date()) {
      db.prepare("DELETE FROM password_resets WHERE token = ?").run(token);
      return res.status(400).json({ error: "Token expired" });
    }
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashPassword(newPassword), reset.user_id);
    db.prepare("DELETE FROM password_resets WHERE token = ?").run(token);
    db.prepare("DELETE FROM sessions WHERE user_id = ?").run(reset.user_id);
    res.json({ success: true });
  });

  // ─── Users ───────────────────────────────────────────────────────────────────
  app.get("/api/users", requireAuth, (req: any, res) => {
    const blocked = db.prepare("SELECT blocked_id FROM blocked_users WHERE blocker_id = ?").all(req.userId).map((r: any) => r.blocked_id);
    const users = db.prepare("SELECT id, username, facility, location, bio, is_mentor, is_verified, is_admin, role, hide_location, hide_history, recovery_stage, interests, avatar_color FROM users WHERE id != ?").all(req.userId);
    const result = users
      .filter((u: any) => !blocked.includes(u.id))
      .map((u: any) => ({
        id: u.id,
        name: u.username,
        bio: u.bio,
        is_mentor: u.is_mentor,
        is_verified: u.is_verified,
        is_admin: u.is_admin,
        role: u.is_admin === 1 ? "super_admin" : u.role,
        recovery_stage: u.recovery_stage,
        interests: u.interests,
        avatar_color: u.avatar_color,
        history: u.hide_history ? "Hidden" : u.facility,
        location: u.hide_location ? "Hidden" : u.location,
      }));
    res.json(result);
  });

  app.get("/api/users/profile", requireAuth, (req: any, res) => {
    const user = db.prepare("SELECT id, username, email, facility, location, bio, is_mentor, is_verified, is_admin, role, hide_location, hide_history, recovery_stage, interests, avatar_color FROM users WHERE id = ?").get(req.userId) as any;
    if (!user) return res.status(404).json({ error: "Not found" });
    user.role = user.is_admin === 1 ? "super_admin" : user.role;
    res.json(user);
  });

  app.put("/api/users/profile", requireAuth, (req: any, res) => {
    const { bio, location, facility, hide_location, hide_history, is_mentor, recovery_stage, interests, avatar_color } = req.body;
    db.prepare("UPDATE users SET bio=?, location=?, facility=?, hide_location=?, hide_history=?, is_mentor=?, recovery_stage=?, interests=?, avatar_color=? WHERE id=?").run(
      bio || null, location || null, facility || null,
      hide_location ? 1 : 0, hide_history ? 1 : 0, is_mentor ? 1 : 0,
      recovery_stage || 'early', JSON.stringify(interests || []), avatar_color || '#4F46E5',
      req.userId
    );
    res.json({ success: true });
  });

  // ─── Peer Matching (Feature 3) ────────────────────────────────────────────────
  app.get("/api/peer-matches", requireAuth, (req: any, res) => {
    const me = db.prepare("SELECT * FROM users WHERE id = ?").get(req.userId) as any;
    const others = db.prepare("SELECT * FROM users WHERE id != ? AND is_suspended = 0").all(req.userId) as any[];
    const matches = others.map(u => ({ ...u, score: calcMatchScore(me, u) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(u => ({ id: u.id, name: u.username, bio: u.bio, score: u.score, recovery_stage: u.recovery_stage, interests: u.interests, avatar_color: u.avatar_color, is_verified: u.is_verified }));
    res.json(matches);
  });

  // ─── Groups (Feature 2) ───────────────────────────────────────────────────────
  app.get("/api/groups", requireAuth, (_req, res) => {
    const groups = db.prepare(`
      SELECT g.*, COUNT(gm.user_id) as member_count,
             u.username as creator_name
      FROM groups g
      LEFT JOIN group_members gm ON gm.group_id = g.id
      JOIN users u ON u.id = g.created_by
      GROUP BY g.id ORDER BY g.created_at DESC
    `).all();
    res.json(groups);
  });

  app.post("/api/groups", requireAuth, (req: any, res) => {
    const { name, description, category, is_private } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO groups (id, name, description, category, created_by, is_private) VALUES (?, ?, ?, ?, ?, ?)").run(
      id, name, description || null, category || 'general', req.userId, is_private ? 1 : 0
    );
    db.prepare("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)").run(id, req.userId);
    res.json({ success: true, id });
  });

  app.post("/api/groups/:id/join", requireAuth, (req: any, res) => {
    try {
      db.prepare("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)").run(req.params.id, req.userId);
      awardAchievement(req.userId, "community", "Joined a Community Group");
    } catch (_) {}
    res.json({ success: true });
  });

  app.delete("/api/groups/:id/leave", requireAuth, (req: any, res) => {
    db.prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ success: true });
  });

  app.get("/api/groups/:id/messages", requireAuth, (req: any, res) => {
    const msgs = db.prepare(`
      SELECT gm.*, u.username as sender_name, u.avatar_color
      FROM group_messages gm
      JOIN users u ON u.id = gm.sender_id
      WHERE gm.group_id = ?
      ORDER BY gm.timestamp ASC LIMIT 100
    `).all(req.params.id);
    res.json(msgs.map((m: any) => ({
      ...m,
      sender_name: m.is_anonymous ? "Anonymous" : m.sender_name,
      avatar_color: m.is_anonymous ? "#6B7280" : m.avatar_color,
    })));
  });

  app.post("/api/groups/:id/messages", requireAuth, rateLimit("message"), moderateField("content"), (req: any, res) => {
    const { content, is_anonymous } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO group_messages (id, group_id, sender_id, content, is_anonymous) VALUES (?, ?, ?, ?, ?)").run(
      id, req.params.id, req.userId, content, is_anonymous ? 1 : 0
    );
    res.json({ success: true, id });
  });

  // ─── Kites / DMs (Feature 5) ──────────────────────────────────────────────────
  app.get("/api/kites/conversations", requireAuth, (req: any, res) => {
    const convos = db.prepare(`
      SELECT u.id as other_user_id, u.username as other_user_name, u.avatar_color,
             k.content as last_message, k.timestamp as last_message_time,
             k.sender_id,
             (SELECT COUNT(*) FROM kites WHERE receiver_id = ? AND sender_id = u.id AND is_read = 0) as unread
      FROM users u
      JOIN (
        SELECT *, MAX(timestamp) as max_ts
        FROM kites WHERE sender_id = ? OR receiver_id = ?
        GROUP BY CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
      ) k ON u.id = CASE WHEN k.sender_id = ? THEN k.receiver_id ELSE k.sender_id END
      ORDER BY k.timestamp DESC
    `).all(req.userId, req.userId, req.userId, req.userId, req.userId);
    res.json(convos);
  });

  app.get("/api/kites/thread/:otherId", requireAuth, (req: any, res) => {
    const msgs = db.prepare(`
      SELECT k.*, u.username as sender_name, u.avatar_color
      FROM kites k JOIN users u ON k.sender_id = u.id
      WHERE (k.sender_id = ? AND k.receiver_id = ?) OR (k.sender_id = ? AND k.receiver_id = ?)
      ORDER BY k.timestamp ASC
    `).all(req.userId, req.params.otherId, req.params.otherId, req.userId);
    db.prepare("UPDATE kites SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?").run(req.userId, req.params.otherId);
    res.json(msgs);
  });

  app.post("/api/kites", requireAuth, rateLimit("message"), moderateField("content"), (req: any, res) => {
    const { receiverId, content, is_anonymous } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO kites (id, sender_id, receiver_id, content, is_anonymous) VALUES (?, ?, ?, ?, ?)").run(
      id, req.userId, receiverId, content, is_anonymous ? 1 : 0
    );
    const sender = db.prepare("SELECT username FROM users WHERE id = ?").get(req.userId) as any;
    db.prepare("INSERT INTO notifications (id, user_id, type, content, link) VALUES (?, ?, ?, ?, ?)").run(
      crypto.randomUUID(), receiverId, "kite", `${is_anonymous ? "Someone" : sender.username} sent you a kite.`, "kites"
    );
    res.json({ success: true, id });
  });

  // ─── Forum / Threads ───────────────────────────────────────────────────────────
  app.get("/api/threads", requireAuth, (req: any, res) => {
    const category = (req.query as any).category;
    let rows: any[];
    if (category && category !== "all") {
      rows = db.prepare(`SELECT t.*, u.username as author_name, u.avatar_color, (SELECT COUNT(*) FROM replies WHERE thread_id = t.id) as reply_count FROM threads t JOIN users u ON t.author_id = u.id WHERE t.is_flagged = 0 AND t.category = ? ORDER BY t.created_at DESC`).all(category);
    } else {
      rows = db.prepare(`SELECT t.*, u.username as author_name, u.avatar_color, (SELECT COUNT(*) FROM replies WHERE thread_id = t.id) as reply_count FROM threads t JOIN users u ON t.author_id = u.id WHERE t.is_flagged = 0 ORDER BY t.created_at DESC`).all();
    }
    res.json(rows.map((r: any) => ({
      ...r,
      author_name: r.is_anonymous ? "Anonymous" : r.author_name,
      avatar_color: r.is_anonymous ? "#6B7280" : r.avatar_color,
    })));
  });

  app.post("/api/threads", requireAuth, rateLimit("post"), moderateField("content"), (req: any, res) => {
    const { title, content, category, is_anonymous } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO threads (id, author_id, title, content, category, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)").run(
      id, req.userId, title, content, category || "general", is_anonymous ? 1 : 0
    );
    awardAchievement(req.userId, "first_post", "First Forum Post");
    res.json({ success: true, id });
  });

  app.get("/api/threads/:id/replies", requireAuth, (_req, res) => {
    const replies = db.prepare(`SELECT r.*, u.username as author_name, u.avatar_color FROM replies r JOIN users u ON r.author_id = u.id WHERE r.thread_id = ? AND r.is_flagged = 0 ORDER BY r.created_at ASC`).all(_req.params.id);
    res.json(replies.map((r: any) => ({
      ...r,
      author_name: r.is_anonymous ? "Anonymous" : r.author_name,
      avatar_color: r.is_anonymous ? "#6B7280" : r.avatar_color,
    })));
  });

  app.post("/api/threads/:id/replies", requireAuth, rateLimit("post"), moderateField("content"), (req: any, res) => {
    const { content, is_anonymous } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO replies (id, thread_id, author_id, content, is_anonymous) VALUES (?, ?, ?, ?, ?)").run(
      id, req.params.id, req.userId, content, is_anonymous ? 1 : 0
    );
    res.json({ success: true, id });
  });

  // ─── Check-ins (Feature 8) ────────────────────────────────────────────────────
  app.get("/api/checkins", requireAuth, (req: any, res) => {
    const checkins = db.prepare("SELECT * FROM checkins WHERE user_id = ? ORDER BY date DESC LIMIT 30").all(req.userId);
    res.json(checkins);
  });

  app.post("/api/checkins", requireAuth, (req: any, res) => {
    const { mood, note, date } = req.body;
    const today = date || new Date().toISOString().split("T")[0];
    const existing = db.prepare("SELECT id FROM checkins WHERE user_id = ? AND date = ?").get(req.userId, today);
    if (existing) {
      db.prepare("UPDATE checkins SET mood = ?, note = ? WHERE user_id = ? AND date = ?").run(mood, note || null, req.userId, today);
    } else {
      db.prepare("INSERT INTO checkins (id, user_id, mood, note, date) VALUES (?, ?, ?, ?, ?)").run(
        crypto.randomUUID(), req.userId, mood, note || null, today
      );
    }
    const count = (db.prepare("SELECT COUNT(*) as c FROM checkins WHERE user_id = ?").get(req.userId) as any).c;
    if (count === 7) awardAchievement(req.userId, "checkin_7", "7-Day Check-in Streak");
    if (count === 30) awardAchievement(req.userId, "checkin_30", "30-Day Check-in Streak");
    res.json({ success: true });
  });

  // ─── Journal (Feature 9) ──────────────────────────────────────────────────────
  app.get("/api/journal", requireAuth, (req: any, res) => {
    const entries = db.prepare("SELECT id, title, content, is_shared, created_at FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC").all(req.userId);
    res.json(entries);
  });

  app.post("/api/journal", requireAuth, (req: any, res) => {
    const { title, content, is_shared } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO journal_entries (id, user_id, title, content, is_shared) VALUES (?, ?, ?, ?, ?)").run(
      id, req.userId, title || null, content, is_shared ? 1 : 0
    );
    awardAchievement(req.userId, "journaler", "Started Journaling");
    res.json({ success: true, id });
  });

  app.put("/api/journal/:id", requireAuth, (req: any, res) => {
    const { title, content, is_shared } = req.body;
    db.prepare("UPDATE journal_entries SET title=?, content=?, is_shared=? WHERE id=? AND user_id=?").run(
      title || null, content, is_shared ? 1 : 0, req.params.id, req.userId
    );
    res.json({ success: true });
  });

  app.delete("/api/journal/:id", requireAuth, (req: any, res) => {
    db.prepare("DELETE FROM journal_entries WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ success: true });
  });

  // ─── Success Stories (Feature 25) ─────────────────────────────────────────────
  app.get("/api/success-stories", requireAuth, (_req, res) => {
    const stories = db.prepare(`
      SELECT s.*, u.username as author_name, u.avatar_color
      FROM success_stories s JOIN users u ON s.user_id = u.id
      ORDER BY s.upvotes DESC, s.created_at DESC
    `).all();
    res.json(stories.map((s: any) => ({
      ...s,
      author_name: s.is_anonymous ? "Anonymous" : s.author_name,
    })));
  });

  app.post("/api/success-stories", requireAuth, (req: any, res) => {
    const { title, content, is_anonymous } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO success_stories (id, user_id, title, content, is_anonymous) VALUES (?, ?, ?, ?, ?)").run(
      id, req.userId, title, content, is_anonymous ? 1 : 0
    );
    awardAchievement(req.userId, "success_story", "Shared a Success Story");
    res.json({ success: true, id });
  });

  app.put("/api/success-stories/:id/upvote", requireAuth, (req: any, res) => {
    db.prepare("UPDATE success_stories SET upvotes = upvotes + 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // ─── Achievements / Badges (Feature 22) ───────────────────────────────────────
  app.get("/api/achievements", requireAuth, (req: any, res) => {
    const mine = db.prepare("SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_at DESC").all(req.userId);
    res.json(mine);
  });

  // ─── Jobs (Feature 13) ────────────────────────────────────────────────────────
  app.get("/api/jobs", requireAuth, (req: any, res) => {
    const { category, felony_friendly } = req.query as any;
    let q = "SELECT j.*, u.username as posted_by_name FROM jobs j JOIN users u ON j.posted_by = u.id WHERE 1=1";
    const params: any[] = [];
    if (category && category !== "all") { q += " AND j.category = ?"; params.push(category); }
    if (felony_friendly === "1") { q += " AND j.is_felony_friendly = 1"; }
    q += " ORDER BY j.created_at DESC";
    res.json(db.prepare(q).all(...params));
  });

  app.post("/api/jobs", requireAuth, (req: any, res) => {
    const { title, company, location, description, is_felony_friendly, salary_range, support_level, category } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO jobs (id, title, company, location, description, is_felony_friendly, salary_range, support_level, category, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      id, title, company, location || null, description || null, is_felony_friendly ? 1 : 0,
      salary_range || null, support_level || 'medium', category || 'general', req.userId
    );
    res.json({ success: true, id });
  });

  app.delete("/api/jobs/:id", requireAuth, (req: any, res) => {
    db.prepare("DELETE FROM jobs WHERE id = ? AND posted_by = ?").run(req.params.id, req.userId);
    res.json({ success: true });
  });

  // ─── Job Applications (Feature 13) ────────────────────────────────────────────
  app.get("/api/job-applications", requireAuth, (req: any, res) => {
    res.json(db.prepare("SELECT * FROM job_applications WHERE user_id = ? ORDER BY created_at DESC").all(req.userId));
  });

  app.post("/api/job-applications", requireAuth, (req: any, res) => {
    const { company, position, date_applied, status, notes } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO job_applications (id, user_id, company, position, date_applied, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id, req.userId, company, position, date_applied || null, status || 'applied', notes || null
    );
    awardAchievement(req.userId, "job_seeker", "Applied to First Job");
    res.json({ success: true, id });
  });

  app.put("/api/job-applications/:id", requireAuth, (req: any, res) => {
    const { company, position, date_applied, status, notes } = req.body;
    db.prepare("UPDATE job_applications SET company=?, position=?, date_applied=?, status=?, notes=? WHERE id=? AND user_id=?").run(
      company, position, date_applied, status, notes, req.params.id, req.userId
    );
    res.json({ success: true });
  });

  app.delete("/api/job-applications/:id", requireAuth, (req: any, res) => {
    db.prepare("DELETE FROM job_applications WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ success: true });
  });

  // ─── Legal Cases ──────────────────────────────────────────────────────────────
  app.get("/api/legal-cases", requireAuth, (req: any, res) => {
    res.json(db.prepare("SELECT * FROM legal_cases WHERE user_id = ? ORDER BY created_at DESC").all(req.userId));
  });

  app.post("/api/legal-cases", requireAuth, (req: any, res) => {
    const { case_number, court, status, next_hearing_date, notes } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO legal_cases (id, user_id, case_number, court, status, next_hearing_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id, req.userId, case_number || null, court || null, status || 'active', next_hearing_date || null, notes || null
    );
    res.json({ success: true, id });
  });

  app.put("/api/legal-cases/:id", requireAuth, (req: any, res) => {
    const { case_number, court, status, next_hearing_date, notes } = req.body;
    db.prepare("UPDATE legal_cases SET case_number=?, court=?, status=?, next_hearing_date=?, notes=? WHERE id=? AND user_id=?").run(
      case_number, court, status, next_hearing_date, notes, req.params.id, req.userId
    );
    res.json({ success: true });
  });

  app.delete("/api/legal-cases/:id", requireAuth, (req: any, res) => {
    db.prepare("DELETE FROM legal_cases WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ success: true });
  });

  // ─── Mentorship ───────────────────────────────────────────────────────────────
  app.get("/api/mentors", requireAuth, (req: any, res) => {
    const mentors = db.prepare("SELECT id, username as name, bio, facility, location, avatar_color, is_verified FROM users WHERE is_mentor = 1 AND is_suspended = 0 AND id != ?").all(req.userId);
    res.json(mentors);
  });

  app.post("/api/mentorships/request/:mentorId", requireAuth, (req: any, res) => {
    const existing = db.prepare("SELECT id FROM mentorships WHERE mentor_id = ? AND mentee_id = ? AND status != 'declined'").get(req.params.mentorId, req.userId);
    if (existing) return res.status(400).json({ error: "Request already exists" });
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO mentorships (id, mentor_id, mentee_id) VALUES (?, ?, ?)").run(id, req.params.mentorId, req.userId);
    const mentee = db.prepare("SELECT username FROM users WHERE id = ?").get(req.userId) as any;
    db.prepare("INSERT INTO notifications (id, user_id, type, content, link) VALUES (?, ?, ?, ?, ?)").run(
      crypto.randomUUID(), req.params.mentorId, "mentorship", `${mentee.username} requested you as a mentor.`, "mentorship"
    );
    res.json({ success: true });
  });

  app.get("/api/mentorships", requireAuth, (req: any, res) => {
    const mentorships = db.prepare(`
      SELECT m.*, 
             mentor.username as mentor_name, mentor.avatar_color as mentor_avatar,
             mentee.username as mentee_name, mentee.avatar_color as mentee_avatar
      FROM mentorships m
      JOIN users mentor ON mentor.id = m.mentor_id
      JOIN users mentee ON mentee.id = m.mentee_id
      WHERE m.mentor_id = ? OR m.mentee_id = ?
      ORDER BY m.created_at DESC
    `).all(req.userId, req.userId);
    res.json(mentorships);
  });

  app.put("/api/mentorships/:id", requireAuth, (req: any, res) => {
    const { status } = req.body;
    const m = db.prepare("SELECT * FROM mentorships WHERE id = ?").get(req.params.id) as any;
    if (!m) return res.status(404).json({ error: "Not found" });
    db.prepare("UPDATE mentorships SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, req.params.id);
    if (status === 'active') awardAchievement(m.mentee_id, "mentored", "Found a Mentor");
    res.json({ success: true });
  });

  app.put("/api/users/mentor-status", requireAuth, (req: any, res) => {
    const user = db.prepare("SELECT is_mentor FROM users WHERE id = ?").get(req.userId) as any;
    const newStatus = user.is_mentor ? 0 : 1;
    db.prepare("UPDATE users SET is_mentor = ? WHERE id = ?").run(newStatus, req.userId);
    if (newStatus === 1) awardAchievement(req.userId, "mentor", "Became a Mentor");
    res.json({ success: true, is_mentor: newStatus });
  });

  // ─── Notifications ────────────────────────────────────────────────────────────
  app.get("/api/notifications", requireAuth, (req: any, res) => {
    const notifs = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50").all(req.userId);
    res.json(notifs);
  });

  app.put("/api/notifications/:id/read", requireAuth, (req: any, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ success: true });
  });

  app.put("/api/notifications/read-all", requireAuth, (req: any, res) => {
    db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(req.userId);
    res.json({ success: true });
  });

  // ─── Vault / Documents ────────────────────────────────────────────────────────
  app.get("/api/documents", requireAuth, (req: any, res) => {
    res.json(db.prepare("SELECT id, title, category, file_name, file_type, created_at FROM documents WHERE user_id = ?").all(req.userId));
  });

  app.post("/api/documents", requireAuth, (req: any, res) => {
    const { title, category, file_name, file_type, file_data } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO documents (id, user_id, title, category, file_name, file_type, file_data) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id, req.userId, title, category || 'general', file_name || null, file_type || null, file_data || null
    );
    awardAchievement(req.userId, "vault_user", "Stored First Document");
    res.json({ success: true, id });
  });

  app.delete("/api/documents/:id", requireAuth, (req: any, res) => {
    db.prepare("DELETE FROM documents WHERE id = ? AND user_id = ?").run(req.params.id, req.userId);
    res.json({ success: true });
  });

  // ─── Housing ──────────────────────────────────────────────────────────────────
  app.get("/api/housing", requireAuth, (_req, res) => {
    res.json(db.prepare("SELECT h.*, u.username as posted_by_name FROM housing h JOIN users u ON h.posted_by = u.id ORDER BY h.created_at DESC").all());
  });

  app.post("/api/housing", requireAuth, (req: any, res) => {
    const { name, type, location, contact_info, description } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO housing (id, name, type, location, contact_info, description, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      id, name, type || null, location || null, contact_info || null, description || null, req.userId
    );
    res.json({ success: true, id });
  });

  // ─── Reports / Safety (Feature 24) ────────────────────────────────────────────
  app.post("/api/reports", requireAuth, rateLimit("report"), (req: any, res) => {
    const { target_type, target_id, reason } = req.body;
    const id = crypto.randomUUID();
    db.prepare("INSERT INTO reports (id, reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?, ?)").run(
      id, req.userId, target_type, target_id, reason || null
    );
    res.json({ success: true });
  });

  // ─── Block Users (Feature 24) ─────────────────────────────────────────────────
  app.post("/api/block/:userId", requireAuth, (req: any, res) => {
    try {
      db.prepare("INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)").run(req.userId, req.params.userId);
    } catch (_) {}
    res.json({ success: true });
  });

  app.delete("/api/block/:userId", requireAuth, (req: any, res) => {
    db.prepare("DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?").run(req.userId, req.params.userId);
    res.json({ success: true });
  });

  // ─── Progress / Goals (Feature 20) ────────────────────────────────────────────
  app.get("/api/progress", requireAuth, (req: any, res) => {
    const checkins = (db.prepare("SELECT COUNT(*) as c FROM checkins WHERE user_id = ?").get(req.userId) as any).c;
    const journalEntries = (db.prepare("SELECT COUNT(*) as c FROM journal_entries WHERE user_id = ?").get(req.userId) as any).c;
    const applications = (db.prepare("SELECT COUNT(*) as c FROM job_applications WHERE user_id = ?").get(req.userId) as any).c;
    const achievements = (db.prepare("SELECT COUNT(*) as c FROM achievements WHERE user_id = ?").get(req.userId) as any).c;
    const threads = (db.prepare("SELECT COUNT(*) as c FROM threads WHERE author_id = ?").get(req.userId) as any).c;
    res.json({ checkins, journal_entries: journalEntries, job_applications: applications, achievements, forum_posts: threads });
  });

  // ─── Admin Routes ─────────────────────────────────────────────────────────────
  app.get("/api/admin/users", requireAuth, requireRole(["admin", "super_admin", "moderator"]), (_req, res) => {
    res.json(db.prepare("SELECT id, username, email, role, is_admin, is_suspended, is_verified, is_mentor, created_at FROM users ORDER BY created_at DESC").all());
  });

  app.put("/api/admin/users/:id/suspend", requireAuth, requireRole(["admin", "super_admin"]), (req: any, res) => {
    db.prepare("UPDATE users SET is_suspended = 1 WHERE id = ?").run(req.params.id);
    db.prepare("INSERT INTO moderation_logs (id, moderator_id, action, target_type, target_id) VALUES (?, ?, ?, ?, ?)").run(crypto.randomUUID(), req.userId, "suspend", "user", req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/users/:id/unsuspend", requireAuth, requireRole(["admin", "super_admin"]), (req: any, res) => {
    db.prepare("UPDATE users SET is_suspended = 0 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/users/:id/verify", requireAuth, requireRole(["admin", "super_admin"]), (req: any, res) => {
    db.prepare("UPDATE users SET is_verified = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/users/:id/role", requireAuth, requireRole(["super_admin"]), (req: any, res) => {
    const { role } = req.body;
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/users/:id", requireAuth, requireRole(["super_admin"]), (req: any, res) => {
    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/admin/reports", requireAuth, requireRole(["admin", "super_admin", "moderator"]), (_req, res) => {
    res.json(db.prepare("SELECT r.*, u.username as reporter_name FROM reports r JOIN users u ON r.reporter_id = u.id ORDER BY r.created_at DESC").all());
  });

  app.put("/api/admin/reports/:id", requireAuth, requireRole(["admin", "super_admin", "moderator"]), (req: any, res) => {
    db.prepare("UPDATE reports SET status = ? WHERE id = ?").run(req.body.status, req.params.id);
    res.json({ success: true });
  });

  app.put("/api/admin/threads/:id/flag", requireAuth, requireRole(["admin", "super_admin", "moderator"]), (req: any, res) => {
    db.prepare("UPDATE threads SET is_flagged = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/admin/posts/:id", requireAuth, requireRole(["moderator", "admin", "super_admin"]), (req: any, res) => {
    db.prepare("DELETE FROM replies WHERE thread_id = ?").run(req.params.id);
    db.prepare("DELETE FROM threads WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // ─── Vite Dev / Static ────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get(/.*/, (_req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`✅ New Horizon running → http://localhost:${PORT}`));
}

startServer().catch(console.error);
