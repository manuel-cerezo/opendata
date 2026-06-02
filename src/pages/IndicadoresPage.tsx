import { lazy, Suspense, useMemo } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner, ErrorState } from "@/components/ui/States";
import { useIneIndicator } from "@/lib/queries";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { formatNumber } from "@/lib/format";
import { formatPeriod, type InePoint } from "@/lib/api/ine";
import { INE_THEMES, indicatorsByTheme, type IneIndicator } from "@/constants/ineIndicators";

const IneChart = lazy(() => import("@/components/charts/IneChart"));

function formatValue(value: number, indicator: IneIndicator): string {
  const scaled = value * (indicator.scale ?? 1);
  if (indicator.unit === "%") {
    const nf = new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: indicator.decimals,
      maximumFractionDigits: indicator.decimals,
    });
    return `${nf.format(scaled)} %`;
  }
  // Counts (personas, transmisiones, …): thousands separator, no decimals.
  return formatNumber(Math.round(scaled));
}

function lastPoint(points: InePoint[]): InePoint | null {
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].value != null) return points[i];
  }
  return null;
}

function IndicatorCard({ indicator }: { indicator: IneIndicator }) {
  const { data, isLoading, isError, error, refetch } = useIneIndicator(indicator);

  const latest = useMemo(() => (data?.[0] ? lastPoint(data[0].points) : null), [data]);

  return (
    <Card>
      <CardHeader
        title={indicator.title}
        subtitle={indicator.description}
        action={
          latest?.value != null ? (
            <div className="shrink-0 text-right">
              <p className="font-heading text-2xl leading-none text-accent">
                {formatValue(latest.value, indicator)}
              </p>
              <p className="mt-1 text-xs text-muted">{formatPeriod(latest.date, indicator.period)}</p>
            </div>
          ) : undefined
        }
      />

      {isLoading && <Spinner label="Cargando serie del INE…" />}
      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}
      {data && (
        <Suspense fallback={<Spinner />}>
          <IneChart indicator={indicator} data={data} />
        </Suspense>
      )}

      <p className="mt-3 text-xs text-muted">{indicator.source}</p>
    </Card>
  );
}

export default function IndicadoresPage() {
  useDocumentMeta(
    "Indicadores",
    "Indicadores estadísticos de España (inflación, PIB, paro, población, vivienda) en series temporales del INE, con gráficos en Apache ECharts.",
  );

  return (
    <div>
      <PageHeader
        title="Indicadores"
        description="Principales indicadores estadísticos de España (economía, empleo, demografía y vivienda) en series temporales, obtenidos en directo de la API del INE."
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="accent">Fuente: INE</Badge>
          <a
            href="https://www.ine.es/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-accent underline-offset-2 hover:underline"
          >
            Instituto Nacional de Estadística →
          </a>
        </div>
      </PageHeader>

      <nav
        aria-label="Temas"
        className="sticky top-0 z-10 -mx-5 mb-8 flex gap-1 overflow-x-auto border-b border-border bg-bg/90 px-5 py-2 backdrop-blur md:-mx-10 md:px-10"
      >
        {INE_THEMES.map((t) => (
          <a
            key={t.key}
            href={`#${t.key}`}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-accent"
          >
            {t.label}
          </a>
        ))}
      </nav>

      <div className="space-y-12">
        {INE_THEMES.map((theme) => (
          <section key={theme.key} id={theme.key} className="scroll-mt-24">
            <h2 className="mb-4 text-2xl text-fg">{theme.label}</h2>
            <div className="grid gap-5 lg:grid-cols-2">
              {indicatorsByTheme(theme.key).map((indicator) => (
                <IndicatorCard key={indicator.id} indicator={indicator} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-10 text-xs text-muted">
        Series obtenidas en directo desde la API Tempus3 del INE. Los valores se cachean localmente
        para acelerar visitas posteriores.
      </p>
    </div>
  );
}
