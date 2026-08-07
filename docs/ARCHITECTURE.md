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

### Sign up, log in, log out

Each lives in its own `actions.ts` next to its page (`src/app/login/`,
`src/app/signup/`, `src/app/dashboard/`) as a Server Function, invoked from
a form via React's `useActionState` so the page can show a pending state
and inline error text without a separate client-side fetch/API route.

Email confirmation is left on (Supabase's default) rather than disabled for
convenience: it's a real, production-shaped flow to show, and it costs
nothing to keep on since Supabase sends the confirmation email itself.
The trade-off is explicit - `signup`'s Server Function returns a "check
your inbox" state instead of redirecting to `/dashboard`, since the user
isn't actually signed in until they click the email link.

Route protection lives in `src/app/dashboard/layout.tsx`, which calls
`getUser()` and redirects to `/login` if there's no session - not in
`src/proxy.ts`, which stays focused on the one job of refreshing the
session cookie. Keeping those concerns separate means a bug in route
matching can't accidentally also break session refresh for the whole app.

## Map rendering

`d3-geo` and `topojson-client` directly, with a small hand-written React
component (`src/components/WorldMap.tsx`) rather than a wrapper library
like `react-simple-maps`, and rather than a hosted tile provider (Mapbox,
Google Maps) or a WebGL 3D globe. Reasoning:

- No API key or usage-based billing to manage for something that's
  fundamentally static polygon data
- The map doesn't need street-level detail, satellite imagery, or routing -
  just country/state boundaries and point markers, which open boundary
  datasets cover fully
- It's plain SVG, so hover/click effects are ordinary CSS transitions on
  `<path>` elements - no separate rendering pipeline to keep in sync
- Keeps the entire stack inside free, unmetered tiers (see below)

`react-simple-maps` was tried first, but its latest release (including the
4.0 beta) still declares a peer dependency on React 16-18, not React 19.
Rather than force-install a mismatched peer dependency, we went straight
to `d3-geo` - which is what `react-simple-maps` wraps internally anyway,
has no React dependency at all, and gives direct control over the
projection object, which the zoom-to-globe stretch goal (below) needs
regardless.

A 3D WebGL globe (e.g. `react-globe.gl`) was considered and rejected for
now: it looks great rotating, but it doesn't naturally "flatten" into a
readable flat map when you zoom in - that would mean running two separate
renderers and syncing state between them. A `d3-geo` projection lets us get
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

### Persisting map interactions

Clicking a country writes straight to Supabase from the browser client
(`src/lib/supabase/client.ts`), not through a Server Action like the auth
flows do. Row Level Security already enforces `auth.uid() = user_id`
regardless of which client makes the call, so routing writes through the
Next.js server first wouldn't add any security - it would only add a
network hop, which matters here because a country click needs to feel
instant even if you click several in quick succession.

The write is a `upsert` keyed on `(user_id, type, ref_code)`, added as a
unique constraint in
[`20260807172719_places_unique_ref_code.sql`](../supabase/migrations/20260807172719_places_unique_ref_code.sql).
Without it, clicking the same country through visited -> want-to-visit
could insert a second row instead of updating the first one. Cycling back
to no status deletes the row rather than storing an empty/null state -
"no row" already means "no status," so there's nothing to distinguish.

`ref_code` for countries is the numeric ISO-3166-1 id straight from the
`world-atlas` topology's own `id` field (e.g. `"242"` for Fiji) - not the
alpha-2 code you'd see in most APIs. No lookup table needed, since it's
already what the map data provides; REST Countries (phase 4) supports
numeric-code lookups just as well as alpha-2.

The map's initial state is fetched server-side in
`src/app/dashboard/page.tsx` (already a Server Component) and passed to
`WorldMap` as a prop, rather than fetched client-side in a `useEffect`
after mount. That avoids a flash where the map briefly renders with no
saved statuses before a follow-up request fills them in.

The write itself has no retry queue - if it fails (a dropped connection,
for instance), the local UI has already updated but the database hasn't,
and the mismatch isn't reconciled until the next successful write to that
country. That's a deliberate simplification for a personal-scale app, not
an oversight; worth revisiting if Waypoint ever needs to handle flaky
connections gracefully (e.g. a proper offline queue).

### One PlaceMap, two thin wrappers

`WorldMap` and `USMap` are both just a fitted projection and a
`FeatureCollection` handed to a shared `src/components/PlaceMap.tsx`,
which owns the actual click-to-cycle, hover, checkmark, and Supabase
read/write logic. Countries and US states need the *same* interaction
behavior with *different* data and projections - splitting those two
concerns keeps the interactive logic in one place instead of forked
across two near-identical components.

US states use `geoAlbersUsa()` - the standard projection for a compact
continental-US view with Alaska and Hawaii repositioned as insets -
applied to `us-atlas`'s plain `states-10m.json` (real lon/lat), not its
pre-baked `states-albers-10m.json`. The pre-baked file has already moved
Alaska/Hawaii to their inset positions, which would make `geoCentroid()`
(used to compute the `lat`/`lng` stored in `places`) return meaningless
coordinates instead of each state's real geographic centroid.

### Tabs, not stacked or side-by-side

The dashboard shows the world map and US state map behind a World/United
States tab switch (`src/components/DashboardMaps.tsx`). Both maps stay
mounted at all times - the inactive one is hidden with a CSS class, not
removed from the tree. `PlaceMap` keeps each map's saved statuses in
local component state, seeded once from the `initialStatuses` prop; if
switching tabs unmounted the inactive map, it would remount later with
that same stale prop and appear to have "lost" any change made before the
switch, even though the write had already succeeded in Supabase. Keeping
both mounted avoids that mismatch entirely, at the cost of rendering both
maps' SVG paths even when one is hidden - a fine trade at this scale
(a few hundred paths per map).

### Zoom-to-globe (stretch goal for phase 1b)

The original idea - continuously flattening into a globe as you zoom out
- is a known D3 technique: interpolate the map's projection between a
flat projection and `geoOrthographic` at the point level, based on zoom.
It was scoped down for 1b-v: `geoOrthographic` clips away the far
hemisphere, so a naive linear interpolation between two projections'
point outputs can produce visible artifacts right at the clipping
boundary rather than a clean continuous morph. That's a meaningfully
harder problem than the rest of the map work, so it's left as a
possible future improvement rather than blocking phase 1 - see
[docs/ROADMAP.md](ROADMAP.md) for the current status.

What shipped instead: a "View as globe" toggle
(`src/components/WorldMap.tsx`) that crossfades between the flat map and
a draggable `geoOrthographic` globe - both rendered by the same
`PlaceMap`, sharing one `usePlaceStatuses` state, so neither view ever
shows stale data. Dragging rotates the globe by updating its `rotate()`
parameters directly from pointer movement; since a click and a drag both
start with the same pointer-down event on a country shape, the component
tracks whether the pointer moved past a small threshold and, if so,
suppresses that gesture's status toggle - otherwise every rotate would
also flip the country you started dragging from.

A second, simpler use of `geoOrthographic` already exists:
`src/components/SpinningGlobe.tsx` renders the same country data through
that projection with a slow constant auto-rotation (no drag, no click
handling), used as decoration on the login/signup pages.

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
