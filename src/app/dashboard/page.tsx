import { redirect } from "next/navigation";
import { WorldMap } from "@/components/WorldMap";
import { createClient } from "@/lib/supabase/server";
import type { PlaceStatus } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetched server-side and passed down as initial state, rather than
  // fetched client-side on mount, so the map never flashes empty before
  // showing what's actually saved.
  const { data: places, error } = await supabase
    .from("places")
    .select("ref_code, status")
    .eq("user_id", user.id)
    .eq("type", "country");

  if (error) {
    console.error("Failed to load saved places:", error.message);
  }

  const initialStatuses: Record<string, PlaceStatus> = Object.fromEntries(
    (places ?? []).map((place) => [place.ref_code, place.status])
  );

  return (
    <div className="flex flex-1 flex-col">
      <WorldMap userId={user.id} initialStatuses={initialStatuses} />
    </div>
  );
}
