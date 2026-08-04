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
  request via `src/proxy.ts` (Next.js renamed the `middleware` file
  convention to `proxy` in v16), so a Server Component never sees a stale
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

`react-simple-maps` (D3 + SVG) with open TopoJSON boundary data
(`world-atlas`, `us-atlas`), rather than a hosted tile provider (Mapbox,
Google Maps) or a WebGL 3D globe. Reasoning:

- No API key or usage-based billing to manage for something that's
  fundamentally static polygon data
- The map doesn't need street-level detail, satellite imagery, or routing -
  just country/state boundaries and point markers, which open boundary
  datasets cover fully
- It's plain SVG, so hover/click effects are ordinary CSS transitions on
  `<path>` elements - no separate rendering pipeline to keep in sync
- Keeps the entire stack inside free, unmetered tiers (see below)

A 3D WebGL globe (e.g. `react-globe.gl`) was considered and rejected for
now: it looks great rotating, but it doesn't naturally "flatten" into a
readable flat map when you zoom in - that would mean running two separate
renderers and syncing state between them. `react-simple-maps` lets us get
a globe-like zoomed-out view with a plain 2D technique instead (see below),
which is a smaller, single-renderer problem.

### Base coloring and status indicators

Each country/state gets a distinct color purely for visual variety - the
color carries no meaning and is unrelated to visited/want-to-visit status.
Status is layered on top of the same `<path>`, not encoded in fill color:

- **Visited**: a small icon (e.g. a checkmark) rendered on the shape
- **Want to visit**: the shape's own stroke (its border) pulses in opacity/
  width - there's no separate "ring" element, since a country is already
  just an SVG path with a fill and a stroke
- **Hover**: a quick scale-up transform on the path (the "pop"), eased with
  a slight overshoot so it feels springy rather than mechanical

Known edge case to handle when we build this: very small countries
(Monaco, Vatican City, Luxembourg) may render the pulsing stroke as
imperceptible at world-map zoom. A minimum stroke width, or a subtle
`feGaussianBlur` glow around the path, are both reasonable fixes -
deferred until we're actually looking at the rendered map, not decided
up front.

### Zoom-to-globe (stretch goal for phase 1b)

The "flattens out zoomed in, looks like a globe zoomed out" effect is a
known D3 technique: interpolate the map's projection between a flat
projection (e.g. `geoEqualEarth`) and `geoOrthographic` (a true globe
projection, still rendered as flat SVG/Canvas - no WebGL) based on zoom
level. This is more involved than the base map, so it's staged as its own
step (1b-iv) rather than a blocker for getting the map on screen at all.

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
