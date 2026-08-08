import type { Feature, FeatureCollection, Point } from "geojson";

interface NpsPark {
  parkCode: string;
  fullName: string;
  designation: string;
  latitude: string;
  longitude: string;
}

interface NpsParksResponse {
  data: NpsPark[];
}

const NPS_PARKS_ENDPOINT = "https://developer.nps.gov/api/v1/parks?limit=600";
const ONE_DAY_SECONDS = 60 * 60 * 24;

const EMPTY: FeatureCollection<Point> = { type: "FeatureCollection", features: [] };

/**
 * Fetched live from the NPS API rather than seeded, unlike UNESCO sites -
 * see docs/ARCHITECTURE.md#national-parks-and-unesco-sites for why the two
 * layers use different data strategies. Cached for a day via Next's fetch
 * cache since park data changes essentially never.
 */
export async function getNationalParks(): Promise<FeatureCollection<Point>> {
  const apiKey = process.env.NPS_API_KEY;
  if (!apiKey) {
    console.error("NPS_API_KEY is not set - the national parks layer will be empty.");
    return EMPTY;
  }

  const response = await fetch(`${NPS_PARKS_ENDPOINT}&api_key=${apiKey}`, {
    next: { revalidate: ONE_DAY_SECONDS },
  });

  if (!response.ok) {
    console.error(`NPS API request failed with status ${response.status}.`);
    return EMPTY;
  }

  const body = (await response.json()) as NpsParksResponse;

  // The NPS API covers every park service unit (historic sites, monuments,
  // seashores, ...) - "National Park" is the specific designation for the
  // ~63 parks this layer is meant to show.
  const features: Feature<Point>[] = body.data
    .filter((park) => park.designation === "National Park" && park.latitude && park.longitude)
    .map((park) => ({
      type: "Feature",
      id: park.parkCode,
      properties: { name: park.fullName },
      geometry: {
        type: "Point",
        coordinates: [parseFloat(park.longitude), parseFloat(park.latitude)],
      },
    }));

  return { type: "FeatureCollection", features };
}
