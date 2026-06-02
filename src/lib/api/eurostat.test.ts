import { describe, it, expect } from "vitest";
import { parseEurostat, formatEuroPeriod } from "./eurostat";

describe("formatEuroPeriod", () => {
  it("formats quarters, months and years", () => {
    expect(formatEuroPeriod("2026-Q1")).toBe("T1 2026");
    expect(formatEuroPeriod("2026-01")).toBe("ene 2026");
    expect(formatEuroPeriod("2025-12")).toBe("dic 2025");
    expect(formatEuroPeriod("2026")).toBe("2026");
  });
});

describe("parseEurostat", () => {
  it("orders by time position and aligns values, with nulls for gaps", () => {
    const series = parseEurostat({
      dimension: { time: { category: { index: { "2026-01": 0, "2026-02": 1, "2026-03": 2 } } } },
      value: { "0": 10.3, "2": 10.1 }, // position 1 missing
    });
    expect(series.labels).toEqual(["2026-01", "2026-02", "2026-03"]);
    expect(series.values).toEqual([10.3, null, 10.1]);
  });

  it("handles an empty response", () => {
    expect(parseEurostat({})).toEqual({ labels: [], values: [] });
  });
});
