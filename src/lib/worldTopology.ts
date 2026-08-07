import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import worldTopology from "world-atlas/countries-110m.json";

/**
 * Parsed once at module load, not per component instance - the topology
 * never changes at runtime, so there's no reason to redo this work every
 * time a WorldMap or SpinningGlobe mounts.
 */
const topology = worldTopology as unknown as Topology;
const countriesObject = topology.objects.countries as GeometryCollection;

export const countryFeatures = feature(
  topology,
  countriesObject
) as FeatureCollection<Geometry>;

/**
 * A handful of disputed/unrecognized territories (e.g. Kosovo, Somaliland)
 * have no numeric id in this dataset - fall back to the name so they still
 * get a stable key for coloring, React lists, and status tracking.
 */
export function getFeatureKey(feature: Feature<Geometry>): string {
  return feature.id !== undefined
    ? String(feature.id)
    : String(feature.properties?.name);
}
