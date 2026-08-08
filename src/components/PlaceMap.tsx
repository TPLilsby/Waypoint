"use client";

import { useMemo } from "react";
import { geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { getFeatureKey } from "@/lib/geoFeatures";
import { colorForPlace } from "@/lib/mapColors";
import type { PlaceStatus } from "@/types/database";

// A checkmark, small enough to sit inside most places at this zoom. Very
// small ones may not fit it cleanly - a known, deferred edge case (see
// docs/ARCHITECTURE.md#base-coloring-and-status-indicators).
const CHECKMARK_PATH = "M -4 0 L -1.3 3 L 4.5 -4.5";

interface PlaceMapProps {
  features: FeatureCollection<Geometry>;
  projection: GeoProjection;
  viewBox: readonly [number, number];
  statuses: Record<string, PlaceStatus>;
  onToggle: (place: Feature<Geometry>) => void;
  ariaLabel: string;
  className?: string;
  // Set for point-feature layers (national parks, UNESCO sites) so they
  // render as circles of this radius instead of polygon outlines. d3-geo
  // only draws Point/MultiPoint geometries when a pointRadius is set.
  pointRadius?: number;
}

/**
 * Renders any place-type map or overlay layer (countries, US states,
 * national park/UNESCO point markers, ...) with the same click-to-cycle
 * and hover-pop behavior. A controlled component: status state and
 * Supabase persistence live in usePlaceStatuses, one level up, so
 * multiple projections/layers of the same or different data can share
 * live status instead of each keeping an independent copy.
 */
export function PlaceMap({
  features,
  projection,
  viewBox,
  statuses,
  onToggle,
  ariaLabel,
  className,
  pointRadius,
}: PlaceMapProps) {
  const pathGenerator = useMemo(() => {
    const generator = geoPath(projection);
    if (pointRadius !== undefined) generator.pointRadius(pointRadius);
    return generator;
  }, [projection, pointRadius]);

  return (
    <svg
      viewBox={`0 0 ${viewBox[0]} ${viewBox[1]}`}
      className={className ?? "h-full w-full"}
      role="img"
      aria-label={ariaLabel}
    >
      {features.features.map((place, index) => {
        const key = getFeatureKey(place);
        const d = pathGenerator(place);
        if (!d) return null;

        const status = statuses[key];
        const centroid = status === "visited" ? pathGenerator.centroid(place) : null;
        const hasValidCentroid =
          centroid !== null && Number.isFinite(centroid[0]) && Number.isFinite(centroid[1]);

        return (
          <g
            key={`${key}-${index}`}
            className={`place-shape${status === "want_to_visit" ? " want-to-visit" : ""}`}
            onClick={() => onToggle(place)}
          >
            <path d={d} fill={colorForPlace(key)} stroke="var(--bg)" strokeWidth={0.5} />
            {hasValidCentroid && (
              <path
                d={CHECKMARK_PATH}
                transform={`translate(${centroid![0]}, ${centroid![1]})`}
                stroke="var(--accent)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
