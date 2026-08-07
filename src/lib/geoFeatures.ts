import type { Feature, Geometry } from "geojson";

/**
 * A handful of features across our datasets (disputed territories in the
 * world atlas, for instance) have no numeric id - fall back to the name
 * so they still get a stable key for coloring, React lists, and status
 * tracking. Shared by every place type (countries, US states, ...), not
 * just the world map.
 */
export function getFeatureKey(feature: Feature<Geometry>): string {
  return feature.id !== undefined
    ? String(feature.id)
    : String(feature.properties?.name);
}
