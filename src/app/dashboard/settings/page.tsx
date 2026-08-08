import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HomeLocationForm } from "@/components/HomeLocationForm";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("home_name, home_lat, home_lng")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Failed to load profile:", error.message);
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <h1 className="font-heading text-2xl text-ink">Settings</h1>
      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-lg text-ink">Home location</h2>
        <p className="text-sm text-muted">
          Used to calculate distance-from-home stats on your dashboard.
        </p>
        <HomeLocationForm
          homeName={profile?.home_name ?? null}
          homeLat={profile?.home_lat ?? null}
          homeLng={profile?.home_lng ?? null}
        />
      </div>
    </div>
  );
}
