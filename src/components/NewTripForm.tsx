"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTrip, type TripActionState } from "@/app/dashboard/trips/actions";

const initialState: TripActionState = { error: null, success: false };

export function NewTripForm() {
  const [state, formAction, pending] = useActionState(createTrip, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3 rounded-md border border-line p-4"
    >
      <input
        name="title"
        placeholder="Trip title"
        required
        className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
      />
      <div className="flex gap-2">
        <input
          type="date"
          name="start_date"
          className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
        />
        <input
          type="date"
          name="end_date"
          className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
        />
      </div>
      <textarea
        name="note"
        placeholder="Note (optional)"
        className="rounded-md border border-line bg-surface px-3 py-2 text-ink outline-none focus:border-accent"
      />
      {state.error && <p className="text-sm text-accent">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create trip"}
      </button>
    </form>
  );
}
