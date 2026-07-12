# New Horizon v2.0 — Complete Platform

> A second-chance community platform with peer support, mental health tools, career resources, and secure messaging.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Start the development server
npm run dev
# → App runs at http://localhost:3000
```

### VS Code (F5 to launch with debugger)
Open the folder in VS Code → **Run and Debug** → select **"Start Dev Server"** → press F5.

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Tailwind v4 |
| Backend | Express 4 + Node.js |
| Database | SQLite (better-sqlite3) |
| Build | Vite 6 + tsx |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |

---

## ✅ Bug Fixes (v1 → v2)

| # | Bug | Fix |
|---|-----|-----|
| 1 | `express` v5 wildcard route `"*"` broke in prod | Changed to `/.*/ regex` |
| 2 | Password hashing used sync scrypt without error handling | Added try/catch + timing-safe compare |
| 3 | Missing `ON DELETE CASCADE` on foreign keys | Added to all FK relationships |
| 4 | `db.pragma('foreign_keys')` not enabled | Added `db.pragma("foreign_keys = ON")` |
| 5 | Sessions not cleaned up on user delete | CASCADE now handles this |
| 6 | `ALTER TABLE` migrations caused crashes on re-run | Wrapped each in try/catch |
| 7 | No `WAL` mode — slow concurrent writes | Added `db.pragma("journal_mode = WAL")` |
| 8 | Admin `unsuspend` endpoint missing | Added `/api/admin/users/:id/unsuspend` |
| 9 | `AdminDashboard` called wrong endpoint for unsuspend | Fixed to use correct URL |
| 10 | `AuthContext` used stale `localStorage` key `token` (conflicting) | Changed to `nh_token` |
| 11 | Notification fetch silently failed on non-array response | Added `Array.isArray` guard |
| 12 | `kites/conversations` SQL query had wrong param count (5 params, 4 expected) | Fixed to 5 placeholders |
| 13 | Profile PUT didn't update `interests` or `recovery_stage` | Added fields to UPDATE query |
| 14 | `vite.config.ts` leaked `GEMINI_API_KEY` to client | Removed Gemini config entirely |
| 15 | `src/App.tsx` imported non-existent `GlobalSearch`, `SOSButton` | Removed dead imports |

---

## 🎯 Features (All 25 Implemented)

### Community & Identity
1. **Verified Member Profiles** — Admin can verify users; blue shield shown publicly
2. **Interest-Based Groups** — Create/join groups by category; real-time group chat
3. **Peer Support Matching** — Algorithm scores users by facility, location, stage & interests
4. **Anonymous Posting** — Forum, groups, kites, and stories all support anonymous mode
5. **Direct Messaging (Kites)** — 1-on-1 private messaging with unread counts
6. **Group Chat Rooms** — Real-time discussion spaces per group topic

### Mental Health
7. **Crisis Resource Directory** — 8+ hotlines including 988, SAMHSA, NAMI, Veterans Line
8. **Mental Health Check-ins** — Daily mood tracking with streak counter and history
9. **Journaling Tool** — Private entries with optional community sharing
10. **Meditation & Mindfulness Library** — 6 guided exercises with instructions
11. **Therapy Resource Library** — Articles and guides on trauma, relationships, anxiety
12. **Peer Support Groups** — Moderated group discussions by topic

### Career Development
13. **Job Board** — Listings with felony-friendly filter, salary range, category
14. **Application Tracker** — Log and track status of every job application
15. **Skills Assessment** — Categorized inventory of transferable skills
16. **Interview Prep** — Common Q&A with scripted second-chance-specific answers
17. **Mentor Matching** — Request a mentor; accept/decline workflow
18. **Job Search Guides** — Resume tips specifically for reentry job seekers

### Accountability & Progress
19. **Check-in System** — Daily wellness prompts with streak tracking
20. **Progress Tracking** — Dashboard showing check-ins, posts, applications, achievements
21. **Supervisor Dashboard** — Admin panel for counselors/case workers to manage members
22. **Badge/Achievement System** — Auto-awarded badges for milestones
23. **Support Plan Integration** — Recovery stage tracked and shown on profile

### Safety & Community
24. **Moderation & Safety Tools** — Report content, block users, admin moderation queue
25. **Success Story Sharing** — Shareable wins with upvotes and anonymous option

---

## 📁 File Structure

```
new-horizon/
├── server.ts              # Express API + SQLite + all routes
├── src/
│   ├── main.tsx           # React entry point
│   ├── App.tsx            # Layout, navigation, tab routing
│   ├── AuthContext.tsx    # Authentication state
│   ├── index.css          # Global styles (Tailwind)
│   ├── types.ts           # TypeScript interfaces
│   └── components/
│       ├── Auth.tsx           # Login / Register / Forgot Password
│       ├── Dashboard.tsx      # Home stats, quick actions, peer matches
│       ├── TheYard.tsx        # Member discovery with verified badges
│       ├── Kites.tsx          # Direct messaging
│       ├── Groups.tsx         # Interest-based group chat
│       ├── Forum.tsx          # Community forum with anonymous posting
│       ├── SuccessStories.tsx # Share and celebrate wins
│       ├── Mentorship.tsx     # Mentor request/match system
│       ├── CheckIns.tsx       # Daily mood tracking
│       ├── Journal.tsx        # Private journaling tool
│       ├── Resources.tsx      # Crisis hotlines + mindfulness + library
│       ├── Opportunities.tsx  # Jobs + application tracker + housing
│       ├── Tools.tsx          # Resume, interview, skills tools
│       ├── CaseTracker.tsx    # Legal case management
│       ├── Vault.tsx          # Document tracking
│       ├── Profile.tsx        # User profile + privacy settings + badges
│       ├── AdminDashboard.tsx # User management + reports
│       └── HelpCenter.tsx     # FAQ / support
├── .vscode/
│   ├── launch.json        # F5 debug config
│   ├── settings.json      # Editor settings
│   └── extensions.json    # Recommended extensions
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

---

## 🔑 Default Admin Setup

After registering, promote yourself to admin in the SQLite database:

```bash
# Install sqlite3 CLI if needed, then:
sqlite3 data/app.db "UPDATE users SET role='super_admin', is_admin=1 WHERE username='YOUR_USERNAME';"
```

Then refresh the app — you'll see the Admin Panel in the sidebar.

---

## 📦 Deployment

```bash
# Build for production
npm run build

# Serve production build
NODE_ENV=production npm start
```

The server serves the built `dist/` folder in production mode.
