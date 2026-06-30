# Placement Intelligence Apex

AI-powered placement analytics portal built with Next.js 14, Tailwind CSS, and Recharts.

## Quick Start (Mock Mode — zero config)

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and log in with any demo account:

| Role     | Username    | Password   |
|----------|-------------|------------|
| Official | `admin`     | `admin123` |
| Student  | `student1`  | `pass123`  |
| Company  | `tcs_admin` | `tcs123`   |

> **Mock mode** — all data is generated in-memory from `lib/mock-data.ts`. No Supabase or Gemini keys are required.

## Project Structure

```
app/
  (auth)/login/        Login page
  api/auth/            JWT-based auth (mock users)
  api/students/        Student CRUD (mock data)
  api/companies/       Company CRUD (mock data)
  api/drives/          Drive CRUD (mock data)
  api/analytics/       KPIs + charts (derived from mock data)
  api/ai/chat/         AI analyst (mock or real Gemini)
  dashboard/           All dashboard pages
lib/
  mock-data.ts         ← All mock data lives here
  auth.ts              JWT helpers (jose)
  utils.ts             cn, fmt, pct helpers
components/
  ui/                  StatCard, Card, Badge, etc.
  charts/              Recharts wrappers
  layout/Sidebar.tsx   App sidebar
```

## Connecting Real Data

### Supabase
1. Create a project at https://supabase.com
2. Run the SQL in `supabase/migrations/001_initial_schema.sql`
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```
4. Replace mock calls in each `app/api/*/route.ts` with `supabaseAdmin` queries

### Gemini AI
Add `GEMINI_API_KEY=AIza...` to `.env.local` — the AI analyst will use real Gemini responses automatically.
