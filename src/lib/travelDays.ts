interface TripRange {
  start_date: string | null;
  end_date: string | null;
}

// Caps how many days a single trip can contribute - not input validation
// (there's deliberately none on trip dates, see docs/DESIGN.md), just a
// guard against an accidentally huge date range walking millions of days.
const MAX_TRIP_DAYS = 730;

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Every calendar day within a trip's start/end range counts as a travel
 * day - binary, not weighted by how many places were marked visited that
 * trip, since we don't know which specific day within the range a place
 * was actually visited. Inventing that precision would be less honest
 * than a plain "traveling or not" heatmap.
 */
export function computeTravelDays(trips: TripRange[]): Set<string> {
  const travelDays = new Set<string>();

  for (const trip of trips) {
    if (!trip.start_date) continue;

    const cursor = new Date(`${trip.start_date}T00:00:00Z`);
    const end = new Date(`${trip.end_date ?? trip.start_date}T00:00:00Z`);

    let daysWalked = 0;
    while (cursor <= end && daysWalked < MAX_TRIP_DAYS) {
      travelDays.add(toDateOnly(cursor));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      daysWalked += 1;
    }
  }

  return travelDays;
}
