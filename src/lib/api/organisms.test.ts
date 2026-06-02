import { describe, it, expect } from "vitest";
import { buildOrgNameQuery, parseOrgNames } from "./organisms";

describe("buildOrgNameQuery", () => {
  it("wraps each code as an organism resource URI inside VALUES", () => {
    const q = buildOrgNameQuery(["E05068001", "L01281317"]);
    expect(q).toContain("foaf:name");
    expect(q).toContain(
      "<http://datos.gob.es/recurso/sector-publico/org/Organismo/E05068001>",
    );
    expect(q).toContain(
      "<http://datos.gob.es/recurso/sector-publico/org/Organismo/L01281317>",
    );
  });
});

describe("parseOrgNames", () => {
  it("maps DIR3 codes to names from SPARQL bindings", () => {
    const result = parseOrgNames({
      results: {
        bindings: [
          {
            org: { value: "http://datos.gob.es/recurso/sector-publico/org/Organismo/E05068001" },
            name: { value: "Ministerio para la Transición Ecológica y el Reto Demográfico" },
          },
          {
            org: { value: "http://datos.gob.es/recurso/sector-publico/org/Organismo/L01281317" },
            name: { value: "Ayuntamiento de San Lorenzo de El Escorial" },
          },
        ],
      },
    });
    expect(result).toEqual({
      E05068001: "Ministerio para la Transición Ecológica y el Reto Demográfico",
      L01281317: "Ayuntamiento de San Lorenzo de El Escorial",
    });
  });

  it("ignores incomplete bindings and empty results", () => {
    expect(parseOrgNames({})).toEqual({});
    expect(
      parseOrgNames({ results: { bindings: [{ org: { value: "x/Y" } }] } }),
    ).toEqual({});
  });
});
