import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getDatasets, getDatasetById, sampleDatasets, type DatasetQuery } from "./api/datasets";
import { computeStats } from "./api/aggregations";

/** Centralised query keys for cache consistency. */
export const queryKeys = {
  stats: (pages: number, pageSize: number) => ["stats", pages, pageSize] as const,
  datasets: (q: DatasetQuery) => ["datasets", q] as const,
  dataset: (id: string) => ["dataset", id] as const,
};

const TEN_MINUTES = 1000 * 60 * 10;

export function useCatalogStats(pages = 10, pageSize = 50) {
  return useQuery({
    queryKey: queryKeys.stats(pages, pageSize),
    queryFn: async ({ signal }) => computeStats(await sampleDatasets({ pages, pageSize }, signal)),
    staleTime: TEN_MINUTES,
  });
}

export function useDatasets(q: DatasetQuery) {
  return useQuery({
    queryKey: queryKeys.datasets(q),
    queryFn: ({ signal }) => getDatasets(q, signal),
    placeholderData: keepPreviousData,
    staleTime: TEN_MINUTES,
  });
}

export function useDataset(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.dataset(id ?? ""),
    queryFn: ({ signal }) => getDatasetById(id!, signal),
    enabled: Boolean(id),
    staleTime: TEN_MINUTES,
  });
}
