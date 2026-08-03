# Architecture

This document explains the *why* behind Waypoint's technical decisions, not
just the *what*. The code shows the what; interviews and applications tend
to ask for the why.

## Data model

Three tables carry the whole app: `profiles`, `trips`, and `places`. The
full schema lives in
[`supabase/migrations/20260803215332_initial_schema.sql`](../supabase/migrations/20260803215332_initial_schema.sql).

### One `places` table, not one per entity type

Countries, US states, national parks, and UNESCO sites are all rows in a
single `places` table, distinguished by a `type` enum. The alternative -
separate `countries`, `us_states`, `national_parks` tables - would mean every
map component, every stats query, and every "mark as visited" action needs
type-specific branches. A shared shape (`type`, `ref_code`, `status`,
`visited_date`, ...) keeps the UI and query layer generic: the map renders
a layer by filtering on `type`, and the stats dashboard aggregates across
all of them the same way.

The trade-off is that `places` carries some columns that only make sense
for a subset of types (e.g. `lat`/`lng` matter for point-like park/site
markers more than for a country polygon). That's an acceptable cost for not
duplicating the CRUD and RLS logic four times over.

### Trips as an optional grouping, not a required one

A `place` can exist with `trip_id = null`. Trips are additive structure for
the timeline/journal view, not a mandatory container - so marking a single
country as visited doesn't force you to first create a trip for it.

### Achievements are derived, not stored

There is no `achievements` table. Badges ("5 continents", "10 national
parks") are computed at query time from `places` and `trips`. Storing them
separately would create a second source of truth that has to be kept in
sync - miss one update path and a badge silently goes stale. Computing them
on read costs a bit more at query time, which is a fine trade for a
personal-scale dataset.

## Auth and Row Level Security

Waypoint uses Supabase Auth with three client entry points, following the
`@supabase/ssr` pattern for Next.js App Router:

- `src/lib/supabase/client.ts` - browser client, used in Client Components
- `src/lib/supabase/server.ts` - server client, used in Server Components,
  Server Actions, and Route Handlers
- `src/lib/supabase/middleware.ts` - refreshes the session cookie on every
  request via `src/middleware.ts`, so a Server Component never sees a stale
  or expired session

Data access control is enforced at the database level with Row Level
Security, not just in application code. Each table has two permissive
policies that Postgres combines with OR:

1. An owner policy: full read/write on rows where `auth.uid() = user_id`
2. A public-read policy: read-only access to rows whose owning profile has
   `is_public = true`

This means the public share feature (`/u/[slug]`) doesn't need any special
"is this profile public" check in application code - an anonymous Supabase
client querying `places` simply can't see private rows, because the
database itself won't return them regardless of what the API route does or
forgets to do.

A `handle_new_user` trigger on `auth.users` auto-creates a matching
`profiles` row on signup, so the app never has to handle a signed-in user
without a profile.

## Map rendering

Leaflet with open TopoJSON boundary data, rather than a hosted map provider
(Mapbox, Google Maps). Reasoning:

- No API key or usage-based billing to manage for something that's
  fundamentally static polygon data
- The map doesn't need street-level detail, satellite imagery, or routing -
  just country/state boundaries and point markers, which open boundary
  datasets cover fully
- Keeps the entire stack inside free, unmetered tiers (see below)

## Third-party data sources

| Source | Used for | Why this one |
|---|---|---|
| REST Countries | Population, area, languages, currencies | Free, no key, no rate limit concerns for this scale |
| NPS API | The 63 US national parks | Official, free, real API integration (not static data) |
| UNESCO World Heritage List | Site names, locations | Changes rarely - imported once as static seed data instead of hit on every request |
| Open-Meteo | Historical weather for visit dates | Free, no key, has historical data going back decades |

## Hosting and free-tier notes

Every piece of this stack fits a free tier, deliberately:

- **Vercel Hobby plan** - fine for a personal/portfolio project's traffic
- **Supabase free tier** - 500MB Postgres, Auth, and 1GB Storage are enough
  for a single-user-scale dataset with a modest number of trip photos
- **Known limitation:** Supabase free projects pause after about a week of
  inactivity. A cold demo link takes a few seconds to wake back up on first
  request - a conscious trade-off for zero hosting cost, not a bug
- Photo uploads should be compressed client-side before hitting Storage, to
  keep well within the 1GB budget as the photo/journal feature grows
