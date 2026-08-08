"use client";

import { useMemo, useState } from "react";
import { geoAlbersUsa } from "d3-geo";
import type { FeatureCollection, Point } from "geojson";
import { stateFeatures } from "@/lib/usTopology";
import { usePlaceStatuses } from "@/lib/usePlaceStatuses";
import { PlaceMap } from "@/components/PlaceMap";
import type { PlaceStatus } from "@/types/database";

const VIEWBOX: readonly [number, number] = [800, 500];
const PARK_POINT_RADIUS = 4;

interface USMapProps {
  userId: string;
  initialStatuses: Record<string, PlaceStatus>;
  activeTripId: string | null;
  parks: FeatureCollection<Point>;
  initialParkStatuses: Record<string, PlaceStatus>;
}

export function USMap({
  userId,
  initialStatuses,
  activeTripId,
  parks,
  initialParkStatuses,
}: USMapProps) {
  const { statuses, toggleStatus } = usePlaceStatuses(
    "us_state",
    userId,
    initialStatuses,
    activeTripId
  );
  const { statuses: parkStatuses, toggleStatus: toggleParkStatus } = usePlaceStatuses(
    "national_park",
    userId,
    initialParkStatuses,
    activeTripId
  );
  const [showParks, setShowParks] = useState(false);

  const projection = useMemo(
    () => geoAlbersUsa().fitSize(VIEWBOX as [number, number], stateFeatures),
    []
  );

  return (
    <div className="flex flex-1 flex-col gap-3">
      <button
        type="button"
        onClick={() => setShowParks((v) => !v)}
        className="self-start rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:border-accent"
      >
        {showParks ? "Hide national parks" : "Show national parks"}
      </button>

      <div className="relative flex flex-1">
        <PlaceMap
          features={stateFeatures}
          projection={projection}
          viewBox={VIEWBOX}
          statuses={statuses}
          onToggle={toggleStatus}
          ariaLabel="Map of United States"
        />
        {showParks && (
          <PlaceMap
            features={parks}
            projection={projection}
            viewBox={VIEWBOX}
            statuses={parkStatuses}
            onToggle={toggleParkStatus}
            ariaLabel="National parks"
            pointRadius={PARK_POINT_RADIUS}
            // pointer-events-none on the overlay itself so its empty space
            // doesn't block clicks on the states underneath - individual
            // markers re-enable pointer events via .place-shape, see
            // globals.css.
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
        )}
      </div>
    </div>
  );
}
