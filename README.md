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
| 1 - Auth, interactive world/US maps, globe view | Done |
| 2 - Trips, trip-to-place linking, travel-day heatmap | Done |
| 3 - National park and UNESCO site map layers | Done |
| 4-7 - Statistics, public profiles, achievements, polish | Planned |

The full breakdown, including what's deliberately deferred and why, is in
[docs/ROADMAP.md](docs/ROADMAP.md).

## Features

**Working today:**
- Email/password authentication with Supabase Auth, protected dashboard
- Interactive world map and US state map - click to cycle
  visited/want-to-visit, hover to see a "pop" effect, all saved to your
  account
- A draggable globe view of the world map (`geoOrthographic`, no WebGL)
- National parks (live NPS API) and UNESCO World Heritage Sites (~1,247
  sites, sourced from Wikidata) as togglable overlay layers
- Trips: create/edit/delete, link places to a trip while marking them,
  and a GitHub-style calendar heatmap of travel days

**Planned, in build order:**
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
- **[NPS API](https://www.nps.gov/subjects/developer/api-documentation.htm)**
  for national parks; **Wikidata (SPARQL)** for UNESCO World Heritage
  Site data, committed as static seed data
- Planned integrations: [REST Countries](https://restcountries.com) and
  [Open-Meteo](https://open-meteo.com), for phase 4's statistics

Every part of the stack runs on a free tier - see
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#hosting-and-free-tier-notes)
for the specific limits and trade-offs that come with that choice.

## Screenshots

_Coming soon._

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
# from your Supabase project's Settings -> API page, and NPS_API_KEY
# from https://www.nps.gov/subjects/developer/get-started.htm (free)
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
  app/                 Next.js App Router routes (login, signup, dashboard, trips)
  components/          Map, trip, and layout UI (PlaceMap, WorldMap, USMap, ...)
  lib/supabase/        Browser, server, and proxy Supabase clients
  lib/                 Map data loaders (world/US/UNESCO topology, NPS API)
  data/                Committed static datasets (UNESCO sites)
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
