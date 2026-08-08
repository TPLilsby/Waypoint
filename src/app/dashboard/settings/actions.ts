"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsActionState = { error: string | null; success: boolean };

export async function updateHomeLocation(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", success: false };

  const lat = parseFloat(formData.get("home_lat") as string);
  const lng = parseFloat(formData.get("home_lng") as string);

  if (Number.isNaN(lat) || Number.isNaN(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { error: "Enter a valid latitude (-90 to 90) and longitude (-180 to 180).", success: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      home_name: (formData.get("home_name") as string) || null,
      home_lat: lat,
      home_lng: lng,
    })
    .eq("id", user.id);

  if (error) return { error: error.message, success: false };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { error: null, success: true };
}
