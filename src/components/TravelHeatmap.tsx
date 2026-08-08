import { computeTravelDays } from "@/lib/travelDays";

interface TravelHeatmapProps {
  trips: { start_date: string | null; end_date: string | null }[];
}

const WEEKS = 53;
const DAY_MS = 24 * 60 * 60 * 1000;

// A plain Server Component - the grid is a pure function of trip data, no
// interactivity needed, so there's no reason to ship it to the client.
export function TravelHeatmap({ trips }: TravelHeatmapProps) {
  const travelDays = computeTravelDays(trips);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Start on a Sunday so every column is a clean 7-day week.
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - WEEKS * 7 - start.getUTCDay());

  const weeks: Date[][] = [];
  for (let week = 0; week <= WEEKS; week++) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day++) {
      days.push(new Date(start.getTime() + (week * 7 + day) * DAY_MS));
    }
    weeks.push(days);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">Travel days, last 12 months</p>
      <div className="flex gap-1 overflow-x-auto">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => {
              const key = day.toISOString().slice(0, 10);
              const isFuture = day > today;
              const active = !isFuture && travelDays.has(key);
              return (
                <div
                  key={key}
                  title={key}
                  className={`h-3 w-3 rounded-sm ${
                    isFuture ? "" : active ? "bg-accent" : "bg-line"
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
