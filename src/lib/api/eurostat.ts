import { ApiError } from "./client";

const EU_BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";

export interface EuroSeries {
  /** Raw Eurostat time codes (e.g. `2026-Q1`, `2026-01`, `2026`). */
  labels: string[];
  values: (number | null)[];
}

interface JsonStat {
  dimension?: { time?: { category?: { index?: Record<string, number> } } };
  value?: Record<string, number>;
}

const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Human-friendly label for a Eurostat time code. */
export function formatEuroPeriod(code: string): string {
  const quarter = code.match(/^(\d{4})-Q([1-4])$/);
  if (quarter) return `T${quarter[2]} ${quarter[1]}`;
  const month = code.match(/^(\d{4})-(\d{2})$/);
  if (month) return `${MONTHS_ES[Number(month[2]) - 1] ?? month[2]} ${month[1]}`;
  return code;
}

/**
 * Parse a JSON-stat response into an ordered series. Callers fix every
 * dimension to a single value except `time`, so the flat value index equals
 * the time position.
 */
export function parseEurostat(json: JsonStat): EuroSeries {
  const index = json.dimension?.time?.category?.index ?? {};
  const value = json.value ?? {};
  const ordered = Object.entries(index).sort((a, b) => a[1] - b[1]);
  return {
    labels: ordered.map(([code]) => code),
    values: ordered.map(([, pos]) => {
      const v = value[String(pos)];
      return typeof v === "number" ? v : null;
    }),
  };
}

export async function getEurostatSeries(
  dataset: string,
  params: Record<string, string>,
  lastN: number,
  signal?: AbortSignal,
): Promise<EuroSeries> {
  const url = new URL(`${EU_BASE}/${dataset}`);
  url.searchParams.set("format", "JSON");
  for (const [key, val] of Object.entries(params)) url.searchParams.set(key, val);
  url.searchParams.set("lastTimePeriod", String(lastN));

  let res: Response;
  try {
    res = await fetch(url.toString(), { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("No se pudo conectar con la API de Eurostat.");
  }
  if (!res.ok) {
    throw new ApiError(`Eurostat respondió con un error (${res.status}).`, res.status);
  }
  return parseEurostat(await res.json());
}
