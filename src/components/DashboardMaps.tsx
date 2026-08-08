"use client";

import { useState } from "react";
import { WorldMap } from "@/components/WorldMap";
import { USMap } from "@/components/USMap";
import type { PlaceStatus } from "@/types/database";

type Tab = "world" | "us";

interface TripOption {
  id: string;
  title: string;
}

interface DashboardMapsProps {
  userId: string;
  countryStatuses: Record<string, PlaceStatus>;
  stateStatuses: Record<string, PlaceStatus>;
  trips: TripOption[];
}

export function DashboardMaps({
  userId,
  countryStatuses,
  stateStatuses,
  trips,
}: DashboardMapsProps) {
  const [tab, setTab] = useState<Tab>("world");
  const [activeTripId, setActiveTripId] = useState<string | null>(null);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-6 border-b border-line">
          <button
            type="button"
            onClick={() => setTab("world")}
            className={`pb-2 text-sm ${
              tab === "world" ? "border-b-2 border-accent text-ink" : "text-muted"
            }`}
          >
            World
          </button>
          <button
            type="button"
            onClick={() => setTab("us")}
            className={`pb-2 text-sm ${
              tab === "us" ? "border-b-2 border-accent text-ink" : "text-muted"
            }`}
          >
            United States
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted">
          Marking places for
          <select
            value={activeTripId ?? ""}
            onChange={(event) => setActiveTripId(event.target.value || null)}
            className="rounded-md border border-line bg-surface px-2 py-1.5 text-ink outline-none focus:border-accent"
          >
            <option value="">No trip</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/*
        Both maps stay mounted, just hidden - switching tabs must not
        unmount the inactive one, or it would lose its in-memory status
        map and re-render from the stale initial props on remount (the
        change would still be saved in Supabase, but would visually look
        reverted until the next full page load).
      */}
      <div className={tab === "world" ? "flex flex-1" : "hidden"}>
        <WorldMap
          userId={userId}
          initialStatuses={countryStatuses}
          activeTripId={activeTripId}
        />
      </div>
      <div className={tab === "us" ? "flex flex-1" : "hidden"}>
        <USMap
          userId={userId}
          initialStatuses={stateStatuses}
          activeTripId={activeTripId}
        />
      </div>
    </div>
  );
}
