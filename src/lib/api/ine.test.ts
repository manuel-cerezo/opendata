import { describe, it, expect } from "vitest";
import { formatPeriod, normalizeIneSerie } from "./ine";

describe("formatPeriod", () => {
  // 2025-09-30T22:00:00Z -> UTC September (month index 8) -> Q3
  const iso = new Date(1759269600000).toISOString();

  it("formats months in Spanish", () => {
    expect(formatPeriod(iso, "month")).toBe("sep 2025");
  });

  it("formats quarters", () => {
    expect(formatPeriod(iso, "quarter")).toBe("T3 2025");
  });

  it("formats years", () => {
    expect(formatPeriod(iso, "year")).toBe("2025");
  });

  it("returns the input for an invalid date", () => {
    expect(formatPeriod("not-a-date", "month")).toBe("not-a-date");
  });
});

describe("normalizeIneSerie", () => {
  it("maps INE data items to typed points", () => {
    const serie = normalizeIneSerie({
      COD: "IPC290750",
      Nombre: "  Nacional. Índice general. Variación anual.  ",
      Data: [
        { Fecha: 1759269600000, Anyo: 2025, FK_Periodo: 22, Valor: 3.0472 },
        { Fecha: 1761966000000, Anyo: 2025, FK_Periodo: 23, Valor: null },
      ],
    });
    expect(serie.cod).toBe("IPC290750");
    expect(serie.name).toBe("Nacional. Índice general. Variación anual.");
    expect(serie.points).toHaveLength(2);
    expect(serie.points[0]).toMatchObject({ year: 2025, value: 3.0472 });
    expect(serie.points[0].date.startsWith("2025-")).toBe(true);
    expect(serie.points[1].value).toBeNull();
  });

  it("handles a missing Data array", () => {
    expect(normalizeIneSerie({ COD: "X", Nombre: "Y" }).points).toEqual([]);
  });
});
