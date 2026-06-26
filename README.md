# 🌍 Verdana

> **The social network for saving the planet.** Build your own *living Earth*
> through real-world action, climb the global leaderboard, and restore the
> planet together. The GitHub / Strava of climate action.

Verdana V2 is a community platform — not a donation site. Every real-world
action raises your **eco-score**, heals your personal **3D Earth**, and moves
you up a global **leaderboard** of 58k+ citizens.

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. **The app runs fully in demo mode with no setup** —
seeded users, leaderboards, a sample dashboard, and an interactive 3D Earth.

> **Windows note:** the npm package is `verdana` (lowercase); npm forbids
> capitals even though the folder is `Verdana`.

---

## Tech stack

| Layer        | Choice                                                        |
| ------------ | ------------------------------------------------------------ |
| Framework    | Next.js 15 (App Router) · React 19                           |
| Language     | TypeScript (strict)                                          |
| Styling      | Tailwind CSS 3 · custom dark/light theme (glass + aurora)    |
| 3D           | React Three Fiber + three.js (procedural shader Earth)      |
| Motion       | Framer Motion                                                |
| Theming      | next-themes (dark default, light toggle)                     |
| Auth         | Clerk (`@clerk/nextjs`) — Google sign-in — **optional**, demo fallback |
| Database     | Supabase (`@supabase/ssr`) — scaffolded, **optional**        |
| Fonts        | Sora (display) · Inter (UI)                                  |

---

## Demo mode vs. live mode

Auth is **Clerk** (Google sign-in); the database is **Supabase**. Both are
optional — the app reads their env keys and degrades gracefully:

- **No keys → demo mode.** Seeded data from [src/lib/community.ts](src/lib/community.ts),
  a simulated session (demo profile `VER-582931`, with **admin access**), and an
  auth page that drops you straight into the app.
- **Clerk keys set → live auth.** Google sign-in via Clerk, cookie sessions via
  `clerkMiddleware`, route protection on `(app)` + `(admin)`, and `UserButton`
  sign-out. Admin access is granted to a Clerk user whose
  `publicMetadata = { "role": "admin" }`.

### Going live

**Auth (Clerk):**
1. Create a Clerk app; in **SSO Connections** enable **Google**.
2. Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` to `.env.local`
   (see [.env.example](.env.example)).
3. Restart, visit `/login` → "Continue with Google".
4. To make yourself an admin, set your user's `publicMetadata` to
   `{ "role": "admin" }` in the Clerk dashboard.

**Database (Supabase, scaffolded — optional):**
1. Create a Supabase project; run
   [supabase/migrations/0001_init.sql](supabase/migrations/0001_init.sql).
2. Add the `NEXT_PUBLIC_SUPABASE_*` keys. Clients live in
   [src/lib/supabase/](src/lib/supabase/); wire reads through
   [src/lib/session.ts](src/lib/session.ts) / [src/lib/community.ts](src/lib/community.ts).

---

## What's included (V2 — foundation + signature)

### App (authenticated `(app)` group)

| Route                  | Highlights                                                                 |
| ---------------------- | ------------------------------------------------------------------------- |
| `/dashboard`           | Animated stat cards, global ranking + nearby users, eco-score ring, monthly/weekly charts, badges, milestones, live friends feed, daily challenges |
| `/earth`               | Immersive interactive 3D **Living Earth** + 7-stage growth ladder         |
| `/leaderboard`         | 8 categories × 4 periods, medals, "your position", top countries          |
| `/profile/[planetId]`  | Steam/GitHub-style public profile: cover, Planet ID, Earth, badges, follow, timeline |
| `/login`, `/signup`    | Clerk auth (Google) with demo fallback                                    |
| `/admin` *(+ /users, /content, /challenges)* | Admin console — KPIs, user management, moderation queue, challenge manager (admins only) |
| `/` (landing)          | Premium marketing page with a live Earth hero                             |

### The Living Earth 🌍

[src/components/earth/](src/components/earth/) — a procedural planet (no texture
assets). A single `health` value (0–100, derived from eco-score) drives a custom
GLSL shader: barren grey → green continents → clear oceans → ice caps → lush
atmosphere. Drag to rotate, scroll to zoom. Rendered client-only (`ssr: false`)
and wrapped in an error boundary that falls back to a styled orb if WebGL is
unavailable.

### Scoring engine

[src/lib/scoring.ts](src/lib/scoring.ts) — eco-score (weights breadth of action,
not just donations), 8 levels (Seed → Legend of Verdana), Earth-health curve +
stages, and the badge catalog. Pure & deterministic.

---

## Project structure

```
src/
  app/
    (landing)/        # public marketing page  → /
    (auth)/           # login, signup          → /login /signup
    (app)/            # the platform (sidebar shell, auth-gated)
      dashboard/  earth/  leaderboard/  profile/[planetId]/
    (legacy)/         # original V1 commerce pages (plant/checkout/corporate/forest)
    api/              # V1 REST stubs
    layout.tsx        # root: fonts + ThemeProvider
  components/
    earth/            # Living Earth (R3F + shaders + error boundary)
    app/              # dashboard/app UI (cards, charts, sidebar, topbar…)
    auth/  theme/     # auth form, theme provider/toggle
    icons.tsx
  lib/
    scoring.ts        # eco-score / levels / earth-health / badges
    community.ts      # deterministic demo dataset + queries (DB seam)
    session.ts        # current user (Supabase or demo)
    supabase/         # browser + server clients (null in demo)
    types.ts  env.ts
supabase/migrations/  # 0001_init.sql
```

---

## Roadmap

- **This pass — foundation + signature:** premium shell, dashboard, 3D Living
  Earth, profiles + Planet ID, leaderboards, badges/levels/eco-score. ✅
- **Next — social:** community feed (posts/likes/comments), follow system +
  activity feed, Reddit-style forums, daily challenge completion, friends graph.
  (Schema + tables already in the migration.)
- **Later:** global shared Earth with realtime updates, notifications, themes &
  profile decorations, org/city/university leaderboards.

---

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Dev server                   |
| `npm run build` | Production build             |
| `npm run start` | Serve the production build    |
| `npm run lint`  | Lint with eslint-config-next |
