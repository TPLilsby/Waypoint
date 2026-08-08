import type { Feature, FeatureCollection, Point } from "geojson";
import rawSites from "@/data/unescoSites.json";

interface RawSite {
  name: string;
  lat: number;
  lng: number;
}

/**
 * Static seed data, not a live API call - see
 * docs/ARCHITECTURE.md#national-parks-and-unesco-sites for why UNESCO
 * sites and national parks use different data strategies. Sourced once
 * from Wikidata (property P1435 = World Heritage Site, with coordinates),
 * not hand-curated, so it's the full ~1,247-site list rather than a
 * smaller hand-picked one.
 *
 * There's no stable numeric id in this dataset, so the site's own name is
 * used as its id/ref_code - the same fallback getFeatureKey() already
 * uses for the handful of world-atlas countries without one.
 */
const sites = rawSites as RawSite[];

export const unescoFeatures: FeatureCollection<Point> = {
  type: "FeatureCollection",
  features: sites.map(
    (site): Feature<Point> => ({
      type: "Feature",
      id: site.name,
      properties: { name: site.name },
      geometry: { type: "Point", coordinates: [site.lng, site.lat] },
    })
  ),
};
