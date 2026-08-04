# Design principles

Waypoint's code avoids an AI dependency on purpose (see the README). The
visual design has to hold up the same claim: it shouldn't look like it came
out of an AI website generator either. This document is the concrete rule
set for that, written down so it survives past any one conversation.

## Direction: modern editorial, dark-first

Warm, asymmetric, content-first - closer to a travel journal's layout
discipline than a SaaS marketing site. One bold accent color, used
sparingly, not a palette of five competing brand colors.

### Color

Dark is the default and primary target. Values are a starting point, not
final - adjust once real content is on screen, but keep the roles fixed:

| Role | Value | Use |
|---|---|---|
| Background | `#12161C` | Page background - near-black with a cool, ink-like tint, not neutral gray |
| Surface | `#1A2029` | Cards, panels, raised content |
| Border | `#2A313C` | Hairline dividers and card borders |
| Text primary | `#ECE7DE` | Body text - warm off-white, not pure white |
| Text secondary | `#9C978C` | Supporting text, captions |
| Accent (primary) | `#E07A4E` | Terracotta/rust - the one bold color. Links, primary actions, the "visited" stamp |
| Accent (secondary) | `#5B7A99` | Muted slate blue - used sparingly, e.g. the "want to visit" indicator, kept distinct from the primary accent so the two statuses never compete for the same color |

Rules:

- **One bold accent, not several.** The primary accent (terracotta) is for
  the single most important action or state on a screen. The secondary
  accent (slate) exists so status colors don't have to reuse the primary
  accent for something unrelated - it does not become a second "brand
  color" to sprinkle around.
- **Country base colors are decorative, not semantic** (see
  [ARCHITECTURE.md](ARCHITECTURE.md#base-coloring-and-status-indicators)).
  Generate a set of ~12-16 harmonious hues at a fixed saturation/lightness
  suited to the dark background, assign them deterministically per country
  (e.g. hash the country code), so the map looks varied but never clashes
  and never has to be hand-picked per country.
- Light mode isn't required for phase 1, but don't hardcode dark-only
  values in a way that blocks adding it later - use CSS custom properties,
  not literal hex, in actual component code.

### Typography

- **Headings**: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk),
  weight 500. Distinct enough to carry personality without tipping into
  "quirky display font."
- **Body**: [IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans).
  Deliberately not Inter/Geist - those are the two fonts every AI-generated
  site defaults to, and using them anywhere undercuts the whole point of
  this document.
- **Data and coordinates**: [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)
  for anything numeric or technical - stats, lat/lng, dates. Plex Sans and
  Plex Mono share a designer and structure, so they pair without looking
  like two unrelated fonts glued together.

### Layout and composition

- **The map is the hero, not a card in a grid.** Its container gets more
  screen space than any other element on the dashboard - roughly 2:1
  against a stats/status sidebar, not an even split.
- **Asymmetry over symmetry.** Don't default every section to a centered
  column with equal-width children. Vary block sizes intentionally.
- **Not every piece of content needs a card.** A card means "this is a
  bounded, separate object" (a trip, a stat). A card wrapped around a
  single line of text or a lone heading is decoration, not structure.
- **No SaaS marketing tropes.** Waypoint is a personal tool, not a product
  being pitched to strangers - no hero-plus-two-CTA-buttons pattern, no
  logo cloud, no testimonials, no pricing table, no "Get started free"
  banner anywhere in the actual app.
- **Consistent, deliberate corner radius** - pick one small value (e.g.
  6px) and use it everywhere, rather than defaulting to a large
  `rounded-2xl` on every element.
- **Borders and whitespace over shadows.** Reach for a hairline border or
  more spacing to create separation before reaching for a drop shadow.

### The "gimmick" bar

Small, playful details are welcome - they're what makes the app feel
authored rather than templated. The bar for keeping one:

> Does this detail mean something specific to Waypoint, or would it show
> up unchanged on any other app?

Examples that pass: the passport-stamp icon on a visited place (ties to
an actual real-world object travelers recognize), a monospace lat/lng
readout that updates as you hover the map (a real cartographer's habit,
not decoration), a subtle graticule (the thin lat/lng grid lines on real
atlases) worked into an empty state or background.

Examples that don't pass: a generic mascot, a bouncing icon with no
reason to bounce, confetti on save, anything whose only job is to look
"delightful" without referencing anything real about maps or travel.

## Checklist: what reads as AI-generated

Concrete patterns to actively avoid, compiled from what makes a site look
templated rather than authored:

- Purple-to-blue (or similarly generic) gradient hero backgrounds
- An unmodified shadcn/ui default theme
- Centered hero: headline, subheading, two CTA buttons - especially on a
  personal tool that isn't selling anything
- A row of 3-4 identical "icon in a colored circle + heading + paragraph"
  feature cards
- Glassmorphism or blurred backgrounds
- Every element sharing one large uniform corner radius (`rounded-2xl` on
  buttons, cards, images, and inputs alike)
- Soft drop shadows on every card, used as the primary way to create
  visual hierarchy
- Inter or Geist as the only typeface, set with heavy `font-bold
  tracking-tight` headlines
- Decorative abstract gradient "blob" shapes with no relationship to the
  content
- Marketing-site structure (testimonials, logo cloud, pricing table) on
  a page that isn't marketing anything
