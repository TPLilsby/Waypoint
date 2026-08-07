"use client";

import { useMemo, useState } from "react";
import { geoCentroid } from "d3-geo";
import type { Feature, Geometry } from "geojson";
import { getFeatureKey } from "@/lib/geoFeatures";
import { createClient } from "@/lib/supabase/client";
import type { PlaceStatus, PlaceType } from "@/types/database";

// Cycles default -> visited -> want-to-visit -> default on each click.
function nextStatus(current: PlaceStatus | undefined): PlaceStatus | undefined {
  if (current === undefined) return "visited";
  if (current === "visited") return "want_to_visit";
  return undefined;
}

/**
 * Owns status state and Supabase persistence for one place type, shared
 * across however many map views render that data (e.g. WorldMap's flat
 * and globe views). Keeping this outside PlaceMap means two projections
 * of the same features can show the same live status instead of each
 * view carrying its own independent copy.
 */
export function usePlaceStatuses(
  placeType: PlaceType,
  userId: string,
  initialStatuses: Record<string, PlaceStatus>
) {
  const [statuses, setStatuses] = useState(initialStatuses);
  const supabase = useMemo(() => createClient(), []);

  async function toggleStatus(place: Feature<Geometry>) {
    const key = getFeatureKey(place);
    const next = nextStatus(statuses[key]);

    setStatuses((prev) => {
      const updated = { ...prev };
      if (next === undefined) {
        delete updated[key];
      } else {
        updated[key] = next;
      }
      return updated;
    });

    if (next === undefined) {
      const { error } = await supabase
        .from("places")
        .delete()
        .eq("user_id", userId)
        .eq("type", placeType)
        .eq("ref_code", key);
      if (error) console.error(`Failed to remove ${placeType}:`, error.message);
      return;
    }

    const [lng, lat] = geoCentroid(place);
    const { error } = await supabase.from("places").upsert(
      {
        user_id: userId,
        type: placeType,
        ref_code: key,
        name: String(place.properties?.name ?? key),
        lat,
        lng,
        status: next,
      },
      { onConflict: "user_id,type,ref_code" }
    );
    if (error) console.error(`Failed to save ${placeType}:`, error.message);
  }

  return { statuses, toggleStatus };
}
