import { lazy, Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner, ErrorState } from "@/components/ui/States";
import { useEuroIndicator } from "@/lib/queries";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import type { EuroSeries } from "@/lib/api/eurostat";
import { EURO_GEOS, EURO_INDICATORS, type EuroIndicator } from "@/constants/euroIndicators";

const EuroChart = lazy(() => import("@/components/charts/EuroChart"));

function lastValue(serie: EuroSeries | undefined): number | null {
  if (!serie) return null;
  for (let i = serie.values.length - 1; i >= 0; i--) {
    if (serie.values[i] != null) return serie.values[i];
  }
  return null;
}

function format(value: number, indicator: EuroIndicator): string {
  const nf = new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: indicator.decimals,
    maximumFractionDigits: indicator.decimals,
  });
  return `${nf.format(value)}${indicator.unit ? ` ${indicator.unit}` : ""}`;
}

function IndicatorCard({ indicator }: { indicator: EuroIndicator }) {
  const { data, isLoading, isError, error, refetch } = useEuroIndicator(indicator);

  return (
    <Card>
      <CardHeader title={indicator.title} subtitle={indicator.description} />

      {data && (
        <div className="mb-3 flex flex-wrap gap-4">
          {EURO_GEOS.map((geo, i) => {
            const v = lastValue(data[i]);
            return (
              <div key={geo.code} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: geo.color }} />
                <span className="text-sm text-muted">{geo.label}</span>
                <span className="font-heading text-lg leading-none text-fg">
                  {v != null ? format(v, indicator) : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {isLoading && <Spinner label="Cargando serie de Eurostat…" />}
      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}
      {data && (
        <Suspense fallback={<Spinner />}>
          <EuroChart indicator={indicator} data={data} />
        </Suspense>
      )}

      <p className="mt-3 text-xs text-muted">{indicator.source}</p>
    </Card>
  );
}

export default function EuropaPage() {
  useDocumentMeta(
    "Europa — España vs. UE",
    "Comparativa de España frente a la UE-27 (paro, inflación, PIB) con datos de Eurostat y visualizaciones en Apache ECharts.",
  );

  return (
    <div>
      <PageHeader
        title="España vs. UE-27"
        description="Comparativa de los principales indicadores de España frente a la media de la Unión Europea, con series obtenidas en directo de la API de Eurostat."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">Fuente: Eurostat</Badge>
          <a
            href="https://ec.europa.eu/eurostat"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            Eurostat →
          </a>
        </div>
      </PageHeader>

      <div className="grid gap-5 lg:grid-cols-2">
        {EURO_INDICATORS.map((indicator) => (
          <IndicatorCard key={indicator.id} indicator={indicator} />
        ))}
      </div>

      <p className="mt-10 text-xs text-muted">
        Series obtenidas en directo desde la API de difusión de Eurostat (JSON-stat) y cacheadas
        localmente para acelerar visitas posteriores.
      </p>
    </div>
  );
}
