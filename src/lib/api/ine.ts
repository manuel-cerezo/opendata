import { ApiError } from "./client";

const INE_BASE = "https://servicios.ine.es/wstempus/js/ES";

export type PeriodKind = "month" | "quarter" | "year";

export interface InePoint {
  /** ISO date of the observation (from the INE `Fecha` epoch). */
  date: string;
  year: number;
  value: number | null;
}

export interface IneSerie {
  cod: string;
  name: string;
  points: InePoint[];
}

interface RawIneItem {
  Fecha?: number;
  Anyo?: number;
  FK_Periodo?: number;
  Valor?: number | null;
}
interface RawIneSerie {
  COD?: string;
  Nombre?: string;
  Data?: RawIneItem[];
}

const MONTHS_ES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Build a compact period label from an observation, e.g. `T3 2025`, `sep 2025`. */
export function formatPeriod(iso: string, period: PeriodKind): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  if (period === "year") return String(year);
  if (period === "quarter") return `T${Math.floor(month / 3) + 1} ${year}`;
  return `${MONTHS_ES[month]} ${year}`;
}

/** Normalise a raw INE series into a typed, chart-friendly shape. */
export function normalizeIneSerie(raw: RawIneSerie): IneSerie {
  const points = (raw.Data ?? []).map<InePoint>((item) => {
    const date = item.Fecha ? new Date(item.Fecha) : null;
    return {
      date: date ? date.toISOString() : String(item.Anyo ?? ""),
      year: item.Anyo ?? (date ? date.getUTCFullYear() : 0),
      value: typeof item.Valor === "number" ? item.Valor : null,
    };
  });
  return { cod: raw.COD ?? "", name: (raw.Nombre ?? "").trim(), points };
}

export async function getIneSerie(
  cod: string,
  nult: number,
  signal?: AbortSignal,
): Promise<IneSerie> {
  const url = `${INE_BASE}/DATOS_SERIE/${encodeURIComponent(cod)}?nult=${nult}`;
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("No se pudo conectar con la API del INE.");
  }
  if (!res.ok) {
    throw new ApiError(`El INE respondió con un error (${res.status}).`, res.status);
  }
  return normalizeIneSerie(await res.json());
}

/** Fetch several INE series in parallel (used per indicator). */
export function getIneSeries(
  cods: string[],
  nult: number,
  signal?: AbortSignal,
): Promise<IneSerie[]> {
  return Promise.all(cods.map((cod) => getIneSerie(cod, nult, signal)));
}
