import type {
  LangValue,
  RawDataset,
  RawDistribution,
  DatasetSummary,
  DatasetDetail,
} from "./types";

export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/** Resolve a possibly multilingual value, preferring the requested language. */
export function pickLang(value: LangValue | LangValue[] | undefined, lang = "es"): string {
  const arr = toArray(value);
  if (arr.length === 0) return "";
  const objects = arr.filter((v): v is { _value: string; _lang?: string } => typeof v === "object");
  if (objects.length > 0) {
    const match = objects.find((v) => v._lang === lang) ?? objects[0];
    return match._value ?? "";
  }
  return String(arr[0] ?? "");
}

/** Final non-empty path segment of a URI (used for slugs / sector keys). */
export function lastUriSegment(uri: string | undefined | null): string | null {
  if (!uri) return null;
  const clean = uri.split(/[?#]/)[0].replace(/\/+$/, "");
  const seg = clean.substring(clean.lastIndexOf("/") + 1);
  return seg || null;
}

const SPANISH_MONTHS: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, sept: 8, oct: 9, nov: 10, dic: 11,
};

/**
 * datos.gob.es returns dates such as `mié, 07 ene 2026 09:49:50 GMT+0000`
 * with Spanish month abbreviations that `Date` cannot parse natively.
 */
export function parseSpanishDate(raw: string | undefined | null): {
  iso: string | null;
  year: number | null;
} {
  if (!raw) return { iso: null, year: null };
  const match = raw.match(/(\d{1,2})\s+([a-záéíóúñ]+)\.?\s+(\d{4})/i);
  if (!match) {
    const fallback = new Date(raw);
    return Number.isNaN(fallback.getTime())
      ? { iso: null, year: null }
      : { iso: fallback.toISOString(), year: fallback.getUTCFullYear() };
  }
  const day = Number(match[1]);
  const month = SPANISH_MONTHS[match[2].toLowerCase().slice(0, 4)] ?? SPANISH_MONTHS[match[2].toLowerCase().slice(0, 3)];
  const year = Number(match[3]);
  if (month == null) return { iso: null, year };
  const date = new Date(Date.UTC(year, month, day));
  return { iso: date.toISOString(), year };
}

function extractSectors(theme: RawDataset["theme"]): string[] {
  return toArray(theme)
    .map((uri) => lastUriSegment(uri))
    .filter((v): v is string => !!v);
}

function extractFormats(distribution: RawDataset["distribution"]): string[] {
  const formats = toArray<RawDistribution>(distribution)
    .map((d) => lastUriSegment(d.format)?.toUpperCase())
    .filter((v): v is string => !!v);
  return Array.from(new Set(formats));
}

export function normalizeDataset(raw: RawDataset): DatasetSummary {
  const publisherUri = toArray(raw.publisher)[0] ?? null;
  const { iso, year } = parseSpanishDate(raw.issued);
  return {
    id: lastUriSegment(raw._about) ?? "",
    uri: raw._about,
    title: pickLang(raw.title) || "(sin título)",
    description: pickLang(raw.description),
    sectors: extractSectors(raw.theme),
    formats: extractFormats(raw.distribution),
    keywords: toArray(raw.keyword).map((k) => pickLang(k)).filter(Boolean),
    publisherCode: lastUriSegment(publisherUri),
    publisherUri,
    issued: iso,
    modified: parseSpanishDate(raw.modified).iso,
    year,
    distributionCount: toArray(raw.distribution).length,
  };
}

export function normalizeDatasetDetail(raw: RawDataset): DatasetDetail {
  const summary = normalizeDataset(raw);
  const distributions = toArray<RawDistribution>(raw.distribution).map((d) => ({
    title: pickLang(d.title) || "Distribución",
    format: lastUriSegment(d.format)?.toUpperCase() ?? null,
    accessURL: d.accessURL ?? null,
    byteSize: d.byteSize != null ? Number(d.byteSize) : null,
  }));
  return { ...summary, distributions, license: raw.license ?? null };
}
