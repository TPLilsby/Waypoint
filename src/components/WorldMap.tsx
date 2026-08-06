"use client";

import { useMemo } from "react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { countryFeatures } from "@/lib/worldTopology";
import { colorForCountry } from "@/lib/mapColors";

const VIEWBOX_WIDTH = 800;
const VIEWBOX_HEIGHT = 450;

export function WorldMap() {
  const pathGenerator = useMemo(() => {
    const projection = geoEqualEarth().fitSize(
      [VIEWBOX_WIDTH, VIEWBOX_HEIGHT],
      countryFeatures
    );
    return geoPath(projection);
  }, []);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      className="h-full w-full"
      role="img"
      aria-label="World map"
    >
      {countryFeatures.features.map((country, index) => {
        // A handful of disputed/unrecognized territories (e.g. Kosovo,
        // Somaliland) have no numeric id in this dataset - fall back to
        // the name so they still get a stable, distinct color.
        const colorKey = country.id !== undefined ? String(country.id) : String(country.properties?.name);
        return (
          <path
            key={`${colorKey}-${index}`}
            d={pathGenerator(country) ?? undefined}
            fill={colorForCountry(colorKey)}
            stroke="var(--bg)"
            strokeWidth={0.5}
          />
        );
      })}
    </svg>
  );
}
