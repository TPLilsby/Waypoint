"use client";

import { useMemo } from "react";
import { geoAlbersUsa } from "d3-geo";
import { stateFeatures } from "@/lib/usTopology";
import { usePlaceStatuses } from "@/lib/usePlaceStatuses";
import { PlaceMap } from "@/components/PlaceMap";
import type { PlaceStatus } from "@/types/database";

const VIEWBOX: readonly [number, number] = [800, 500];

interface USMapProps {
  userId: string;
  initialStatuses: Record<string, PlaceStatus>;
}

export function USMap({ userId, initialStatuses }: USMapProps) {
  const { statuses, toggleStatus } = usePlaceStatuses(
    "us_state",
    userId,
    initialStatuses
  );

  const projection = useMemo(
    () => geoAlbersUsa().fitSize(VIEWBOX as [number, number], stateFeatures),
    []
  );

  return (
    <PlaceMap
      features={stateFeatures}
      projection={projection}
      viewBox={VIEWBOX}
      statuses={statuses}
      onToggle={toggleStatus}
      ariaLabel="Map of United States"
    />
  );
}
