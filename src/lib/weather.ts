const OPEN_METEO_ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

interface OpenMeteoResponse {
  daily?: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export interface DayWeather {
  maxC: number;
  minC: number;
}

/**
 * Historical weather for a single day - immutable once recorded, so it's
 * cached for a year (effectively "forever" for our purposes) rather than
 * refetched on every dashboard load.
 */
export async function getHistoricalWeather(
  lat: number,
  lng: number,
  date: string
): Promise<DayWeather | null> {
  const url = `${OPEN_METEO_ARCHIVE_URL}?latitude=${lat}&longitude=${lng}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

  const response = await fetch(url, { next: { revalidate: ONE_YEAR_SECONDS } });
  if (!response.ok) {
    console.error(`Open-Meteo request failed with status ${response.status}.`);
    return null;
  }

  const body = (await response.json()) as OpenMeteoResponse;
  const maxC = body.daily?.temperature_2m_max?.[0];
  const minC = body.daily?.temperature_2m_min?.[0];

  if (maxC === undefined || minC === undefined) return null;
  return { maxC, minC };
}
