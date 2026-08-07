import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import usTopology from "us-atlas/states-10m.json";

/**
 * Real lon/lat coordinates, not us-atlas's pre-baked "-albers" variant -
 * geoCentroid() needs actual geographic positions to produce a usable
 * lat/lng for storage, and the Albers-transformed file has already moved
 * Alaska/Hawaii into their compact inset positions. We apply
 * geoAlbersUsa() ourselves in USMap instead.
 */
const topology = usTopology as unknown as Topology;
const statesObject = topology.objects.states as GeometryCollection;

export const stateFeatures = feature(
  topology,
  statesObject
) as FeatureCollection<Geometry>;
