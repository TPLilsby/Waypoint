"use client";

import { useMemo } from "react";
import { geoAlbersUsa } from "d3-geo";
import { stateFeatures } from "@/lib/usTopology";
import { PlaceMap } from "@/components/PlaceMap";
import type { PlaceStatus } from "@/types/database";

const VIEWBOX: readonly [number, number] = [800, 500];

interface USMapProps {
  userId: string;
  initialStatuses: Record<string, PlaceStatus>;
}

export function USMap({ userId, initialStatuses }: USMapProps) {
  const projection = useMemo(
    () => geoAlbersUsa().fitSize(VIEWBOX as [number, number], stateFeatures),
    []
  );

  return (
    <PlaceMap
      features={stateFeatures}
      projection={projection}
      placeType="us_state"
      viewBox={VIEWBOX}
      userId={userId}
      initialStatuses={initialStatuses}
      ariaLabel="Map of United States"
    />
  );
}
