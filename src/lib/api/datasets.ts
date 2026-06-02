import { apiGetList } from "./client";
import { normalizeDataset, normalizeDatasetDetail } from "./normalize";
import type { RawDataset, DatasetSummary, DatasetDetail, Page } from "./types";

export interface DatasetQuery {
  page?: number;
  pageSize?: number;
  /** Free-text title search. */
  query?: string;
  /** NTI sector key (e.g. `medio-ambiente`). */
  sector?: string;
  /** File-type code (e.g. `csv`). */
  format?: string;
  /** Publisher org code (e.g. `L01281317`). */
  publisher?: string;
}

function buildPath(q: DatasetQuery): string {
  if (q.query?.trim()) {
    return `/catalog/dataset/title/${encodeURIComponent(q.query.trim())}.json`;
  }
  if (q.sector) return `/catalog/dataset/theme/${encodeURIComponent(q.sector)}.json`;
  if (q.format) return `/catalog/dataset/format/${encodeURIComponent(q.format.toLowerCase())}.json`;
  if (q.publisher) return `/catalog/dataset/publisher/${encodeURIComponent(q.publisher)}.json`;
  return `/catalog/dataset.json`;
}

export async function getDatasets(
  q: DatasetQuery = {},
  signal?: AbortSignal,
): Promise<Page<DatasetSummary>> {
  const page = q.page ?? 0;
  const pageSize = q.pageSize ?? 20;
  const result = await apiGetList<RawDataset>(
    buildPath(q),
    { _page: page, _pageSize: pageSize },
    signal,
  );
  const rawItems = result.items ?? [];
  return {
    items: rawItems.map(normalizeDataset),
    page,
    pageSize,
    hasNext: Boolean(result.next) && rawItems.length === pageSize,
  };
}

export async function getDatasetById(
  id: string,
  signal?: AbortSignal,
): Promise<DatasetDetail | null> {
  const result = await apiGetList<RawDataset>(
    `/catalog/dataset/${encodeURIComponent(id)}.json`,
    undefined,
    signal,
  );
  const raw = result.items?.[0];
  return raw ? normalizeDatasetDetail(raw) : null;
}

/**
 * Fetch several pages of the catalog concurrently and return a flat, deduped
 * sample. Aggregations on the dashboard are computed from this sample to keep
 * the network footprint bounded (the full catalog has ~90k datasets).
 */
export async function sampleDatasets(
  { pages = 10, pageSize = 50 }: { pages?: number; pageSize?: number } = {},
  signal?: AbortSignal,
): Promise<DatasetSummary[]> {
  const requests = Array.from({ length: pages }, (_, page) =>
    apiGetList<RawDataset>("/catalog/dataset.json", { _page: page, _pageSize: pageSize }, signal),
  );
  const results = await Promise.all(requests);
  const seen = new Set<string>();
  const datasets: DatasetSummary[] = [];
  for (const result of results) {
    for (const raw of result.items ?? []) {
      const dataset = normalizeDataset(raw);
      if (dataset.id && !seen.has(dataset.id)) {
        seen.add(dataset.id);
        datasets.push(dataset);
      }
    }
  }
  return datasets;
}
