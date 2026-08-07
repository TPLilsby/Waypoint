"use client";

import { useMemo, useState } from "react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { countryFeatures, getFeatureKey } from "@/lib/worldTopology";
import { colorForCountry } from "@/lib/mapColors";

const VIEWBOX_WIDTH = 800;
const VIEWBOX_HEIGHT = 450;

// A checkmark, small enough to sit inside most countries at this zoom.
// Very small countries may not fit it cleanly - a known, deferred edge
// case (see docs/ARCHITECTURE.md#base-coloring-and-status-indicators).
const CHECKMARK_PATH = "M -4 0 L -1.3 3 L 4.5 -4.5";

type PlaceStatus = "visited" | "want_to_visit";

// In-memory only for now - cycling default -> visited -> want-to-visit ->
// default. Persisting this to Supabase is 1b-iii, not this step.
function nextStatus(current: PlaceStatus | undefined): PlaceStatus | undefined {
  if (current === undefined) return "visited";
  if (current === "visited") return "want_to_visit";
  return undefined;
}

export function WorldMap() {
  const [statuses, setStatuses] = useState<Record<string, PlaceStatus>>({});

  const pathGenerator = useMemo(() => {
    const projection = geoEqualEarth().fitSize(
      [VIEWBOX_WIDTH, VIEWBOX_HEIGHT],
      countryFeatures
    );
    return geoPath(projection);
  }, []);

  function toggleStatus(key: string) {
    setStatuses((prev) => {
      const updated = { ...prev };
      const next = nextStatus(prev[key]);
      if (next === undefined) {
        delete updated[key];
      } else {
        updated[key] = next;
      }
      return updated;
    });
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
            onClick={() => toggleStatus(key)}
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
