import { lazy, Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner, ErrorState } from "@/components/ui/States";
import { useCatalogStats } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

const DashboardCharts = lazy(() => import("@/components/charts/DashboardCharts"));

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-center">
      <p className="font-heading text-3xl text-accent md:text-4xl">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError, error, refetch } = useCatalogStats();

  return (
    <div>
      <PageHeader
        title="Panel del catálogo"
        description="Visión general del catálogo de datos.gob.es a partir de una muestra reciente de conjuntos de datos, con gráficos interactivos."
      />

      {isLoading && <Spinner label="Analizando el catálogo…" />}

      {isError && (
        <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />
      )}

      {stats && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Conjuntos en la muestra" value={formatNumber(stats.sampleSize)} />
            <Stat label="Distribuciones" value={formatNumber(stats.totalDistributions)} />
            <Stat label="Organismos distintos" value={formatNumber(stats.uniquePublishers)} />
            <Stat label="Formatos distintos" value={formatNumber(stats.uniqueFormats)} />
          </div>

          <Suspense fallback={<Spinner label="Cargando gráficos…" />}>
            <DashboardCharts stats={stats} />
          </Suspense>

          <p className="text-xs text-muted">
            Las cifras se calculan sobre una muestra de {formatNumber(stats.sampleSize)} conjuntos
            obtenida en directo desde la API de datos.gob.es; reflejan tendencias, no el total del
            catálogo.
          </p>
        </div>
      )}
    </div>
  );
}
