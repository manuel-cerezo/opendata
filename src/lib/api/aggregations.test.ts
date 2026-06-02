import { describe, it, expect } from "vitest";
import { computeStats } from "./aggregations";
import type { DatasetSummary } from "./types";

function makeDataset(overrides: Partial<DatasetSummary>): DatasetSummary {
  return {
    id: "id",
    uri: "uri",
    title: "t",
    description: "",
    sectors: [],
    formats: [],
    keywords: [],
    publisherCode: null,
    publisherUri: null,
    issued: null,
    modified: null,
    year: null,
    distributionCount: 0,
    ...overrides,
  };
}

describe("computeStats", () => {
  const datasets = [
    makeDataset({ sectors: ["salud"], formats: ["CSV"], publisherCode: "A", year: 2023, distributionCount: 2 }),
    makeDataset({ sectors: ["salud", "economia"], formats: ["CSV", "JSON"], publisherCode: "A", year: 2023, distributionCount: 1 }),
    makeDataset({ sectors: ["economia"], formats: ["JSON"], publisherCode: "B", year: 2024, distributionCount: 3 }),
  ];

  const stats = computeStats(datasets);

  it("counts sample size and distributions", () => {
    expect(stats.sampleSize).toBe(3);
    expect(stats.totalDistributions).toBe(6);
  });

  it("counts unique publishers and formats", () => {
    expect(stats.uniquePublishers).toBe(2);
    expect(stats.uniqueFormats).toBe(2);
  });

  it("aggregates by sector sorted descending", () => {
    expect(stats.bySector[0]).toMatchObject({ key: "salud", value: 2 });
    expect(stats.bySector.find((c) => c.key === "economia")?.value).toBe(2);
  });

  it("labels sectors with their Spanish names", () => {
    expect(stats.bySector.find((c) => c.key === "salud")?.label).toBe("Salud");
  });

  it("aggregates by publisher", () => {
    expect(stats.byPublisher[0]).toMatchObject({ key: "A", value: 2 });
  });

  it("produces a chronological year series within range", () => {
    expect(stats.byYear.map((c) => c.key)).toEqual(["2023", "2024"]);
    expect(stats.byYear[0].value).toBe(2);
  });

  it("filters out-of-range years", () => {
    const withBadYear = computeStats([makeDataset({ year: 1850 }), makeDataset({ year: 2023 })]);
    expect(withBadYear.byYear.map((c) => c.key)).toEqual(["2023"]);
  });
});
