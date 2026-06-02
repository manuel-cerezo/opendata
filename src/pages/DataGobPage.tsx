import { lazy, Suspense, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner, ErrorState } from "@/components/ui/States";
import { DatasetCard } from "@/components/DatasetCard";
import { useCatalogStats, useDatasets, usePublisherNames } from "@/lib/queries";
import { sectorColor } from "@/constants/sectors";
import { formatNumber } from "@/lib/format";
import type { CatalogStats } from "@/lib/api/aggregations";

// Charts share a single lazy chunk (CatalogCharts) regardless of how many we import.
const SectorDonut = lazy(() =>
  import("@/components/charts/CatalogCharts").then((m) => ({ default: m.SectorDonut })),
);
const FormatBars = lazy(() =>
  import("@/components/charts/CatalogCharts").then((m) => ({ default: m.FormatBars })),
);
const PublisherBars = lazy(() =>
  import("@/components/charts/CatalogCharts").then((m) => ({ default: m.PublisherBars })),
);
const YearLine = lazy(() =>
  import("@/components/charts/CatalogCharts").then((m) => ({ default: m.YearLine })),
);

const ANCHORS = [
  { id: "resumen", label: "Resumen" },
  { id: "sectores", label: "Sectores" },
  { id: "formatos", label: "Formatos" },
  { id: "organismos", label: "Organismos" },
  { id: "evolucion", label: "Evolución" },
  { id: "recientes", label: "Recientes" },
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-center">
      <p className="font-heading text-3xl text-accent md:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
  );
}

function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      {children}
    </section>
  );
}

const CURRENT_YEAR = new Date().getFullYear();

export default function DataGobPage() {
  const { data: stats, isLoading, isError, error, refetch } = useCatalogStats();
  const names = usePublisherNames(stats?.byPublisher.map((p) => p.key) ?? []);

  // Newest datasets (a few extra are fetched so future-dated outliers can be
  // dropped before showing six).
  const recentQuery = useDatasets({ pageSize: 10, sort: "-issued" });
  const recent = (recentQuery.data?.items ?? [])
    .filter((d) => d.year == null || d.year <= CURRENT_YEAR)
    .slice(0, 6);
  const recentNames = usePublisherNames(
    recent.map((d) => d.publisherCode).filter((c): c is string => !!c),
  );

  return (
    <div>
      <PageHeader
        title="datos.gob.es"
        description="Panorámica del catálogo del portal de datos abiertos del Gobierno de España (iniciativa Aporta). Todos los datos de esta página se obtienen en directo de su API pública."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">Fuente: datos.gob.es</Badge>
          <a
            href="https://datos.gob.es/es/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            Ir al portal oficial →
          </a>
        </div>
      </PageHeader>

      {isLoading && <Spinner label="Analizando el catálogo…" />}
      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}

      {stats && (
        <>
          {/* In-page navigation */}
          <nav
            aria-label="Secciones de la página"
            className="sticky top-0 z-10 -mx-5 mb-8 flex gap-1 overflow-x-auto border-b border-border bg-bg/90 px-5 py-2 backdrop-blur md:-mx-10 md:px-10"
          >
            {ANCHORS.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-accent"
              >
                {a.label}
              </a>
            ))}
          </nav>

          <div className="space-y-12">
            <Section id="resumen">
              <h2 className="mb-4 text-2xl text-fg">Resumen</h2>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat label="Conjuntos en la muestra" value={formatNumber(stats.sampleSize)} />
                <Stat label="Distribuciones" value={formatNumber(stats.totalDistributions)} />
                <Stat label="Organismos distintos" value={formatNumber(stats.uniquePublishers)} />
                <Stat label="Formatos distintos" value={formatNumber(stats.uniqueFormats)} />
              </div>
            </Section>

            <Section id="sectores">
              <h2 className="mb-4 text-2xl text-fg">Por sector temático</h2>
              <div className="space-y-5">
                <Card>
                  <CardHeader
                    title="Reparto por sector"
                    subtitle="Clasificación NTI de los conjuntos de la muestra"
                  />
                  <Suspense fallback={<Spinner />}>
                    <SectorDonut data={stats.bySector} />
                  </Suspense>
                </Card>
                <SectorGrid stats={stats} />
              </div>
            </Section>

            <Section id="formatos">
              <h2 className="mb-4 text-2xl text-fg">Por formato</h2>
              <Card>
                <CardHeader
                  title="Formatos de distribución"
                  subtitle="Formatos más frecuentes en la muestra"
                />
                <Suspense fallback={<Spinner />}>
                  <FormatBars data={stats.byFormat} />
                </Suspense>
              </Card>
            </Section>

            <Section id="organismos">
              <h2 className="mb-4 text-2xl text-fg">Organismos publicadores</h2>
              <div className="space-y-5">
                <Card>
                  <CardHeader
                    title="Quién publica más"
                    subtitle="Organismos con más conjuntos en la muestra"
                  />
                  <Suspense fallback={<Spinner />}>
                    <PublisherBars data={namedPublishers(stats, names.data)} />
                  </Suspense>
                </Card>
                <PublisherRanking stats={stats} names={names.data} loading={names.isLoading} />
              </div>
            </Section>

            <Section id="evolucion">
              <h2 className="mb-4 text-2xl text-fg">Evolución temporal</h2>
              <Card>
                <CardHeader
                  title="Publicación por año"
                  subtitle="Año de alta de los conjuntos de la muestra"
                />
                <Suspense fallback={<Spinner />}>
                  <YearLine data={stats.byYear} />
                </Suspense>
              </Card>
            </Section>

            <Section id="recientes">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="text-2xl text-fg">Conjuntos recientes</h2>
                <Link
                  to="/datasets"
                  className="shrink-0 text-sm font-medium text-accent underline-offset-2 hover:underline"
                >
                  Ver todos →
                </Link>
              </div>
              {recentQuery.isLoading ? (
                <Spinner label="Cargando conjuntos recientes…" />
              ) : recent.length === 0 ? (
                <p className="text-sm text-muted">No se pudieron cargar los conjuntos recientes.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {recent.map((dataset) => (
                    <DatasetCard
                      key={dataset.id}
                      dataset={dataset}
                      publisherName={
                        dataset.publisherCode ? recentNames.data?.[dataset.publisherCode] : undefined
                      }
                    />
                  ))}
                </div>
              )}
            </Section>
          </div>

          <p className="mt-10 text-xs text-muted">
            Las cifras se calculan sobre una muestra de {formatNumber(stats.sampleSize)} conjuntos
            obtenida en directo desde la API de datos.gob.es; reflejan tendencias, no el total exacto
            del catálogo. Los nombres de los organismos se resuelven vía el endpoint SPARQL de
            datos.gob.es.
          </p>
        </>
      )}
    </div>
  );
}

/** Replace publisher codes with resolved names for the chart labels. */
function namedPublishers(stats: CatalogStats, names?: Record<string, string>) {
  if (!names) return stats.byPublisher;
  return stats.byPublisher.map((p) => ({ ...p, label: names[p.key] ?? p.label }));
}

const SECTOR_PREVIEW = 10;

function SectorGrid({ stats }: { stats: CatalogStats }) {
  const [showAll, setShowAll] = useState(false);
  const all = stats.bySector; // already sorted by count descending
  const max = Math.max(1, ...all.map((c) => c.value));
  const visible = showAll ? all : all.slice(0, SECTOR_PREVIEW);
  const hidden = all.length - SECTOR_PREVIEW;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        {visible.map((sector) => (
          <Link
            key={sector.key}
            to={`/datasets?sector=${sector.key}`}
            className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-medium text-fg">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: sectorColor(sector.key) }}
                />
                {sector.label}
              </span>
              <span className="text-sm text-muted">{formatNumber(sector.value)}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(sector.value / max) * 100}%`,
                  backgroundColor: sectorColor(sector.key),
                }}
              />
            </div>
          </Link>
        ))}
      </div>

      {hidden > 0 && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="mt-4 w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
        >
          {showAll ? "Mostrar menos" : `Mostrar más (${hidden})`}
        </button>
      )}
    </div>
  );
}

function PublisherRanking({
  stats,
  names,
  loading,
}: {
  stats: CatalogStats;
  names?: Record<string, string>;
  loading: boolean;
}) {
  return (
    <div className="space-y-2">
      {stats.byPublisher.map((pub, i) => {
        const name = names?.[pub.key];
        return (
          <Link
            key={pub.key}
            to={`/datasets?publisher=${pub.key}`}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="font-heading text-lg text-muted transition-colors group-hover:text-accent">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-fg group-hover:text-accent">
                  {name ?? (loading ? "Resolviendo nombre…" : pub.key)}
                </span>
                {name && <span className="block text-xs text-muted">{pub.key}</span>}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 text-sm text-muted">
              {formatNumber(pub.value)} conjuntos
              <span className="text-accent opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true">
                →
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
