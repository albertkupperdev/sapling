# StartSmall — ADHD-Friendly Focus App

> A calming productivity workspace for people who struggle with task initiation, focus, and cognitive overload.

**[Live Demo](https://startsmall.vercel.app)** · **[GitHub](https://github.com/albertkupperdev/startsmall)**

---

## Why I built this

Most productivity apps are designed for people who are already organized. They add features, reminders, and dashboards that create more cognitive load — not less.

StartSmall is designed around one insight: **the hardest part of any task is starting**. For people with ADHD, anxiety, or executive dysfunction, staring at a long to-do list is paralyzing. This app reduces the distance between "I need to do something" and "I am doing something."

Every design decision — from the color palette to the AI prompt structure — was made with cognitive load reduction in mind.

---

## Features

### AI Task Breakdown
Paste in any overwhelming task and the app calls the Groq API (Llama 3.3 70B) to break it into 3–6 tiny, immediately actionable steps. The first step is always highlighted so there's no decision paralysis.

### Focus Mode
A fullscreen distraction-free environment with a calming breathing ring animation (based on the 4-7-8 breathing technique), a live timer, and rotating encouragement prompts. Focus sessions are saved to Supabase with duration and completion status.

### Overwhelm Mode
One button that hides everything except the single lowest-energy task. Designed for moments when the full interface feels like too much.

### Mood-Adaptive Design System
Users select their current mood (overwhelmed, anxious, tired, focused, motivated). A `data-mood` attribute on `<html>` shifts the entire CSS custom property system — colors desaturate, spacing increases, and animations slow down for calmer moods.

### Drag-and-Drop Task Reorder
Built with dnd-kit. Tasks reorder instantly in Zustand (optimistic update), then persist to Supabase in the background.

### Analytics
Weekly focus chart showing Mon–Sun with today highlighted. Streak tracking with daily consistency detection.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Server Components reduce JS bundle; RSC-safe Supabase client |
| Language | TypeScript | End-to-end type safety including Supabase query results |
| Styling | Tailwind CSS | Utility-first, co-located with markup |
| Animation | Framer Motion | Declarative spring animations; AnimatePresence for exit transitions |
| State | Zustand | Minimal boilerplate, no Provider needed, `getState()` works in async callbacks |
| Database/Auth | Supabase | Row Level Security enforced at DB layer; no server needed for CRUD |
| AI | Groq (Llama 3.3 70B) | Fastest inference available; `response_format: json_object` for reliable parsing |
| Forms | React Hook Form + Zod | Uncontrolled inputs for performance; Zod schema shared between client and API route |
| Components | shadcn/ui (Base UI) | Accessible primitives, unstyled base, full design control |
| Drag and drop | dnd-kit | Accessible, works with keyboard and pointer sensors |
| Charts | Recharts | Composable, works well with Tailwind color tokens |

---

## Architecture

### Feature-based folder structure
```
components/
  features/
    tasks/        # TaskCard, TaskForm, TaskEditForm, TaskBreakdownPanel
    focus/        # BreathingRing
    mood/         # MoodSelector
    analytics/    # AnalyticsClient
    overwhelm/    # OverwhelmMode
  shared/         # AppNav, BottomNav, Providers
  ui/             # shadcn primitives
```

Grouping by feature rather than file type means all code related to "tasks" lives in one place. At scale, this prevents merge conflicts and makes it easy to remove a feature without hunting across directories.

### Server Components + Client Components split
Pages that fetch data (dashboard, analytics, tasks) are **Server Components** — they run on the server, hit Supabase directly, and ship zero JavaScript for the data-fetching layer. Only interactive parts (task cards, mood selector, focus timer) are marked `'use client'`.

### Optimistic updates
When a user completes, reorders, or deletes a task, the UI updates instantly via Zustand. The Supabase write happens in the background. If it fails, the store rolls back. This is the same pattern used in apps like Linear and Notion.

### Stale closure prevention in Zustand
The `useFocusSession` hook reads `timerSeconds` and `sessionId` via `useFocusStore.getState()` at call time rather than capturing them in a `useCallback` closure. This avoids a class of bug where a 1-second timer tick causes a stale closure to save `duration_seconds: 0`.

### Row Level Security
Every table has RLS policies enforced at the Postgres layer:
```sql
create policy "Users own their tasks" on tasks
  for all using (auth.uid() = user_id);
```
Even if the application layer has a bug, users cannot read or modify each other's data.

---

## Accessibility

This was a first-class concern, not an afterthought — partly because the target users often have sensory sensitivities that standard WCAG requirements don't fully address.

- **Keyboard navigation** — every interactive element is reachable via Tab. Focus Mode has `Space` to pause and `Escape` to exit
- **`prefers-reduced-motion`** — a `useReducedMotion()` hook reads both the system preference and a user-set toggle in Settings. All Framer Motion variants swap to instant/fade when active
- **ARIA** — `role="timer"` on the focus timer, `aria-live="polite"` on encouragement text, `aria-pressed` on mood buttons, `aria-current="page"` on nav items
- **Skip navigation** — `<a href="#main-content">Skip to content</a>` is the first element in the root layout
- **Color contrast** — the soft lavender palette was chosen for calm aesthetics but all foreground/background pairs meet WCAG AA (4.5:1 minimum)
- **Semantic HTML** — task list is `<ul>` / `<li>`, sections have `aria-labelledby`, form fields have associated `<label>` elements

---

## Design System

The color system uses OKLCH for perceptually uniform color manipulation and is defined as CSS custom properties:

```css
:root {
  --primary: oklch(0.55 0.14 280);     /* soft indigo */
  --accent:  oklch(0.72 0.10 150);     /* sage green — completion */
  --background: oklch(0.985 0.004 90); /* warm off-white */
}

/* Mood shifts the entire palette via a single attribute */
[data-mood="overwhelmed"] {
  --primary: oklch(0.62 0.10 280);
  --background: oklch(0.988 0.003 260);
}
```

The breathing ring animation uses CSS `@keyframes` rather than JavaScript — it runs on the compositor thread and won't jank even if the JS main thread is busy:

```css
@keyframes breathe {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  25%  { transform: scale(1.18); opacity: 1; }  /* 4s inhale */
  55%  { transform: scale(1.18); opacity: 1; }  /* 7s hold  */
  90%  { transform: scale(1); opacity: 0.6; }   /* 8s exhale */
}
```

---

## AI Integration

The task breakdown prompt is deliberately ADHD-informed:

```typescript
`You are a compassionate productivity coach helping someone with ADHD
break down overwhelming tasks. Each step should:
- Take no more than 15 minutes
- Start with an action verb
- Be specific and unambiguous
- Feel immediately doable`
```

The API route validates input with Zod before calling Groq, and uses `response_format: { type: 'json_object' }` to guarantee parseable output.

---

## Performance

- **Server Components** for all data-fetching pages — no client-side waterfall
- **`force-dynamic`** on pages with user-specific data to bypass Next.js caching
- **`100dvh`** on Focus Mode — `100vh` clips behind iOS Safari's browser chrome
- **Optimistic UI** — no loading spinners for task mutations
- **8px drag activation constraint** — prevents dnd-kit from firing on accidental micro-movements during tap
- **`useMemo`** on chart data calculations in analytics

---

## Running locally

```bash
git clone https://github.com/albertkupperdev/startsmall
cd startsmall
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

Run the SQL schema in your Supabase SQL editor, then:

```bash
npm run dev
```

---

## What I'd build next

- **Habit tracking** — recurring tasks with streak visualization per habit
- **Shared focus rooms** — real-time accountability via Supabase Realtime
- **Google Calendar sync** — pull in existing commitments as tasks
- **Pomodoro configuration** — custom interval lengths with session history
- **Mobile app** — React Native with shared Zustand stores and Supabase client

---

## Reflections

The most technically interesting challenge was the mood-adaptive design system. Getting a single `data-mood` attribute to cascade cleanly through CSS custom properties — without JavaScript touching every component — required thinking carefully about specificity and inheritance. The solution (attribute selectors scoped to `:root`) is the same approach used by large design systems like Radix Themes.

The most UX-interesting challenge was Overwhelm Mode. The instinct is to show a list of "easy" tasks. But for someone who is genuinely overwhelmed, even a short list is a decision. Surfacing exactly one task — the lowest-energy one — removes all choice, which is the point.
