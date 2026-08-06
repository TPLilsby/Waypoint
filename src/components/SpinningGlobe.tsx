"use client";

import { useEffect, useMemo, useState } from "react";
import { geoOrthographic, geoPath } from "d3-geo";
import { countryFeatures } from "@/lib/worldTopology";
import { colorForCountry } from "@/lib/mapColors";

const SIZE = 480;
const DEGREES_PER_TICK = 0.2;
const TICK_MS = 50;

/**
 * Purely decorative - the same map data as WorldMap, rendered through
 * d3's orthographic projection instead of an equal-area one. This is
 * also a working preview of the zoom-to-globe technique planned for
 * later (docs/ARCHITECTURE.md#zoom-to-globe-stretch-goal-for-phase-1b),
 * not a separate rendering approach.
 */
export function SpinningGlobe() {
  const [longitude, setLongitude] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setLongitude((prev) => (prev + DEGREES_PER_TICK) % 360);
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const pathGenerator = useMemo(() => {
    const projection = geoOrthographic()
      .scale(SIZE / 2.15)
      .translate([SIZE / 2, SIZE / 2])
      .rotate([longitude, -15]);
    return geoPath(projection);
  }, [longitude]);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle cx={SIZE / 2} cy={SIZE / 2} r={SIZE / 2.15} fill="var(--surface)" />
      {countryFeatures.features.map((country, index) => {
        const d = pathGenerator(country);
        if (!d) return null;
        // See WorldMap.tsx - a few territories have no numeric id here.
        const colorKey = country.id !== undefined ? String(country.id) : String(country.properties?.name);
        return (
          <path
            key={`${colorKey}-${index}`}
            d={d}
            fill={colorForCountry(colorKey)}
            stroke="var(--bg)"
            strokeWidth={0.3}
          />
        );
      })}
    </svg>
  );
}
