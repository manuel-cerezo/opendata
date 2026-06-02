import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DatasetCard } from "./DatasetCard";
import type { DatasetSummary } from "@/lib/api/types";

const dataset: DatasetSummary = {
  id: "e05068001-mapas-de-ruido",
  uri: "https://datos.gob.es/catalogo/e05068001-mapas-de-ruido",
  title: "Mapas estratégicos de ruido",
  description: "Mapas de ruido ambiental.",
  sectors: ["medio-ambiente"],
  formats: ["CSV", "GEOJSON"],
  keywords: ["ruido"],
  publisherCode: "L01281317",
  publisherUri: null,
  issued: "2026-01-07T00:00:00.000Z",
  modified: null,
  year: 2026,
  distributionCount: 2,
};

function renderCard() {
  return render(
    <MemoryRouter>
      <DatasetCard dataset={dataset} />
    </MemoryRouter>,
  );
}

describe("DatasetCard", () => {
  it("shows the title, sector label and formats", () => {
    renderCard();
    expect(screen.getByText("Mapas estratégicos de ruido")).toBeInTheDocument();
    expect(screen.getByText("Medio ambiente")).toBeInTheDocument();
    expect(screen.getByText("CSV")).toBeInTheDocument();
    expect(screen.getByText("GEOJSON")).toBeInTheDocument();
  });

  it("links to the dataset detail route", () => {
    renderCard();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/datasets/e05068001-mapas-de-ruido");
  });
});
