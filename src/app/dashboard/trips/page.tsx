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

  const { data: trips, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("Failed to load trips:", error.message);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <h1 className="font-heading text-2xl text-ink">Trips</h1>
      <NewTripForm />
      <div className="flex flex-col gap-3">
        {(trips ?? []).map((trip) => (
          <TripRow key={trip.id} trip={trip} />
        ))}
        {(trips ?? []).length === 0 && (
          <p className="text-sm text-muted">No trips yet.</p>
        )}
      </div>
    </div>
  );
}
