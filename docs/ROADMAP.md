# Roadmap

Waypoint is built in phases. Each phase should leave the app in a working,
demoable state before the next one starts - no feature should be left half
wired for long.

- [x] **Phase 0 - Scaffold**: Next.js + Supabase project setup, initial
  schema (`profiles`, `trips`, `places`) with RLS, documentation
- [ ] **Phase 1 - Foundation**: auth, world map and US state map with
  click-to-toggle status, private dashboard view. Broken into small steps so
  something is visibly working after each one - see below.
  - [x] **1a - Auth**: email/password sign up, log in, log out; `/dashboard`
    is only reachable when signed in
  - [ ] **1b-i - Static world map**: countries render with distinct,
    purely-decorative colors, no interactivity yet
  - [ ] **1b-ii - Interactivity**: click cycles a country through
    default -> visited -> want-to-visit -> default (in-memory only, not
    saved yet); hover triggers the "pop" scale effect; visited shows a
    checkmark icon, want-to-visit pulses the shape's own stroke
  - [ ] **1b-iii - Persistence**: clicking a country writes/updates a
    `places` row in Supabase; the map loads existing status on page load
  - [ ] **1b-iv - US state map**: repeat 1b-i through 1b-iii for US states
  - [ ] **1b-v - Zoom-to-globe (stretch)**: interpolate between a flat and
    an orthographic D3 projection based on zoom level - see
    [docs/ARCHITECTURE.md](ARCHITECTURE.md#zoom-to-globe-stretch-goal-for-phase-1b).
    Cut from phase 1 without blocking it if it turns out to need more time
    than expected
- [ ] **Phase 2 - Trips and timeline**: group places into trips with dates,
  chronological timeline / calendar-heatmap of travel days
- [ ] **Phase 3 - Extra map layers**: national parks (NPS API) and UNESCO
  World Heritage Sites as additional togglable layers
- [ ] **Phase 4 - Real statistics**: distance from home, population/area
  coverage (REST Countries), language/currency exposure, historical weather
  on visit dates (Open-Meteo)
- [ ] **Phase 5 - Public profiles**: `/u/[slug]` read-only shareable view,
  overlap comparison between two users' visited places
- [ ] **Phase 6 - Achievements**: milestone badges and records (e.g.
  "furthest point from home"), computed from existing data
- [ ] **Phase 7 - Polish**: shareable "travel card" image export for social
  sharing

Each phase's pull request(s) should update this checklist and note anything
that changed from the original plan and why.
