"use client";

import { useMemo, useRef, useState } from "react";
import { geoEqualEarth, geoOrthographic } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { countryFeatures } from "@/lib/worldTopology";
import { usePlaceStatuses } from "@/lib/usePlaceStatuses";
import { PlaceMap } from "@/components/PlaceMap";
import type { PlaceStatus } from "@/types/database";

const FLAT_VIEWBOX: readonly [number, number] = [800, 450];
const GLOBE_SIZE = 800;
const GLOBE_VIEWBOX: readonly [number, number] = [GLOBE_SIZE, GLOBE_SIZE];
const DEFAULT_ROTATION: [number, number] = [-10, -15];
const DRAG_SENSITIVITY = 0.3;
const DRAG_THRESHOLD_PX = 3;
const MAX_LATITUDE = 80;

interface WorldMapProps {
  userId: string;
  initialStatuses: Record<string, PlaceStatus>;
}

/**
 * A "View as globe" toggle rather than continuous zoom-driven projection
 * interpolation - see docs/ARCHITECTURE.md#zoom-to-globe-stretch-goal-for-phase-1b
 * for why the continuous version is deferred. Both views render the same
 * countryFeatures through usePlaceStatuses's shared state, so toggling
 * never shows stale data in either view.
 */
export function WorldMap({ userId, initialStatuses }: WorldMapProps) {
  const { statuses, toggleStatus } = usePlaceStatuses(
    "country",
    userId,
    initialStatuses
  );
  const [view, setView] = useState<"flat" | "globe">("flat");
  const [rotation, setRotation] = useState<[number, number]>(DEFAULT_ROTATION);

  // Distinguishes a drag (rotate) from a click (toggle status) on the
  // globe: pointer capture alone doesn't reliably suppress the click that
  // follows a drag, so we track it ourselves and consume the flag once.
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    startRotation: [number, number];
  } | null>(null);
  const wasDraggedRef = useRef(false);

  const flatProjection = useMemo(
    () => geoEqualEarth().fitSize(FLAT_VIEWBOX as [number, number], countryFeatures),
    []
  );

  // Scale/translate directly rather than fitSize - orthographic's raw
  // output is already bounded to a disk regardless of the data, and this
  // matches the working approach in SpinningGlobe.tsx.
  const globeProjection = useMemo(
    () =>
      geoOrthographic()
        .scale(GLOBE_SIZE / 2.15)
        .translate([GLOBE_SIZE / 2, GLOBE_SIZE / 2])
        .rotate(rotation),
    [rotation]
  );

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startRotation: rotation,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragStateRef.current;
    if (!drag) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX || Math.abs(dy) > DRAG_THRESHOLD_PX) {
      wasDraggedRef.current = true;
    }

    const nextLongitude = drag.startRotation[0] + dx * DRAG_SENSITIVITY;
    const nextLatitude = Math.max(
      -MAX_LATITUDE,
      Math.min(MAX_LATITUDE, drag.startRotation[1] - dy * DRAG_SENSITIVITY)
    );
    setRotation([nextLongitude, nextLatitude]);
  }

  function handlePointerUp() {
    dragStateRef.current = null;
  }

  function handleGlobeToggle(place: Feature<Geometry>) {
    if (wasDraggedRef.current) {
      wasDraggedRef.current = false;
      return;
    }
    toggleStatus(place);
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <button
        type="button"
        onClick={() => setView((v) => (v === "flat" ? "globe" : "flat"))}
        className="self-start rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:border-accent"
      >
        {view === "flat" ? "View as globe" : "Back to flat map"}
      </button>

      <div className="relative flex flex-1">
        <div
          className={`absolute inset-0 h-full w-full transition-opacity duration-500 ${
            view === "flat" ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <PlaceMap
            features={countryFeatures}
            projection={flatProjection}
            viewBox={FLAT_VIEWBOX}
            statuses={statuses}
            onToggle={toggleStatus}
            ariaLabel="World map"
          />
        </div>

        <div
          className={`absolute inset-0 h-full w-full cursor-grab transition-opacity duration-500 active:cursor-grabbing ${
            view === "globe" ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <PlaceMap
            features={countryFeatures}
            projection={globeProjection}
            viewBox={GLOBE_VIEWBOX}
            statuses={statuses}
            onToggle={handleGlobeToggle}
            ariaLabel="World globe"
          />
        </div>
      </div>
    </div>
  );
}
