# Roadmap

Waypoint is built in phases. Each phase should leave the app in a working,
demoable state before the next one starts - no feature should be left half
wired for long.

- [x] **Phase 0 - Scaffold**: Next.js + Supabase project setup, initial
  schema (`profiles`, `trips`, `places`) with RLS, documentation
- [x] **Phase 1 - Foundation**: auth, world map and US state map with
  click-to-toggle status, private dashboard view. Broken into small steps so
  something is visibly working after each one - see below.
  - [x] **1a - Auth**: email/password sign up, log in, log out; `/dashboard`
    is only reachable when signed in
  - [x] **1b-i - Static world map**: countries render with distinct,
    purely-decorative colors, no interactivity yet. Also produced a
    reusable `src/lib/worldTopology.ts` and a `SpinningGlobe` component
    (same data, `geoOrthographic` projection) used as decoration on the
    login/signup pages - see
    [docs/ARCHITECTURE.md](ARCHITECTURE.md#zoom-to-globe-stretch-goal-for-phase-1b)
  - [x] **1b-ii - Interactivity**: click cycles a country through
    default -> visited -> want-to-visit -> default; hover triggers the
    "pop" scale effect; visited shows a checkmark icon, want-to-visit
    pulses the shape's own stroke
  - [x] **1b-iii - Persistence**: clicking a country writes/updates a
    `places` row in Supabase; the map loads existing status on page load
  - [x] **1b-iv - US state map**: repeat 1b-i through 1b-iii for US states.
    Interaction/persistence logic was extracted into a shared `PlaceMap`
    component so `WorldMap` and `USMap` are thin wrappers around the same
    behavior - see
    [docs/ARCHITECTURE.md](ARCHITECTURE.md#one-placemap-two-thin-wrappers).
    The dashboard shows both maps behind a World/United States tab switch
    rather than stacked or side-by-side, per a UX call - both maps stay
    mounted while hidden so switching tabs doesn't lose either one's
    in-memory status
  - [x] **1b-v - Globe view (scoped down from the original stretch
    goal)**: a "View as globe" toggle crossfades between the flat world
    map and a `geoOrthographic` globe, draggable to rotate (pointer
    events, with a drag-vs-click threshold so rotating doesn't trigger a
    country's status toggle). Both views share one live status map via
    `usePlaceStatuses`
  - [ ] **Future - continuous zoom-to-globe morph**: the original idea -
    interpolating the projection itself based on zoom level, so the map
    flattens/curves continuously instead of a discrete toggle - see
    [docs/ARCHITECTURE.md](ARCHITECTURE.md#zoom-to-globe-stretch-goal-for-phase-1b)
    for why it was scoped down (point-level projection interpolation plus
    orthographic's hemisphere clipping is a meaningfully harder problem).
    Revisit only if there's a specific reason to invest in it - the
    toggle already delivers the promised feel
- [x] **Phase 2 - Trips and timeline**: group places into trips with dates,
  chronological timeline / calendar-heatmap of travel days
  - [x] **2a - Trip CRUD**: `/dashboard/trips` page - create/edit/delete
    trips (title, start/end date, note) via Server Actions, separate from
    the map entirely
  - [x] **2b - Assign places to a trip**: a "Marking places for" trip
    selector above the map; marking a place visited while a trip is
    active sets that place's `trip_id` (cleared again if it cycles past
    visited to want-to-visit, since that's no longer an actual visit)
  - [x] **2c - Chronological trip list**: trips shown oldest-first with a
    count of places in each, which doubles as a correctness check on 2b -
    the count is only right if trip assignment actually worked
  - [x] **2d - Calendar heatmap**: a GitHub-contributions-style grid of
    the last 12 months on `/dashboard/trips`, binary per day (traveling
    or not) rather than weighted by place count - see
    [docs/ARCHITECTURE.md](ARCHITECTURE.md#travel-day-heatmap-is-binary-not-weighted)
    for why finer-grained shading would be fabricated precision
- [x] **Phase 3 - Extra map layers**: national parks (NPS API) and UNESCO
  World Heritage Sites as additional togglable layers
  - [x] **3a - Point-marker rendering**: `PlaceMap` gained an optional
    `pointRadius` prop so it can render point features (parks, sites) as
    circles, reusing the same click/hover/persistence behavior as
    polygon layers - see
    [docs/ARCHITECTURE.md](ARCHITECTURE.md#national-parks-and-unesco-sites-are-point-layers-not-new-maps)
  - [x] **3b - National parks**: live NPS API overlay on `USMap`, cached
    for a day; requires an `NPS_API_KEY` in `.env.local`
  - [x] **3c - UNESCO sites**: overlay on `WorldMap`, backed by a
    committed static dataset (`src/data/unescoSites.json`) generated from
    a Wikidata SPARQL query - the full ~1,247-site list rather than the
    originally planned hand-curated subset, since an accurate structured
    source turned out to exist
- [ ] **Phase 4 - Real statistics**: distance from home, population/area
  coverage (REST Countries), language/currency exposure, historical weather
  on visit dates (Open-Meteo). This is also when the dashboard should move
  from a full-width map (as built in 1b-i) to the asymmetric 2:1 map/sidebar
  layout from [docs/DESIGN.md](DESIGN.md#layout-and-composition) - deferred
  until there's real sidebar content instead of an empty placeholder column
- [ ] **Phase 5 - Public profiles**: `/u/[slug]` read-only shareable view,
  overlap comparison between two users' visited places
- [ ] **Phase 6 - Achievements**: milestone badges and records (e.g.
  "furthest point from home"), computed from existing data
- [ ] **Phase 7 - Polish**: shareable "travel card" image export for social
  sharing

Each phase's pull request(s) should update this checklist and note anything
that changed from the original plan and why.
