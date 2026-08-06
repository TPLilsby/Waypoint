# Waypoint

A travel tracker for marking the countries, US states, national parks, and
UNESCO World Heritage Sites you've visited (or want to) - with real
statistics, trip grouping, and a shareable public profile.

## About this project

I'm a Danish EUX student specializing in software development, currently
apprenticing at [Veng ApS](https://veng.dk). Waypoint is part of my
portfolio for an international exchange application to San Francisco, and
it's a deliberate counterweight to another project of mine that's
AI-heavy (a RAG-based helpdesk platform). Nothing here depends on AI:
every feature is built on plain data modeling, UI/UX work, real
third-party APIs, and backend architecture (auth, row-level security,
relational schema design) - the fundamentals a Solutions Engineer or
Developer Relations role expects you to actually understand, not just
orchestrate through a model.

The subject matter is personal too: the map doubles as a planning tool for
my own upcoming move and the US road trips I want to take once I'm there.

## Status

Waypoint is under active development, built in small phases so there's
always a working version rather than a long stretch of half-built
features. Current state:

| Phase | Status |
|---|---|
| 0 - Project scaffold (Next.js, Supabase schema, RLS) | Done |
| 1a - Auth (sign up, log in, log out, protected dashboard) | Done |
| 1b - Interactive world map (countries, US states, persistence) | In progress |
| 2-7 - Trips/timeline, extra map layers, statistics, public profiles, achievements | Planned |

The full breakdown, including what's deliberately deferred and why, is in
[docs/ROADMAP.md](docs/ROADMAP.md).

## Features

**Working today:**
- Email/password authentication with Supabase Auth
- A protected dashboard, only reachable when signed in
- A world map rendering every country with a distinct decorative color

**Planned, in build order:**
- Click a country or US state to mark it visited or want-to-visit, saved
  to your account
- National parks and UNESCO World Heritage Sites as additional map layers
- Trips that group places together with dates and notes
- Real statistics: population/area coverage, distance from home, language
  and currency exposure, historical weather on visit dates
- Public, shareable profile pages
- Achievements computed from your data, not stored separately

## Tech stack

- **Next.js 16** (App Router, TypeScript, Server Components, Server
  Actions)
- **Supabase** - Postgres, Auth, Row Level Security, Storage
- **Tailwind CSS 4**
- **d3-geo** and **topojson-client** for the map, rendered as plain SVG
  (no map-provider API key, no WebGL) - see
  [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#map-rendering) for why this
  was chosen over `react-simple-maps` and hosted tile providers
- Planned integrations: [REST Countries](https://restcountries.com), the
  [NPS API](https://www.nps.gov/subjects/developer/api-documentation.htm),
  and [Open-Meteo](https://open-meteo.com)

Every part of the stack runs on a free tier - see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#hosting-and-free-tier-notes)
for the specific limits and trade-offs that come with that choice.

## Screenshots

_Coming soon, once the interactive map (phase 1b) is finished._

<!--
Add screenshots here as the app takes shape, e.g.:

![Dashboard with world map](docs/screenshots/dashboard.png)

Keep images under docs/screenshots/ and reference them with relative paths
so they render on GitHub.
-->

## Getting started

### Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) project

### Setup

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
# from your Supabase project's Settings -> API page
```

Apply the database schema by running the SQL in
`supabase/migrations/20260803215332_initial_schema.sql` through the
Supabase SQL Editor, then start the app:

```bash
npm run dev
```

## Project structure

```
src/
  app/                 Next.js App Router routes (login, signup, dashboard)
  components/          Shared UI, e.g. the world map
  lib/supabase/        Browser, server, and proxy Supabase clients
  types/database.ts    Hand-written types mirroring the Supabase schema
supabase/
  migrations/          SQL schema migrations (source of truth for the data model)
docs/
  ARCHITECTURE.md      Design decisions and the reasoning behind them
  DESIGN.md            Visual direction and the checklist for avoiding a templated look
  ROADMAP.md           Phased build plan
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - data model, auth flow, and
  the "why" behind the technical choices
- [docs/DESIGN.md](docs/DESIGN.md) - visual direction, color/type choices,
  and the checklist for avoiding a templated, AI-generated look
- [docs/ROADMAP.md](docs/ROADMAP.md) - phased build plan, in progress

## About the developer

I'm a Danish EUX student specializing in software development, currently
an apprentice at Veng ApS. I'm building Waypoint alongside my daily work
as part of a portfolio for an international exchange to San Francisco -
it's meant to show independent product thinking, real API and database
work, and design judgment, without leaning on AI to produce any of it.
