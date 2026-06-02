import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Spinner, ErrorState } from "@/components/ui/States";
import { useCatalogStats } from "@/lib/queries";
import { formatNumber } from "@/lib/format";

const PublisherBars = lazy(() =>
  import("@/components/charts/CatalogCharts").then((m) => ({ default: m.PublisherBars })),
);

export default function PublishersPage() {
  const { data: stats, isLoading, isError, error, refetch } = useCatalogStats();

  return (
    <div>
      <PageHeader
        title="Organismos publicadores"
        description="Administraciones y entidades que más conjuntos de datos aportan al catálogo. Los códigos siguen el directorio DIR3/INE; abre cada organismo para ver sus conjuntos."
      />

      {isLoading && <Spinner label="Calculando ranking de organismos…" />}
      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}

      {stats && (
        <div className="space-y-6">
          <Card>
            <CardHeader title="Top organismos" subtitle="Conjuntos publicados en la muestra" />
            <Suspense fallback={<Spinner />}>
              <PublisherBars data={stats.byPublisher} />
            </Suspense>
          </Card>

          <div className="space-y-2">
            {stats.byPublisher.map((pub, i) => (
              <Link
                key={pub.key}
                to={`/datasets?publisher=${pub.key}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent"
              >
                <span className="flex items-center gap-3">
                  <span className="font-heading text-lg text-muted">{i + 1}</span>
                  <span className="text-sm font-medium text-fg">{pub.label}</span>
                </span>
                <span className="text-sm text-muted">{formatNumber(pub.value)} conjuntos</span>
              </Link>
            ))}
          </div>
          <p className="text-xs text-muted">Conteos sobre una muestra de {formatNumber(stats.sampleSize)} conjuntos.</p>
        </div>
      )}
    </div>
  );
}
