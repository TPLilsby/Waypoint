# Waypoint

A travel tracker for marking the countries, US states, national parks, and
UNESCO World Heritage Sites you've visited (or want to) - with real
statistics, trip grouping, and a shareable public profile.

## Why this project exists

I'm a datatekniker (IT/network technician) apprentice heading to San
Francisco in 2027 on an international exchange, and this project is part of
my portfolio for that application. I already have an AI-heavy project (a
RAG-based helpdesk platform), so Waypoint is a deliberate counterweight: no
AI dependency anywhere in the stack. Every feature here is built on plain
data modeling, UI/UX work, real third-party APIs, and backend architecture
(auth, row-level security, relational schema design) - the fundamentals a
Solutions Engineer or Developer Relations role expects you to actually
understand, not just orchestrate through a model.

The subject matter is personal too: the map doubles as a planning tool for
my own upcoming move and the US road trips I want to take once I'm there.

## Features

See [docs/ROADMAP.md](docs/ROADMAP.md) for the full phased plan. At a
glance, Waypoint tracks:

- Countries and US states, marked visited / want-to-visit on an interactive
  map
- National parks and UNESCO World Heritage Sites as additional map layers
- Trips that group places together with dates and notes
- Real statistics (population/area coverage, distance from home, language
  and currency exposure, historical weather on visit dates)
- Public, shareable profile pages
- Achievements derived from your data, not stored separately

## Tech stack

- **Next.js 16** (App Router, TypeScript, Server Components)
- **Supabase** - Postgres, Auth, Storage, Row Level Security
- **Tailwind CSS**
- **Leaflet** with open TopoJSON boundary data (no map-provider API key or
  usage quota to manage)
- Public data APIs: [REST Countries](https://restcountries.com), the
  [NPS API](https://www.nps.gov/subjects/developer/api-documentation.htm),
  [Open-Meteo](https://open-meteo.com), and a static UNESCO sites dataset

Every part of the stack runs on a free tier - see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#hosting-and-free-tier-notes) for
the specific limits and trade-offs that come with that choice.

## Getting started

### Prerequisites

- Node.js 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (run via `npx
  supabase`, no global install needed)
- Docker, if you want to run Supabase locally (optional - you can also point
  at a free hosted Supabase project instead)

### Setup

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# from your Supabase project settings, or from `npx supabase start` output
# if running locally.
```

Apply the database schema:

```bash
npx supabase db push
```

Run the app:

```bash
npm run dev
```

## Project structure

```
src/
  app/                 Next.js App Router routes
  lib/supabase/        Browser, server, and middleware Supabase clients
  types/database.ts    Hand-written types mirroring the Supabase schema
supabase/
  migrations/          SQL schema migrations (source of truth for the data model)
docs/
  ARCHITECTURE.md      Design decisions and the reasoning behind them
  ROADMAP.md           Phased build plan
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - data model, auth flow, and
  the "why" behind the technical choices
- [docs/ROADMAP.md](docs/ROADMAP.md) - phased build plan, in progress
