import { Link, useParams } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner, ErrorState, EmptyState } from "@/components/ui/States";
import { useDataset } from "@/lib/queries";
import { sectorLabel } from "@/constants/sectors";
import { formatDate, formatBytes } from "@/lib/format";

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useDataset(id);

  return (
    <div>
      <Link to="/datasets" className="mb-6 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-accent">
        ← Volver a conjuntos
      </Link>

      {isLoading && <Spinner label="Cargando conjunto…" />}
      {isError && <ErrorState message={(error as Error)?.message} onRetry={() => refetch()} />}
      {!isLoading && !isError && !data && (
        <EmptyState title="Conjunto no encontrado">
          No se encontró el conjunto solicitado. Puede haber sido retirado del catálogo.
        </EmptyState>
      )}

      {data && (
        <article>
          <header className="mb-6">
            <h1 className="text-3xl text-fg md:text-4xl">{data.title}</h1>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {data.sectors.map((s) => (
                <Badge key={s} tone="accent">{sectorLabel(s)}</Badge>
              ))}
            </div>
          </header>

          {data.description && (
            <p className="mb-8 whitespace-pre-line text-base leading-relaxed text-fg/90">
              {data.description}
            </p>
          )}

          <div className="grid gap-5 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="mb-3 text-xl text-fg">Distribuciones ({data.distributions.length})</h2>
              {data.distributions.length === 0 ? (
                <EmptyState title="Sin distribuciones publicadas" />
              ) : (
                <div className="space-y-2">
                  {data.distributions.map((dist, i) => (
                    <Card key={i} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-fg">{dist.title}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {dist.format ?? "Formato desconocido"}
                          {dist.byteSize ? ` · ${formatBytes(dist.byteSize)}` : ""}
                        </p>
                      </div>
                      {dist.accessURL && (
                        <a
                          href={dist.accessURL}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded-lg border border-border bg-bg px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:border-accent hover:text-accent"
                        >
                          Acceder
                        </a>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <aside>
              <h2 className="mb-3 text-xl text-fg">Detalles</h2>
              <Card className="space-y-3 text-sm">
                <Detail label="Alta" value={formatDate(data.issued)} />
                <Detail label="Última modificación" value={formatDate(data.modified)} />
                {data.publisherCode && (
                  <Detail label="Organismo" value={data.publisherCode} />
                )}
                <Detail label="Formatos" value={data.formats.join(", ") || "—"} />
                <div className="border-t border-border pt-3">
                  <a
                    href={data.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                  >
                    Ver en datos.gob.es →
                  </a>
                </div>
              </Card>

              {data.keywords.length > 0 && (
                <div className="mt-5">
                  <h3 className="mb-2 text-sm font-medium text-fg">Etiquetas</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {data.keywords.slice(0, 12).map((k) => (
                      <Badge key={k}>{k}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </article>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-fg">{value}</span>
    </div>
  );
}
