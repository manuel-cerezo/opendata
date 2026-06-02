import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";
import { SectorDonut, FormatBars, PublisherBars, YearLine } from "./CatalogCharts";
import type { CatalogStats } from "@/lib/api/aggregations";

/**
 * Default export so the whole ECharts-dependent subtree can sit behind a single
 * React.lazy boundary and ship in the separate `echarts` chunk.
 */
export default function DashboardCharts({ stats }: { stats: CatalogStats }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader title="Por sector" subtitle="Reparto temático (NTI) de la muestra" />
        {stats.bySector.length ? (
          <SectorDonut data={stats.bySector} />
        ) : (
          <EmptyState title="Sin datos de sector" />
        )}
      </Card>

      <Card>
        <CardHeader title="Por formato" subtitle="Formatos de distribución más frecuentes" />
        {stats.byFormat.length ? (
          <FormatBars data={stats.byFormat} />
        ) : (
          <EmptyState title="Sin datos de formato" />
        )}
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader
          title="Organismos con más conjuntos"
          subtitle="Top publicadores en la muestra (código DIR3/INE)"
        />
        {stats.byPublisher.length ? (
          <PublisherBars data={stats.byPublisher} />
        ) : (
          <EmptyState title="Sin datos de organismo" />
        )}
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader title="Publicación por año" subtitle="Año de alta de los conjuntos de la muestra" />
        {stats.byYear.length ? (
          <YearLine data={stats.byYear} />
        ) : (
          <EmptyState title="Sin datos temporales" />
        )}
      </Card>
    </div>
  );
}
