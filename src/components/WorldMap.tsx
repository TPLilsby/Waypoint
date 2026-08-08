"use client";

import { useMemo, useRef, useState } from "react";
import { geoEqualEarth, geoOrthographic } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { countryFeatures } from "@/lib/worldTopology";
import { unescoFeatures } from "@/lib/unescoTopology";
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
const UNESCO_POINT_RADIUS = 2.5;

interface WorldMapProps {
  userId: string;
  initialStatuses: Record<string, PlaceStatus>;
  activeTripId: string | null;
  initialUnescoStatuses: Record<string, PlaceStatus>;
}

/**
 * A "View as globe" toggle rather than continuous zoom-driven projection
 * interpolation - see docs/ARCHITECTURE.md#zoom-to-globe-stretch-goal-for-phase-1b
 * for why the continuous version is deferred. Both views render the same
 * countryFeatures through usePlaceStatuses's shared state, so toggling
 * never shows stale data in either view. The UNESCO overlay follows the
 * same pattern as the national parks layer on USMap.
 */
export function WorldMap({
  userId,
  initialStatuses,
  activeTripId,
  initialUnescoStatuses,
}: WorldMapProps) {
  const { statuses, toggleStatus } = usePlaceStatuses(
    "country",
    userId,
    initialStatuses,
    activeTripId
  );
  const { statuses: unescoStatuses, toggleStatus: toggleUnescoStatus } = usePlaceStatuses(
    "unesco_site",
    userId,
    initialUnescoStatuses,
    activeTripId
  );
  const [view, setView] = useState<"flat" | "globe">("flat");
  const [showUnesco, setShowUnesco] = useState(false);
  const [rotation, setRotation] = useState<[number, number]>(DEFAULT_ROTATION);

  // Distinguishes a drag (rotate) from a click (toggle status) on the
  // globe: pointer capture alone doesn't reliably suppress the click that
  // follows a drag, so we track it ourselves and consume the flag once.
  // Covers both the country globe and the UNESCO overlay on top of it,
  // since both sit inside the same draggable container.
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

  function guardedOnGlobe<T extends Feature<Geometry>>(toggle: (place: T) => void) {
    return (place: T) => {
      if (wasDraggedRef.current) {
        wasDraggedRef.current = false;
        return;
      }
      toggle(place);
    };
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setView((v) => (v === "flat" ? "globe" : "flat"))}
          className="self-start rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:border-accent"
        >
          {view === "flat" ? "View as globe" : "Back to flat map"}
        </button>
        <button
          type="button"
          onClick={() => setShowUnesco((v) => !v)}
          className="self-start rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:border-accent"
        >
          {showUnesco ? "Hide UNESCO sites" : "Show UNESCO sites"}
        </button>
      </div>

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
          {showUnesco && (
            <PlaceMap
              features={unescoFeatures}
              projection={flatProjection}
              viewBox={FLAT_VIEWBOX}
              statuses={unescoStatuses}
              onToggle={toggleUnescoStatus}
              ariaLabel="UNESCO World Heritage Sites"
              pointRadius={UNESCO_POINT_RADIUS}
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
          )}
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
            onToggle={guardedOnGlobe(toggleStatus)}
            ariaLabel="World globe"
          />
          {showUnesco && (
            <PlaceMap
              features={unescoFeatures}
              projection={globeProjection}
              viewBox={GLOBE_VIEWBOX}
              statuses={unescoStatuses}
              onToggle={guardedOnGlobe(toggleUnescoStatus)}
              ariaLabel="UNESCO World Heritage Sites (globe)"
              pointRadius={UNESCO_POINT_RADIUS}
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
