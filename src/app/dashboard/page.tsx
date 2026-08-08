import { redirect } from "next/navigation";
import { DashboardMaps } from "@/components/DashboardMaps";
import { StatsSidebar } from "@/components/StatsSidebar";
import { createClient } from "@/lib/supabase/server";
import { getNationalParks } from "@/lib/nationalParks";
import { getCountryStats } from "@/lib/restCountries";
import { getHistoricalWeather } from "@/lib/weather";
import { distanceKm } from "@/lib/distance";
import type { PlaceStatus, PlaceType } from "@/types/database";

interface PlaceRow {
  type: PlaceType;
  ref_code: string;
  name: string;
  status: PlaceStatus;
  lat: number | null;
  lng: number | null;
  trips: { start_date: string | null } | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetched server-side and passed down as initial state, rather than
  // fetched client-side on mount, so each map never flashes empty before
  // showing what's actually saved. Joins the linked trip's start_date,
  // used below as a stand-in visit date for the weather stat.
  const { data: rawPlaces, error } = await supabase
    .from("places")
    .select("type, ref_code, name, status, lat, lng, trips(start_date)")
    .eq("user_id", user.id)
    .in("type", ["country", "us_state", "national_park", "unesco_site"])
    .overrideTypes<PlaceRow[], { merge: false }>();

  if (error) {
    console.error("Failed to load saved places:", error.message);
  }
  const places = rawPlaces ?? [];

  const statusesByType: Record<PlaceType, Record<string, PlaceStatus>> = {
    country: {},
    us_state: {},
    national_park: {},
    unesco_site: {},
  };
  for (const place of places) {
    statusesByType[place.type][place.ref_code] = place.status;
  }

  const { data: trips, error: tripsError } = await supabase
    .from("trips")
    .select("id, title")
    .eq("user_id", user.id)
    .order("start_date", { ascending: false, nullsFirst: false });

  if (tripsError) {
    console.error("Failed to load trips:", tripsError.message);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("home_name, home_lat, home_lng")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Failed to load profile:", profileError.message);
  }

  const parks = await getNationalParks();

  // --- Stats ---------------------------------------------------------

  const visitedPlaces = places.filter((p) => p.status === "visited");

  const counts = {
    countriesVisited: places.filter((p) => p.type === "country" && p.status === "visited").length,
    countriesWantToVisit: places.filter((p) => p.type === "country" && p.status === "want_to_visit").length,
    statesVisited: places.filter((p) => p.type === "us_state" && p.status === "visited").length,
    parksVisited: places.filter((p) => p.type === "national_park" && p.status === "visited").length,
    unescoVisited: places.filter((p) => p.type === "unesco_site" && p.status === "visited").length,
  };

  const home =
    profile?.home_lat != null && profile?.home_lng != null
      ? { name: profile.home_name, lat: profile.home_lat, lng: profile.home_lng }
      : null;

  let furthestPlace: { name: string; km: number } | null = null;
  let averageDistanceKm: number | null = null;

  if (home) {
    const withDistance = visitedPlaces
      .filter((p): p is PlaceRow & { lat: number; lng: number } => p.lat != null && p.lng != null)
      .map((p) => ({ name: p.name, km: distanceKm(home, { lat: p.lat, lng: p.lng }) }));

    if (withDistance.length > 0) {
      furthestPlace = withDistance.reduce((a, b) => (b.km > a.km ? b : a));
      averageDistanceKm =
        withDistance.reduce((sum, p) => sum + p.km, 0) / withDistance.length;
    }
  }

  const countryStats = await getCountryStats();
  let worldCoverage: {
    populationPercent: number;
    areaPercent: number;
    languages: string[];
    currencies: string[];
  } | null = null;

  if (countryStats) {
    const visitedCountries = places.filter((p) => p.type === "country" && p.status === "visited");
    let population = 0;
    let area = 0;
    const languages = new Set<string>();
    const currencies = new Set<string>();

    for (const place of visitedCountries) {
      const data = countryStats.byRefCode.get(place.ref_code);
      if (!data) continue;
      population += data.population;
      area += data.area;
      for (const lang of data.languages) languages.add(lang);
      for (const currency of data.currencies) currencies.add(currency);
    }

    worldCoverage = {
      populationPercent: (population / countryStats.worldPopulation) * 100,
      areaPercent: (area / countryStats.worldArea) * 100,
      languages: [...languages].sort(),
      currencies: [...currencies].sort(),
    };
  }

  // One request per dated visited place - fine at personal scale, and
  // each is cached for a year (see src/lib/weather.ts).
  const weatherEntries = (
    await Promise.all(
      visitedPlaces
        .filter((p) => p.lat != null && p.lng != null && p.trips?.start_date)
        .map(async (p) => {
          const weather = await getHistoricalWeather(p.lat!, p.lng!, p.trips!.start_date!);
          if (!weather) return null;
          return { placeName: p.name, date: p.trips!.start_date!, ...weather };
        })
    )
  ).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return (
    <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
      <DashboardMaps
        userId={user.id}
        countryStatuses={statusesByType.country}
        stateStatuses={statusesByType.us_state}
        trips={trips ?? []}
        parks={parks}
        parkStatuses={statusesByType.national_park}
        unescoStatuses={statusesByType.unesco_site}
      />
      <StatsSidebar
        counts={counts}
        home={home}
        furthestPlace={furthestPlace}
        averageDistanceKm={averageDistanceKm}
        worldCoverage={worldCoverage}
        weatherEntries={weatherEntries}
      />
    </div>
  );
}
