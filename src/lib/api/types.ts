/** Raw shapes returned by the datos.gob.es apidata (linked-data-api). */

export type LangValue = string | { _value: string; _lang?: string };

export interface RawDistribution {
  _about?: string;
  accessURL?: string;
  format?: string;
  byteSize?: number | string;
  title?: LangValue | LangValue[];
}

export interface RawDataset {
  _about: string;
  title?: LangValue | LangValue[];
  description?: LangValue | LangValue[];
  theme?: string | string[];
  distribution?: RawDistribution | RawDistribution[];
  publisher?: string | string[];
  issued?: string;
  modified?: string;
  identifier?: string;
  keyword?: string | string[];
  license?: string;
}

export interface RawListResult<T> {
  format: string;
  version: string;
  result: {
    items?: T[];
    next?: string;
    previous?: string;
    first?: string;
    page?: number;
    itemsPerPage?: number;
  };
}

/** Normalised, UI-friendly dataset model derived from {@link RawDataset}. */
export interface DatasetSummary {
  /** Catalog slug, e.g. `e05068001-mapas-estrategicos-de-ruido`. */
  id: string;
  uri: string;
  title: string;
  description: string;
  sectors: string[];
  formats: string[];
  keywords: string[];
  publisherCode: string | null;
  publisherUri: string | null;
  issued: string | null;
  modified: string | null;
  year: number | null;
  distributionCount: number;
}

export interface DatasetDetail extends DatasetSummary {
  distributions: {
    title: string;
    format: string | null;
    accessURL: string | null;
    byteSize: number | null;
  }[];
  license: string | null;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  hasNext: boolean;
}
