import { describe, it, expect } from "vitest";
import {
  pickLang,
  lastUriSegment,
  parseSpanishDate,
  prettifyFormat,
  toArray,
  normalizeDataset,
} from "./normalize";
import type { RawDataset } from "./types";

describe("toArray", () => {
  it("wraps scalars and passes through arrays", () => {
    expect(toArray("a")).toEqual(["a"]);
    expect(toArray(["a", "b"])).toEqual(["a", "b"]);
    expect(toArray(undefined)).toEqual([]);
    expect(toArray(null)).toEqual([]);
  });
});

describe("pickLang", () => {
  it("prefers the requested language", () => {
    const value = [
      { _value: "Hola", _lang: "es" },
      { _value: "Hello", _lang: "en" },
    ];
    expect(pickLang(value, "es")).toBe("Hola");
    expect(pickLang(value, "en")).toBe("Hello");
  });

  it("falls back to the first object when language is missing", () => {
    expect(pickLang([{ _value: "Solo", _lang: "fr" }], "es")).toBe("Solo");
  });

  it("handles plain strings and empty input", () => {
    expect(pickLang("texto")).toBe("texto");
    expect(pickLang(undefined)).toBe("");
  });
});

describe("lastUriSegment", () => {
  it("extracts the final path segment", () => {
    expect(lastUriSegment("http://datos.gob.es/kos/sector-publico/sector/medio-ambiente")).toBe(
      "medio-ambiente",
    );
    expect(lastUriSegment("http://x/org/Organismo/L01281317")).toBe("L01281317");
  });

  it("ignores query strings and trailing slashes", () => {
    expect(lastUriSegment("http://x/dataset.json?_page=0")).toBe("dataset.json");
    expect(lastUriSegment("http://x/foo/")).toBe("foo");
    expect(lastUriSegment(null)).toBeNull();
  });
});

describe("parseSpanishDate", () => {
  it("parses Spanish month abbreviations", () => {
    const { iso, year } = parseSpanishDate("mié, 07 ene 2026 09:49:50 GMT+0000");
    expect(year).toBe(2026);
    expect(iso?.startsWith("2026-01-07")).toBe(true);
  });

  it("parses 'sept' as September", () => {
    expect(parseSpanishDate("lun, 15 sept 2024 00:00:00 GMT+0000").year).toBe(2024);
    expect(parseSpanishDate("lun, 15 sep 2024 00:00:00 GMT+0000").iso?.startsWith("2024-09-15")).toBe(
      true,
    );
  });

  it("returns nulls for empty or unparseable input", () => {
    expect(parseSpanishDate(undefined)).toEqual({ iso: null, year: null });
  });
});

describe("prettifyFormat", () => {
  it("shortens Office Open XML types", () => {
    expect(prettifyFormat("vnd.openxmlformats-officedocument.spreadsheetml.sheet")).toBe("XLSX");
    expect(prettifyFormat("OFFICEDOCUMENT.WORDPROCESSINGML.DOCUMENT")).toBe("DOCX");
    expect(prettifyFormat("vnd.openxmlformats-officedocument.presentationml.presentation")).toBe(
      "PPTX",
    );
  });

  it("maps common aliases and leaves plain codes intact", () => {
    expect(prettifyFormat("plain")).toBe("TXT");
    expect(prettifyFormat("vnd.ms-excel")).toBe("XLS");
    expect(prettifyFormat("CSV")).toBe("CSV");
    expect(prettifyFormat("pc-axis")).toBe("PC-AXIS");
  });
});

describe("normalizeDataset", () => {
  const raw: RawDataset = {
    _about: "https://datos.gob.es/catalogo/e05068001-mapas-de-ruido",
    title: [
      { _value: "Mapas de ruido", _lang: "es" },
      { _value: "Noise maps", _lang: "en" },
    ],
    description: { _value: "Descripción", _lang: "es" },
    theme: [
      "http://datos.gob.es/kos/sector-publico/sector/medio-ambiente",
      "http://datos.gob.es/kos/sector-publico/sector/urbanismo-infraestructuras",
    ],
    distribution: [
      { format: "http://publications.europa.eu/resource/authority/file-type/CSV" },
      { format: "http://publications.europa.eu/resource/authority/file-type/GEOJSON" },
      { format: "http://publications.europa.eu/resource/authority/file-type/CSV" },
    ],
    publisher: "http://datos.gob.es/recurso/sector-publico/org/Organismo/L01281317",
    issued: "mié, 07 ene 2026 09:49:50 GMT+0000",
    keyword: ["ruido", "ambiente"],
  };

  it("maps a raw dataset into the normalised model", () => {
    const d = normalizeDataset(raw);
    expect(d.id).toBe("e05068001-mapas-de-ruido");
    expect(d.title).toBe("Mapas de ruido");
    expect(d.sectors).toEqual(["medio-ambiente", "urbanismo-infraestructuras"]);
    expect(d.formats).toEqual(["CSV", "GEOJSON"]); // deduped + uppercased
    expect(d.publisherCode).toBe("L01281317");
    expect(d.year).toBe(2026);
    expect(d.distributionCount).toBe(3);
    expect(d.keywords).toEqual(["ruido", "ambiente"]);
  });

  it("handles object-shaped format (MIME) and reference fields without throwing", () => {
    const d = normalizeDataset({
      _about: "https://datos.gob.es/catalogo/a02-foo",
      // theme/publisher/format may arrive as objects instead of URI strings
      theme: [{ _about: "http://datos.gob.es/kos/sector-publico/sector/salud" }],
      publisher: { _about: "http://datos.gob.es/recurso/org/Organismo/E05250001" },
      distribution: [
        { format: { _about: "https://x/resource/y/format", type: "IMT", value: "text/pc-axis" } },
        { format: "http://publications.europa.eu/resource/authority/file-type/CSV" },
      ],
    });
    expect(d.sectors).toEqual(["salud"]);
    expect(d.publisherCode).toBe("E05250001");
    expect(d.formats).toEqual(["PC-AXIS", "CSV"]);
  });

  it("provides safe fallbacks for missing fields", () => {
    const d = normalizeDataset({ _about: "https://x/catalogo/foo" });
    expect(d.title).toBe("(sin título)");
    expect(d.sectors).toEqual([]);
    expect(d.formats).toEqual([]);
    expect(d.publisherCode).toBeNull();
    expect(d.year).toBeNull();
  });
});
