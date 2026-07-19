# HMS Portal — Frontend

Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui-style
components frontend for the Hospital Management System backend.

## Stack

- Next.js 16, App Router, TypeScript, Turbopack
- Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config`)
- Hand-built shadcn/ui-style primitives in `components/ui/` (the `shadcn`
  CLI needs `ui.shadcn.com`, which wasn't reachable in this build
  environment — components were written by hand against the same
  Radix + Tailwind pattern; they're drop-in compatible with the real CLI
  going forward, e.g. `npx shadcn@latest add <component>` will just
  overwrite them with the canonical version if you want to re-sync)
- TanStack Query for all server state
- react-hook-form + zod for every form
- Zustand for auth/session client state
- sonner for toasts

## Setup

```bash
npm install
cp .env.example .env.local   # already done; edit NEXT_PUBLIC_API_BASE_URL if your backend isn't on localhost:8080
npm run dev
```

The app expects the Spring Boot HMS backend (see the sibling `hms-backend`
project) running and reachable at `NEXT_PUBLIC_API_BASE_URL`. Run the
backend's `schema.sql` against your Supabase/Postgres instance first so
there's seed data (patients, doctors, appointments, etc.) to log in against
and browse — see the backend's own README for seeded usernames (passwords
in the seed data are placeholder hashes, so you'll need to either create a
fresh user via `POST /api/v1/users` with a real password, or update a seed
row's `password_hash` to a real BCrypt hash before you can log in).

## What's built vs. stubbed

See [`FRONTEND_TODO.md`](./FRONTEND_TODO.md) for the full breakdown. In
short: Auth, the app shell, the role-based Dashboard, and the Patients,
Appointments, Doctors, Laboratory, Pharmacy, and Billing modules are wired
to real data end-to-end. Staff, Reports, and Admin Settings are still
"Coming Soon" pages with their API client modules already written in
`lib/api/`.

## Project structure

```
app/
  login/page.tsx
  forgot-password/page.tsx
  api/session/route.ts          # sets/clears the session cookie
  (dashboard)/layout.tsx         # sidebar + navbar + SessionGuard, auth-gated
  (dashboard)/dashboard/page.tsx
  (dashboard)/patients/page.tsx
  (dashboard)/patients/[id]/page.tsx
  (dashboard)/appointments/page.tsx
  (dashboard)/{doctors,laboratory,pharmacy,billing,staff,reports,admin}/page.tsx  # stubs
components/
  ui/                            # hand-built shadcn-style primitives
  shared/                        # Sidebar, Navbar, SessionGuard, StatusBadge, GlobalSearch, ...
  dashboard/                     # MetricCard, ConsultationsQueue, RecentPrescriptions
  patients/                      # PatientFormSheet + detail tabs
  appointments/                  # DoctorCombobox, PatientCombobox, DayGrid, booking/detail dialogs
lib/
  api-client.ts                  # fetch wrapper, ApiError parsing
  api/                           # one module per backend resource
  hooks/                         # TanStack Query hooks, auth store, idle timer
  types/api.ts                  # TypeScript interfaces mirroring backend DTOs
  constants.ts, nav-items.ts, utils.ts, error-utils.ts
proxy.ts                         # route-protection (Next.js 16's middleware convention)
```

## Notes

- `middleware.ts` was renamed to `proxy.ts` per Next.js 16's new convention
  (same API, `export function proxy(...)`).
- The session token cookie is intentionally **not** httpOnly — see the
  comment in `app/api/session/route.ts` and the corresponding note in
  `FRONTEND_TODO.md` for why, and what to change if you add a backend proxy
  layer later.
