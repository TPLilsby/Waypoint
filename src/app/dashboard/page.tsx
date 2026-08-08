import { redirect } from "next/navigation";
import { DashboardMaps } from "@/components/DashboardMaps";
import { createClient } from "@/lib/supabase/server";
import type { PlaceStatus, PlaceType } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetched server-side and passed down as initial state, rather than
  // fetched client-side on mount, so each map never flashes empty before
  // showing what's actually saved.
  const { data: places, error } = await supabase
    .from("places")
    .select("type, ref_code, status")
    .eq("user_id", user.id)
    .in("type", ["country", "us_state"]);

  if (error) {
    console.error("Failed to load saved places:", error.message);
  }

  const statusesByType: Record<PlaceType, Record<string, PlaceStatus>> = {
    country: {},
    us_state: {},
    national_park: {},
    unesco_site: {},
  };
  for (const place of places ?? []) {
    statusesByType[place.type][place.ref_code] = place.status;
  }

  const { data: trips, error: tripsError } = await supabase
    .from("trips")
    .select("id, title")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false, nullsFirst: false });

  if (tripsError) {
    console.error("Failed to load trips:", tripsError.message);
  }

  return (
    <DashboardMaps
      userId={user.id}
      countryStatuses={statusesByType.country}
      stateStatuses={statusesByType.us_state}
      trips={trips ?? []}
    />
  );
}
