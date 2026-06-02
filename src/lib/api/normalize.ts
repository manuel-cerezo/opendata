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
export function lastUriSegment(uri: unknown): string | null {
  if (typeof uri !== "string" || !uri) return null;
  const clean = uri.split(/[?#]/)[0].replace(/\/+$/, "");
  const seg = clean.substring(clean.lastIndexOf("/") + 1);
  return seg || null;
}

/**
 * The apidata returns reference fields (theme, publisher) either as plain URI
 * strings or as objects like `{ _about, value }`. Resolve them to a URI string.
 */
export function coerceUri(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const o = value as { _about?: unknown; value?: unknown };
    if (typeof o._about === "string") return o._about;
    if (typeof o.value === "string") return o.value;
  }
  return null;
}

/**
 * Map verbose MIME/file-type codes to short, friendly labels (e.g. the OOXML
 * spreadsheet type → `XLSX`). Falls back to the raw code uppercased.
 */
const FORMAT_ALIASES: Record<string, string> = {
  "PLAIN": "TXT",
  "GEO+JSON": "GEOJSON",
  "VND.GEO+JSON": "GEOJSON",
  "VND.MS-EXCEL": "XLS",
  "VND.MS-POWERPOINT": "PPT",
  "MSWORD": "DOC",
  "VND.OASIS.OPENDOCUMENT.SPREADSHEET": "ODS",
  "VND.OASIS.OPENDOCUMENT.TEXT": "ODT",
  "VND.OASIS.OPENDOCUMENT.PRESENTATION": "ODP",
  "VND.GOOGLE-EARTH.KML+XML": "KML",
  "VND.GOOGLE-EARTH.KMZ": "KMZ",
  "OCTET-STREAM": "BIN",
  "X-PC-AXIS": "PC-AXIS",
};

export function prettifyFormat(raw: string): string {
  let code = raw.toUpperCase().replace(/^X-/, "");
  // Office Open XML types vary only by their *ml subtype.
  if (code.includes("SPREADSHEETML")) return "XLSX";
  if (code.includes("WORDPROCESSINGML")) return "DOCX";
  if (code.includes("PRESENTATIONML")) return "PPTX";
  if (FORMAT_ALIASES[code]) return FORMAT_ALIASES[code];
  // Drop a leading vendor prefix like `VND.OPENXMLFORMATS-` if still present.
  code = code.replace(/^VND\.[A-Z0-9-]+\./, "");
  return code;
}

/**
 * Derive a short, friendly format code from a distribution `format`, which may
 * be a file-type URI string (`.../file-type/CSV`) or a MIME object
 * (`{ value: "text/pc-axis" }`).
 */
export function extractFormatCode(format: unknown): string | null {
  if (typeof format === "string") {
    const seg = lastUriSegment(format);
    return seg ? prettifyFormat(seg) : null;
  }
  if (format && typeof format === "object") {
    const o = format as { value?: unknown; _about?: unknown };
    if (typeof o.value === "string" && o.value.includes("/")) {
      const subtype = o.value.split("/").pop() ?? o.value;
      return subtype ? prettifyFormat(subtype) : null;
    }
    // The `_about` of a format object ends in `/format`, which is not useful.
    const seg = lastUriSegment(o._about);
    return seg && seg.toLowerCase() !== "format" ? prettifyFormat(seg) : null;
  }
  return null;
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
    .map((entry) => lastUriSegment(coerceUri(entry)))
    .filter((v): v is string => !!v);
}

function extractFormats(distribution: RawDataset["distribution"]): string[] {
  const formats = toArray<RawDistribution>(distribution)
    .map((d) => extractFormatCode(d.format))
    .filter((v): v is string => !!v);
  return Array.from(new Set(formats));
}

export function normalizeDataset(raw: RawDataset): DatasetSummary {
  const publisherUri = coerceUri(toArray(raw.publisher)[0]);
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
    format: extractFormatCode(d.format),
    accessURL: d.accessURL ?? null,
    byteSize: d.byteSize != null ? Number(d.byteSize) : null,
  }));
  return { ...summary, distributions, license: raw.license ?? null };
}
