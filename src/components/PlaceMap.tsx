"use client";

import { useMemo, useState } from "react";
import { geoCentroid, geoPath, type GeoProjection } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { getFeatureKey } from "@/lib/geoFeatures";
import { colorForPlace } from "@/lib/mapColors";
import { createClient } from "@/lib/supabase/client";
import type { PlaceStatus, PlaceType } from "@/types/database";

// A checkmark, small enough to sit inside most places at this zoom. Very
// small ones may not fit it cleanly - a known, deferred edge case (see
// docs/ARCHITECTURE.md#base-coloring-and-status-indicators).
const CHECKMARK_PATH = "M -4 0 L -1.3 3 L 4.5 -4.5";

// Cycles default -> visited -> want-to-visit -> default on each click.
function nextStatus(current: PlaceStatus | undefined): PlaceStatus | undefined {
  if (current === undefined) return "visited";
  if (current === "visited") return "want_to_visit";
  return undefined;
}

interface PlaceMapProps {
  features: FeatureCollection<Geometry>;
  projection: GeoProjection;
  placeType: PlaceType;
  viewBox: readonly [number, number];
  userId: string;
  initialStatuses: Record<string, PlaceStatus>;
  ariaLabel: string;
}

/**
 * Renders any place-type map (countries, US states, ...) with the same
 * click-to-cycle, hover-pop, and persistence behavior. WorldMap and USMap
 * are thin wrappers that supply the data and a fitted projection - see
 * docs/ARCHITECTURE.md for why the write goes straight to Supabase from
 * here instead of through a Server Action.
 */
export function PlaceMap({
  features,
  projection,
  placeType,
  viewBox,
  userId,
  initialStatuses,
  ariaLabel,
}: PlaceMapProps) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const supabase = useMemo(() => createClient(), []);
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);

  async function toggleStatus(place: Feature<Geometry>) {
    const key = getFeatureKey(place);
    const next = nextStatus(statuses[key]);

    setStatuses((prev) => {
      const updated = { ...prev };
      if (next === undefined) {
        delete updated[key];
      } else {
        updated[key] = next;
      }
      return updated;
    });

    if (next === undefined) {
      const { error } = await supabase
        .from("places")
        .delete()
        .eq("user_id", userId)
        .eq("type", placeType)
        .eq("ref_code", key);
      if (error) console.error(`Failed to remove ${placeType}:`, error.message);
      return;
    }

    const [lng, lat] = geoCentroid(place);
    const { error } = await supabase.from("places").upsert(
      {
        user_id: userId,
        type: placeType,
        ref_code: key,
        name: String(place.properties?.name ?? key),
        lat,
        lng,
        status: next,
      },
      { onConflict: "user_id,type,ref_code" }
    );
    if (error) console.error(`Failed to save ${placeType}:`, error.message);
  }

  return (
    <svg
      viewBox={`0 0 ${viewBox[0]} ${viewBox[1]}`}
      className="h-full w-full"
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
            className={`country-shape${status === "want_to_visit" ? " want-to-visit" : ""}`}
            onClick={() => toggleStatus(place)}
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
