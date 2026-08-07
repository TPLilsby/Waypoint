"use client";

import { useState } from "react";
import { WorldMap } from "@/components/WorldMap";
import { USMap } from "@/components/USMap";
import type { PlaceStatus } from "@/types/database";

type Tab = "world" | "us";

interface DashboardMapsProps {
  userId: string;
  countryStatuses: Record<string, PlaceStatus>;
  stateStatuses: Record<string, PlaceStatus>;
}

export function DashboardMaps({
  userId,
  countryStatuses,
  stateStatuses,
}: DashboardMapsProps) {
  const [tab, setTab] = useState<Tab>("world");

  return (
    <div className="flex flex-1 flex-col gap-4">
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

      {/*
        Both maps stay mounted, just hidden - switching tabs must not
        unmount the inactive one, or it would lose its in-memory status
        map and re-render from the stale initial props on remount (the
        change would still be saved in Supabase, but would visually look
        reverted until the next full page load).
      */}
      <div className={tab === "world" ? "flex flex-1" : "hidden"}>
        <WorldMap userId={userId} initialStatuses={countryStatuses} />
      </div>
      <div className={tab === "us" ? "flex flex-1" : "hidden"}>
        <USMap userId={userId} initialStatuses={stateStatuses} />
      </div>
    </div>
  );
}
