import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Spinner, ErrorState } from "@/components/ui/States";
import { useCatalogStats } from "@/lib/queries";
import { SECTORS, sectorColor } from "@/constants/sectors";
import { formatNumber } from "@/lib/format";

const SectorDonut = lazy(() =>
  import("@/components/charts/CatalogCharts").then((m) => ({ default: m.SectorDonut })),
);

export default function SectorsPage() {
  const { data: stats, isLoading, isError, error, refetch } = useCatalogStats();
  const counts = new Map(stats?.bySector.map((c) => [c.key, c.value]));
  const max = stats ? Math.max(1, ...stats.bySector.map((c) => c.value)) : 1;

  return (
    <div>
      <PageHeader
        title="Sectores temáticos"
        description="El catálogo se organiza según la taxonomía de sectores de la Norma Técnica de Interoperabilidad (NTI). Explora cada sector y abre sus conjuntos de datos."
      />

      {isLoading && <Spinner label="Calculando reparto por sector…" />}
      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}

      {stats && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Reparto por sector" subtitle="Proporción de conjuntos en la muestra" />
            <Suspense fallback={<Spinner />}>
              <SectorDonut data={stats.bySector} />
            </Suspense>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {SECTORS.map((sector) => {
              const value = counts.get(sector.key) ?? 0;
              return (
                <Link
                  key={sector.key}
                  to={`/datasets?sector=${sector.key}`}
                  className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-medium text-fg">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: sectorColor(sector.key) }} />
                      {sector.label}
                    </span>
                    <span className="text-sm text-muted">{formatNumber(value)}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(value / max) * 100}%`, backgroundColor: sectorColor(sector.key) }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-muted">Conteos sobre una muestra de {formatNumber(stats.sampleSize)} conjuntos.</p>
        </div>
      )}
    </div>
  );
}
