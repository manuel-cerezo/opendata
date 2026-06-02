import type { DatasetSummary } from "./types";
import { sectorLabel } from "@/constants/sectors";

export interface Count {
  key: string;
  label: string;
  value: number;
}

export interface CatalogStats {
  sampleSize: number;
  totalDistributions: number;
  uniquePublishers: number;
  uniqueFormats: number;
  bySector: Count[];
  byFormat: Count[];
  byPublisher: Count[];
  byYear: Count[];
}

function tally(
  datasets: DatasetSummary[],
  pick: (d: DatasetSummary) => string[],
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const dataset of datasets) {
    for (const key of pick(dataset)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return counts;
}

function toSorted(
  counts: Map<string, number>,
  label: (key: string) => string,
  limit?: number,
): Count[] {
  const sorted = Array.from(counts.entries())
    .map(([key, value]) => ({ key, label: label(key), value }))
    .sort((a, b) => b.value - a.value);
  return limit ? sorted.slice(0, limit) : sorted;
}

export function computeStats(datasets: DatasetSummary[]): CatalogStats {
  const sectorCounts = tally(datasets, (d) => d.sectors);
  const formatCounts = tally(datasets, (d) => d.formats);
  const publisherCounts = tally(datasets, (d) =>
    d.publisherCode ? [d.publisherCode] : [],
  );
  const yearCounts = tally(datasets, (d) =>
    d.year != null ? [String(d.year)] : [],
  );

  return {
    sampleSize: datasets.length,
    totalDistributions: datasets.reduce((sum, d) => sum + d.distributionCount, 0),
    uniquePublishers: publisherCounts.size,
    uniqueFormats: formatCounts.size,
    bySector: toSorted(sectorCounts, sectorLabel),
    byFormat: toSorted(formatCounts, (k) => k, 12),
    byPublisher: toSorted(publisherCounts, (k) => k, 12),
    byYear: toSorted(yearCounts, (k) => k)
      .sort((a, b) => Number(a.key) - Number(b.key))
      .filter((c) => Number(c.key) >= 2000 && Number(c.key) <= new Date().getFullYear()),
  };
}
