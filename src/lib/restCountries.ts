interface RestCountry {
  codes: { ccn3: string };
  population: number;
  area: { kilometers: number };
  languages: { name: string }[];
  currencies: { name: string }[];
}

interface RestCountriesResponse {
  data: {
    objects: RestCountry[];
    meta: { total: number; count: number; limit: number; offset: number; more: boolean };
  };
}

const REST_COUNTRIES_URL = "https://api.restcountries.com/countries/v5";
// The free plan caps requests at 100 objects; there are ~254 countries,
// so this always takes a few pages. See docs/ARCHITECTURE.md.
const PAGE_SIZE = 100;
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export interface CountryStatsData {
  worldPopulation: number;
  worldArea: number;
  byRefCode: Map<string, { population: number; area: number; languages: string[]; currencies: string[] }>;
}

/**
 * REST Countries moved to a keyed, paginated API (restcountries.com/sign-up,
 * v5) after this project's original plan assumed a free, unpaginated v3.1
 * endpoint - see docs/ARCHITECTURE.md#population-area-language-and-currency-coverage.
 * Returns null (rather than throwing) when no key is configured, so the
 * coverage stats simply don't render instead of breaking the page.
 */
export async function getCountryStats(): Promise<CountryStatsData | null> {
  const apiKey = process.env.RESTCOUNTRIES_API_KEY;
  if (!apiKey) {
    console.error(
      "RESTCOUNTRIES_API_KEY is not set - population/area/language/currency coverage stats will be hidden."
    );
    return null;
  }

  const allCountries: RestCountry[] = [];
  let offset = 0;

  while (true) {
    const url = `${REST_COUNTRIES_URL}?api-key=${apiKey}&limit=${PAGE_SIZE}&offset=${offset}`;
    const response = await fetch(url, { next: { revalidate: ONE_WEEK_SECONDS } });

    if (!response.ok) {
      console.error(`REST Countries request failed with status ${response.status}.`);
      return allCountries.length > 0 ? summarize(allCountries) : null;
    }

    const body = (await response.json()) as RestCountriesResponse;
    allCountries.push(...body.data.objects);

    if (!body.data.meta.more) break;
    offset += PAGE_SIZE;
  }

  return summarize(allCountries);
}

function summarize(countries: RestCountry[]): CountryStatsData {
  let worldPopulation = 0;
  let worldArea = 0;
  const byRefCode: CountryStatsData["byRefCode"] = new Map();

  for (const country of countries) {
    const population = country.population ?? 0;
    const area = country.area?.kilometers ?? 0;
    worldPopulation += population;
    worldArea += area;

    // ccn3 (numeric ISO-3166-1) matches our ref_code for the "country"
    // place type directly - same code world-atlas itself uses, so no
    // lookup table is needed. Empty for disputed/unrecognized entries.
    if (country.codes?.ccn3) {
      byRefCode.set(country.codes.ccn3, {
        population,
        area,
        languages: (country.languages ?? []).map((l) => l.name),
        currencies: (country.currencies ?? []).map((c) => c.name),
      });
    }
  }

  return { worldPopulation, worldArea, byRefCode };
}
