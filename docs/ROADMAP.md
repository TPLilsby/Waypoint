# Roadmap

Waypoint is built in phases. Each phase should leave the app in a working,
demoable state before the next one starts - no feature should be left half
wired for long.

- [x] **Phase 0 - Scaffold**: Next.js + Supabase project setup, initial
  schema (`profiles`, `trips`, `places`) with RLS, documentation
- [ ] **Phase 1 - Foundation**: auth (sign up / log in / log out), world map
  and US state map with click-to-toggle status, private dashboard view
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
