"use client";

import { useActionState } from "react";
import { updateHomeLocation, type SettingsActionState } from "@/app/dashboard/settings/actions";

const initialState: SettingsActionState = { error: null, success: false };

interface HomeLocationFormProps {
  homeName: string | null;
  homeLat: number | null;
  homeLng: number | null;
}

// No geocoding/city search - just plain lat/lng entry. Adding a place
// search would mean another API integration for a one-time, rarely
// changed setting; not worth it yet.
export function HomeLocationForm({ homeName, homeLat, homeLng }: HomeLocationFormProps) {
  const [state, formAction, pending] = useActionState(updateHomeLocation, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-md border border-line p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="home_name" className="text-sm text-muted">
          Home name
        </label>
        <input
          id="home_name"
          name="home_name"
          placeholder="Vordingborg, Denmark"
          defaultValue={homeName ?? ""}
          className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
        />
      </div>
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="home_lat" className="text-sm text-muted">
            Latitude
          </label>
          <input
            id="home_lat"
            name="home_lat"
            type="number"
            step="any"
            required
            defaultValue={homeLat ?? ""}
            className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="home_lng" className="text-sm text-muted">
            Longitude
          </label>
          <input
            id="home_lng"
            name="home_lng"
            type="number"
            step="any"
            required
            defaultValue={homeLng ?? ""}
            className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
          />
        </div>
      </div>
      <p className="text-sm text-muted">
        Look up your coordinates on{" "}
        <a
          href="https://www.latlong.net"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline"
        >
          latlong.net
        </a>{" "}
        if you don&apos;t know them offhand.
      </p>
      {state.error && <p className="text-sm text-accent">{state.error}</p>}
      {state.success && <p className="text-sm text-muted">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save home location"}
      </button>
    </form>
  );
}
