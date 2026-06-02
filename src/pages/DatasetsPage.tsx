import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { DatasetCard } from "@/components/DatasetCard";
import { useDatasets } from "@/lib/queries";
import { SECTORS } from "@/constants/sectors";

const FORMATS = ["CSV", "JSON", "XML", "XLSX", "PDF", "GEOJSON", "HTML", "RDF"];
const PAGE_SIZE = 20;

export default function DatasetsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const sector = params.get("sector") ?? "";
  const format = params.get("format") ?? "";
  const publisher = params.get("publisher") ?? "";
  const page = Math.max(0, Number(params.get("page") ?? 0));

  const [searchInput, setSearchInput] = useState(query);
  useEffect(() => setSearchInput(query), [query]);

  const { data, isLoading, isError, error, isPlaceholderData, refetch } = useDatasets({
    query: query || undefined,
    sector: sector || undefined,
    format: format || undefined,
    publisher: publisher || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  function update(next: Record<string, string>, resetPage = true) {
    const merged = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value) merged.set(key, value);
      else merged.delete(key);
    }
    if (resetPage) merged.delete("page");
    setParams(merged);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    update({ q: searchInput.trim(), sector: "", format: "" });
  }

  return (
    <div>
      <PageHeader
        title="Conjuntos de datos"
        description="Busca por título o filtra por sector y formato. Los resultados se obtienen en directo desde la API de datos.gob.es."
      />

      <form onSubmit={onSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por título… (p. ej. agua, turismo)"
            aria-label="Buscar conjuntos de datos por título"
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-fg outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
          <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-light transition-opacity hover:opacity-90">
            Buscar
          </button>
        </div>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        <select
          value={sector}
          onChange={(e) => update({ sector: e.target.value, q: "", format: "" })}
          aria-label="Filtrar por sector"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-accent"
        >
          <option value="">Todos los sectores</option>
          {SECTORS.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>

        <select
          value={format}
          onChange={(e) => update({ format: e.target.value, q: "", sector: "" })}
          aria-label="Filtrar por formato"
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none focus:border-accent"
        >
          <option value="">Todos los formatos</option>
          {FORMATS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        {(query || sector || format || publisher) && (
          <button
            onClick={() => setParams(new URLSearchParams())}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {publisher && (
        <p className="mb-6 text-sm text-muted">
          Filtrando por organismo <span className="font-medium text-fg">{publisher}</span>
        </p>
      )}

      {isLoading && <Spinner label="Buscando conjuntos…" />}
      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}

      {data && (
        <>
          {data.items.length === 0 ? (
            <EmptyState title="Sin resultados">
              Prueba con otro término de búsqueda o cambia los filtros.
            </EmptyState>
          ) : (
            <div className={`space-y-3 transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}>
              {data.items.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={() => update({ page: String(page - 1) }, false)}
              disabled={page === 0}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
            >
              ← Anterior
            </button>
            <span className="text-sm text-muted">Página {page + 1}</span>
            <button
              onClick={() => update({ page: String(page + 1) }, false)}
              disabled={!data.hasNext}
              className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors enabled:hover:border-accent enabled:hover:text-accent disabled:opacity-40"
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
