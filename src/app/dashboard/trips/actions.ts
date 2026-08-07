"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TripActionState = { error: string | null; success: boolean };

export async function createTrip(
  _prevState: TripActionState,
  formData: FormData
): Promise<TripActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in.", success: false };

  const { error } = await supabase.from("trips").insert({
    user_id: user.id,
    title: formData.get("title") as string,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    note: (formData.get("note") as string) || null,
  });

  if (error) return { error: error.message, success: false };

  revalidatePath("/dashboard/trips");
  return { error: null, success: true };
}

// No explicit user_id filter on update/delete - RLS already scopes both
// to the caller's own rows (see docs/ARCHITECTURE.md#auth-and-row-level-security),
// so there's nothing for application code to double-check here.
export async function updateTrip(
  _prevState: TripActionState,
  formData: FormData
): Promise<TripActionState> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("trips")
    .update({
      title: formData.get("title") as string,
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
      note: (formData.get("note") as string) || null,
    })
    .eq("id", formData.get("id") as string);

  if (error) return { error: error.message, success: false };

  revalidatePath("/dashboard/trips");
  return { error: null, success: true };
}

export async function deleteTrip(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", formData.get("id") as string);

  if (error) console.error("Failed to delete trip:", error.message);

  revalidatePath("/dashboard/trips");
}
