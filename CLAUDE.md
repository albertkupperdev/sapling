# Sapling — CLAUDE.md

ADHD-friendly productivity app. Users select a mood, get AI task breakdowns (Groq/Llama 3.3 70B), work through tasks in a fullscreen Focus Mode with a breathing ring animation, and can hit Overwhelm Mode to surface only the single lowest-energy task. All data persists in Supabase with Row Level Security; auth is Supabase email/password + magic link.

---

## Tech Stack

| | Version |
|---|---|
| Next.js (App Router) | 16.2.6 |
| React | 19.2.4 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| Framer Motion | ^12 |
| Zustand | ^5 |
| Supabase JS + SSR | ^2.105 / ^0.10 |
| groq-sdk | ^1.2 |
| React Hook Form | ^7.75 |
| Zod | ^4.4 |
| shadcn/ui (Base UI) | ^4.7 |
| dnd-kit | core ^6, sortable ^10 |
| Recharts | ^3.8 |
| Sonner (toasts) | ^2 |
| next-themes | ^0.4 |
| canvas-confetti | ^1.9 |

---

## Folder Structure

```
app/
  layout.tsx                  # Root layout — Geist font, dark-mode flash prevention, skip-nav, Providers
  globals.css                 # Design system: OKLCH tokens, mood overrides, breathing animation
  page.tsx                    # Marketing landing page (root route)
  not-found.tsx
  opengraph-image.tsx
  (marketing)/                # Route group — public pages, no auth check
    layout.tsx
  (auth)/                     # Route group — login, signup, onboarding
    login/page.tsx
    signup/page.tsx
    onboarding/page.tsx
  (app)/                      # Route group — authenticated shell
    layout.tsx                # Auth guard (redirect to /login), sidebar + bottom nav
    dashboard/page.tsx        # SC: fetches tasks, streak, profile → DashboardClient
    tasks/page.tsx            # SC: fetches tasks with subtasks → TasksClient
    focus/page.tsx            # CC ('use client'): Focus Mode
    analytics/page.tsx        # SC: fetches focus_sessions, streak, achievements
    settings/
      page.tsx
      accessibility/page.tsx
      mood/page.tsx
  api/
    ai/breakdown/route.ts     # POST — Zod validation → Groq → AIBreakdown JSON
    ai/first-step/route.ts
    auth/callback/route.ts    # Supabase OAuth code exchange

components/
  features/
    tasks/                    # TaskCard, TaskForm, TaskEditForm, TaskBreakdownPanel, TasksClient
    focus/                    # BreathingRing, ProgressRing
    mood/                     # MoodSelector
    analytics/                # AnalyticsClient
    overwhelm/                # OverwhelmMode
    dashboard/                # DashboardClient
    auth/                     # AuthForm
    settings/
  shared/                     # AppNav, BottomNav, AppShell, Providers
  ui/                         # shadcn primitives

stores/
  taskStore.ts                # Tasks list, filters, optimistic CRUD + reorder
  moodStore.ts                # currentMood, isOverwhelmMode — persisted (sapling-mood)
  focusStore.ts               # isActive, currentTaskId, timerSeconds, sessionId
  uiStore.ts                  # theme, reducedMotion, highContrast — persisted (sapling-ui)

hooks/
  useMoodTheme.ts             # Reads moodStore → { motionIntensity, spacingScale, colorSaturation, isCalm }
  useReducedMotion.ts         # Combines system prefers-reduced-motion + uiStore.reducedMotion
  useFocusSession.ts          # Creates/ends focus_sessions in Supabase; streak + achievement logic
  useFocusTimer.ts            # 1-second interval tick; reads state via getState() to avoid stale closures
  useKeyboardShortcuts.ts     # Binds Space / Escape in Focus Mode
  useConfetti.ts
  useCountUp.ts

lib/
  supabase/client.ts          # createBrowserClient (client components)
  supabase/server.ts          # createServerClient with cookies() (Server Components / API routes)
  ai/client.ts                # Lazy Groq singleton, generateJSON<T>()
  ai/prompts.ts               # TASK_BREAKDOWN_PROMPT, FIRST_STEP_PROMPT
  utils.ts                    # cn() (clsx + tailwind-merge)
  utils/date.ts               # formatDuration()
  utils/energy.ts             # Energy level helpers

features/                     # Thin wrappers / re-exports (analytics, focus, tasks)
types/                        # task.ts, mood.ts, focus.ts, user.ts
```

---

## Running Locally

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

---

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

- `GROQ_API_KEY` is server-only (no `NEXT_PUBLIC_` prefix) — used only in API routes.
- No Supabase service-role key is used; the anon key + RLS handles everything.

---

## Auth

- Supabase email/password + magic link.
- `(app)/layout.tsx` is an async Server Component that calls `supabase.auth.getUser()` and redirects to `/login` if unauthenticated. This is the only auth gate — no middleware.
- OAuth callback lands at `/api/auth/callback` which exchanges the code for a session cookie.
- `lib/supabase/server.ts` uses `@supabase/ssr` `createServerClient` with `cookies()` — must be awaited because Next.js 15+ `cookies()` is async.

---

## Mood-Adaptive Design System

1. User picks a mood via `MoodSelector` → `useMoodStore.setMood(mood)`.
2. `setMood` writes `data-mood="<mood>"` onto `document.documentElement`.
3. `globals.css` has `[data-mood="overwhelmed"]`, `[data-mood="tired"]`, etc. attribute selectors that override OKLCH CSS custom properties (`--primary`, `--background`, `--muted`).
4. No JavaScript touches individual components — the cascade handles everything.
5. `useMoodTheme()` hook exposes `motionIntensity` / `spacingScale` / `colorSaturation` from `MOOD_CONFIGS` in `types/mood.ts`. Components pass `{}` instead of real Framer Motion variants when motion is `'none'` or `'reduced'`.
6. Mood persists to `localStorage` via Zustand `persist` (key: `sapling-mood`).

| Mood | Motion | Spacing | Saturation |
|---|---|---|---|
| overwhelmed | none | spacious | muted |
| anxious | reduced | spacious | muted |
| tired | reduced | normal | muted |
| focused | full | normal | normal |
| motivated | full | compact | vibrant |

---

## Key Architectural Decisions

- **Server Components for data fetching.** Dashboard, tasks, analytics pages are async SCs that hit Supabase directly and pass data as props to `*Client` components. `export const dynamic = 'force-dynamic'` on pages with user-specific data.
- **Optimistic updates.** All task mutations (complete, delete, reorder) update `taskStore` instantly; Supabase writes happen in the background with rollback on error.
- **Stale closure prevention.** `useFocusTimer` and `useFocusSession` read `timerSeconds` / `sessionId` via `useFocusStore.getState()` at call time, not via hook closure — avoids saving `duration_seconds: 0` after a long session.
- **Breathing ring is pure CSS.** `@keyframes breathe` (19s total, 4-7-8 technique) runs on the compositor thread. `@keyframes breathe-reduced` is a simple opacity fade for reduced-motion.
- **Dark mode flash prevention.** Root `layout.tsx` injects a blocking inline script that reads `localStorage['sapling-ui']` and adds `class="dark"` before first paint.
- **`100dvh` in Focus Mode.** Prevents iOS Safari browser chrome from clipping the layout (`100vh` clips).
- **8px drag activation constraint** in dnd-kit prevents accidental drags on tap.
- **Supabase RLS** enforces `auth.uid() = user_id` on all tables at the Postgres layer.

---

## Supabase Tables

- `tasks` — `parent_id` for subtasks, `ai_breakdown` JSONB, `energy_level` (1–3), `priority` integer, `status` (todo/in_progress/done/archived)
- `focus_sessions` — `started_at`, `ended_at`, `duration_seconds`, `completed`, `mood_at_start`, `task_id`
- `streaks` — `current_streak`, `longest_streak`, `last_active_date`, `total_focus_days`
- `achievements` — `type` enum: first_focus, 60_min_focus, 7_day_streak, 30_day_streak
- `profiles` — `display_name`

The SQL schema is not committed to the repo — rebuild from `types/` or check git history.

---

## Gotchas

- `lib/supabase/server.ts` uses `await cookies()` — breaks outside a request context.
- Tasks query uses `select('*, subtasks:tasks!parent_id(*)')` — Supabase self-join via FK alias. Don't simplify it away.
- Zustand stores have no Provider — they're module singletons. `getState()` is safe in async callbacks.
- `moodStore` `currentMood` is `null` on first load — handle the null case everywhere (hooks default to `'full'` / `'normal'`).
- `uiStore` theme defaults to `'light'`, not `'auto'`. The blocking script only adds the `dark` class — removing it on toggle is the theme system's job.
- Live at: https://sapling-ten.vercel.app
