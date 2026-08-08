import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewTripForm } from "@/components/NewTripForm";
import { TripRow } from "@/components/TripRow";

export default async function TripsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Ascending (oldest first) to read like a timeline rather than a
  // recent-activity feed; undated trips sort to the end either way.
  const { data: trips, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Failed to load trips:", error.message);
  }

  const { data: places, error: placesError } = await supabase
    .from("places")
    .select("trip_id")
    .eq("user_id", user.id)
    .not("trip_id", "is", null);

  if (placesError) {
    console.error("Failed to load trip place counts:", placesError.message);
  }

  const placeCounts: Record<string, number> = {};
  for (const place of places ?? []) {
    if (place.trip_id) {
      placeCounts[place.trip_id] = (placeCounts[place.trip_id] ?? 0) + 1;
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <h1 className="font-heading text-2xl text-ink">Trips</h1>
      <NewTripForm />
      <div className="flex flex-col gap-3">
        {(trips ?? []).map((trip) => (
          <TripRow key={trip.id} trip={trip} placeCount={placeCounts[trip.id] ?? 0} />
        ))}
        {(trips ?? []).length === 0 && (
          <p className="text-sm text-muted">No trips yet.</p>
        )}
      </div>
    </div>
  );
}
