"use client";

import { useActionState, useState } from "react";
import { updateTrip, deleteTrip, type TripActionState } from "@/app/dashboard/trips/actions";
import type { Database } from "@/types/database";

type Trip = Database["public"]["Tables"]["trips"]["Row"];

const initialState: TripActionState = { error: null, success: false };

export function TripRow({ trip }: { trip: Trip }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateTrip, initialState);

  // Closes the edit form after a successful save. Adjusting state during
  // render (React's documented pattern for "reset state when a value
  // changes") instead of an effect, which would fire a redundant extra
  // render after the one that already has the fresh state.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.success) setEditing(false);
  }

  if (editing) {
    return (
      <form
        action={formAction}
        className="flex flex-col gap-3 rounded-md border border-line p-4"
      >
        <input type="hidden" name="id" value={trip.id} />
        <input
          name="title"
          defaultValue={trip.title}
          required
          className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
        />
        <div className="flex gap-2">
          <input
            type="date"
            name="start_date"
            defaultValue={trip.start_date ?? ""}
            className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
          />
          <input
            type="date"
            name="end_date"
            defaultValue={trip.end_date ?? ""}
            className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
          />
        </div>
        <textarea
          name="note"
          defaultValue={trip.note ?? ""}
          className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
        />
        {state.error && <p className="text-sm text-accent">{state.error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:border-accent"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-line p-4">
      <div>
        <p className="font-heading text-lg text-ink">{trip.title}</p>
        {(trip.start_date || trip.end_date) && (
          <p className="text-sm text-muted">
            {trip.start_date ?? "?"} - {trip.end_date ?? "?"}
          </p>
        )}
        {trip.note && <p className="mt-1 text-sm text-muted">{trip.note}</p>}
      </div>
      <div className="flex shrink-0 gap-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-ink underline hover:text-accent"
        >
          Edit
        </button>
        <form
          action={deleteTrip}
          onSubmit={(event) => {
            if (!confirm(`Delete "${trip.title}"?`)) event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={trip.id} />
          <button type="submit" className="text-sm text-ink underline hover:text-accent">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
