"use client";

import { useMemo, useState } from "react";
import { geoCentroid, geoEqualEarth, geoPath } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { countryFeatures, getFeatureKey } from "@/lib/worldTopology";
import { colorForCountry } from "@/lib/mapColors";
import { createClient } from "@/lib/supabase/client";
import type { PlaceStatus } from "@/types/database";

const VIEWBOX_WIDTH = 800;
const VIEWBOX_HEIGHT = 450;

// A checkmark, small enough to sit inside most countries at this zoom.
// Very small countries may not fit it cleanly - a known, deferred edge
// case (see docs/ARCHITECTURE.md#base-coloring-and-status-indicators).
const CHECKMARK_PATH = "M -4 0 L -1.3 3 L 4.5 -4.5";

// Cycles default -> visited -> want-to-visit -> default on each click.
function nextStatus(current: PlaceStatus | undefined): PlaceStatus | undefined {
  if (current === undefined) return "visited";
  if (current === "visited") return "want_to_visit";
  return undefined;
}

interface WorldMapProps {
  userId: string;
  initialStatuses: Record<string, PlaceStatus>;
}

export function WorldMap({ userId, initialStatuses }: WorldMapProps) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const supabase = useMemo(() => createClient(), []);

  const pathGenerator = useMemo(() => {
    const projection = geoEqualEarth().fitSize(
      [VIEWBOX_WIDTH, VIEWBOX_HEIGHT],
      countryFeatures
    );
    return geoPath(projection);
  }, []);

  async function toggleStatus(country: Feature<Geometry>) {
    const key = getFeatureKey(country);
    const next = nextStatus(statuses[key]);

    // Update the UI immediately; the Supabase write happens in the
    // background. See docs/ARCHITECTURE.md for why this doesn't retry on
    // failure yet - a deliberate simplification, not an oversight.
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
        .eq("type", "country")
        .eq("ref_code", key);
      if (error) console.error("Failed to remove place:", error.message);
      return;
    }

    const [lng, lat] = geoCentroid(country);
    const { error } = await supabase.from("places").upsert(
      {
        user_id: userId,
        type: "country",
        ref_code: key,
        name: String(country.properties?.name ?? key),
        lat,
        lng,
        status: next,
      },
      { onConflict: "user_id,type,ref_code" }
    );
    if (error) console.error("Failed to save place:", error.message);
  }

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label="World map"
    >
      {countryFeatures.features.map((country, index) => {
        const key = getFeatureKey(country);
        const d = pathGenerator(country);
        if (!d) return null;

        const status = statuses[key];
        const centroid = status === "visited" ? pathGenerator.centroid(country) : null;
        const hasValidCentroid =
          centroid !== null && Number.isFinite(centroid[0]) && Number.isFinite(centroid[1]);

        return (
          <g
            key={`${key}-${index}`}
            className={`country-shape${status === "want_to_visit" ? " want-to-visit" : ""}`}
            onClick={() => toggleStatus(country)}
          >
            <path
              d={d}
              fill={colorForCountry(key)}
              stroke="var(--bg)"
              strokeWidth={0.5}
            />
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
