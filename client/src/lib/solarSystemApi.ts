/**
 * Solar System Open API + NASA APOD integration
 * Endpoint: https://api.le-systeme-solaire.net/rest/bodies/{id}
 * NASA APOD: https://api.nasa.gov/planetary/apod (demo key)
 *
 * All calls are async with graceful fallback to local static data.
 */

// ─── Strict Types ────────────────────────────────────────────────────────────

export interface SolarBodyMass {
  massValue: number;
  massExponent: number;
}

export interface SolarBodyVol {
  volValue: number;
  volExponent: number;
}

export interface SolarBodyApiResponse {
  id: string;
  name: string;
  englishName: string;
  isPlanet: boolean;
  gravity: number;
  meanRadius: number;
  sideralOrbit: number; // orbital period in Earth days
  sideralRotation: number; // rotation period in hours
  avgTemp: number; // in Kelvin
  mass: SolarBodyMass | null;
  vol: SolarBodyVol | null;
  moons: Array<{ moon: string; rel: string }> | null;
  discoveredBy: string;
  discoveryDate: string;
  alternativeName: string;
  aroundPlanet: { planet: string; rel: string } | null;
  bodyType: string;
}

export interface GalacticFact {
  planetId: string;
  gravity: string;
  orbitalPeriod: string;
  rotationPeriod: string;
  avgTempCelsius: string;
  moonCount: number;
  radiusKm: string;
  massDisplay: string;
  funApiLine: string; // synthesised one-liner for the UI
}

export interface NasaApodResponse {
  date: string;
  explanation: string;
  hdurl?: string;
  media_type: "image" | "video";
  title: string;
  url: string;
  copyright?: string;
}

// ─── ID mapping: our planet IDs → le-systeme-solaire IDs ─────────────────────

const SOLAR_API_ID_MAP: Record<string, string> = {
  mercury: "mercure",
  venus: "venus",
  earth: "terre",
  mars: "mars",
  jupiter: "jupiter",
  saturn: "saturne",
  uranus: "uranus",
  neptune: "neptune",
};

// ─── In-memory cache so we don't re-fetch on every render ────────────────────

const factCache = new Map<string, GalacticFact>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function kelvinToCelsius(k: number): string {
  if (k === 0) return "Unknown";
  return `${Math.round(k - 273.15)}°C`;
}

function formatMass(mass: SolarBodyMass | null): string {
  if (!mass) return "Unknown";
  return `${mass.massValue.toFixed(2)} × 10^${mass.massExponent} kg`;
}

function buildFunLine(body: SolarBodyApiResponse): string {
  const moons = body.moons?.length ?? 0;
  const temp = kelvinToCelsius(body.avgTemp);
  const orbit = body.sideralOrbit > 0
    ? `orbits the Sun every ${Math.round(body.sideralOrbit)} Earth days`
    : "has a very long orbit";
  const moonStr = moons === 0 ? "no moons" : moons === 1 ? "1 moon" : `${moons} moons`;
  return `${body.englishName} ${orbit}, has ${moonStr}, and averages ${temp}!`;
}

// ─── Main fetch function ──────────────────────────────────────────────────────

export async function fetchGalacticFact(planetId: string): Promise<GalacticFact | null> {
  // Return from cache if available
  const cached = factCache.get(planetId);
  if (cached) return cached;

  const apiId = SOLAR_API_ID_MAP[planetId];
  if (!apiId) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 s timeout

    const res = await fetch(
      `https://api.le-systeme-solaire.net/rest/bodies/${apiId}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data: SolarBodyApiResponse = await res.json() as SolarBodyApiResponse;

    const fact: GalacticFact = {
      planetId,
      gravity: data.gravity > 0 ? `${data.gravity.toFixed(2)} m/s²` : "Unknown",
      orbitalPeriod:
        data.sideralOrbit > 0
          ? `${Math.round(data.sideralOrbit)} Earth days`
          : "Unknown",
      rotationPeriod:
        data.sideralRotation !== 0
          ? `${Math.abs(data.sideralRotation).toFixed(1)} hours`
          : "Unknown",
      avgTempCelsius: kelvinToCelsius(data.avgTemp),
      moonCount: data.moons?.length ?? 0,
      radiusKm:
        data.meanRadius > 0
          ? `${Math.round(data.meanRadius).toLocaleString()} km`
          : "Unknown",
      massDisplay: formatMass(data.mass),
      funApiLine: buildFunLine(data),
    };

    factCache.set(planetId, fact);
    return fact;
  } catch {
    // Network error or timeout → return null, caller falls back to static data
    return null;
  }
}

// ─── NASA APOD (Astronomy Picture of the Day) ────────────────────────────────

const NASA_DEMO_KEY = "DEMO_KEY"; // free, rate-limited to 30 req/hr per IP

let apodCache: NasaApodResponse | null = null;

export async function fetchNasaApod(): Promise<NasaApodResponse | null> {
  if (apodCache) return apodCache;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_DEMO_KEY}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const data: NasaApodResponse = await res.json() as NasaApodResponse;
    if (data.media_type !== "image") return null; // skip video APODs

    apodCache = data;
    return data;
  } catch {
    return null;
  }
}
