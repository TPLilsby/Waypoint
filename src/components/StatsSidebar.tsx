interface Counts {
  countriesVisited: number;
  countriesWantToVisit: number;
  statesVisited: number;
  parksVisited: number;
  unescoVisited: number;
}

interface Home {
  name: string | null;
  lat: number;
  lng: number;
}

interface WorldCoverage {
  populationPercent: number;
  areaPercent: number;
  languages: string[];
  currencies: string[];
}

interface WeatherEntry {
  placeName: string;
  date: string;
  maxC: number;
  minC: number;
}

interface StatsSidebarProps {
  counts: Counts;
  home: Home | null;
  furthestPlace: { name: string; km: number } | null;
  averageDistanceKm: number | null;
  worldCoverage: WorldCoverage | null;
  weatherEntries: WeatherEntry[];
}

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-mono text-ink">{value}</span>
    </div>
  );
}

// A plain Server Component - every number here is computed server-side in
// dashboard/page.tsx and handed down as props, no client interactivity.
export function StatsSidebar({
  counts,
  home,
  furthestPlace,
  averageDistanceKm,
  worldCoverage,
  weatherEntries,
}: StatsSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-md border border-line p-4">
        <h2 className="font-heading text-base text-ink">Coverage</h2>
        <StatRow label="Countries visited" value={counts.countriesVisited} />
        <StatRow label="Countries want to visit" value={counts.countriesWantToVisit} />
        <StatRow label="US states visited" value={counts.statesVisited} />
        <StatRow label="National parks visited" value={counts.parksVisited} />
        <StatRow label="UNESCO sites visited" value={counts.unescoVisited} />
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-line p-4">
        <h2 className="font-heading text-base text-ink">Distance from home</h2>
        {home ? (
          <>
            <p className="text-sm text-muted">
              Measured from {home.name ?? `${home.lat}, ${home.lng}`}
            </p>
            {furthestPlace ? (
              <>
                <StatRow
                  label="Furthest visited"
                  value={`${furthestPlace.name} (${Math.round(furthestPlace.km).toLocaleString()} km)`}
                />
                <StatRow
                  label="Average distance"
                  value={`${Math.round(averageDistanceKm ?? 0).toLocaleString()} km`}
                />
              </>
            ) : (
              <p className="text-sm text-muted">No visited places with coordinates yet.</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted">
            Set a home location in{" "}
            <a href="/dashboard/settings" className="text-accent underline">
              Settings
            </a>{" "}
            to see this.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-line p-4">
        <h2 className="font-heading text-base text-ink">World coverage</h2>
        {worldCoverage ? (
          <>
            <StatRow label="Of world population" value={`${worldCoverage.populationPercent.toFixed(2)}%`} />
            <StatRow label="Of world land area" value={`${worldCoverage.areaPercent.toFixed(2)}%`} />
            <StatRow label="Languages" value={worldCoverage.languages.length} />
            <StatRow label="Currencies" value={worldCoverage.currencies.length} />
          </>
        ) : (
          <p className="text-sm text-muted">
            Not available yet - requires a REST Countries API key
            (RESTCOUNTRIES_API_KEY).
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 rounded-md border border-line p-4">
        <h2 className="font-heading text-base text-ink">Weather on your visits</h2>
        <p className="text-sm text-muted">
          Based on the linked trip&apos;s start date, not the exact visit day.
        </p>
        {weatherEntries.length === 0 ? (
          <p className="text-sm text-muted">
            No dated visits yet - link a place to a trip with a start date.
          </p>
        ) : (
          <div className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {weatherEntries.map((entry) => (
              <StatRow
                key={`${entry.placeName}-${entry.date}`}
                label={`${entry.placeName} (${entry.date})`}
                value={`${Math.round(entry.minC)}-${Math.round(entry.maxC)}°C`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
