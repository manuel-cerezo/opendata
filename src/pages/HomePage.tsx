import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { RESOURCES, type Resource } from "@/data/resources";

const CATEGORIES: Resource["category"][] = ["España", "Europa", "Internacional", "Herramientas"];

const FEATURES = [
  {
    to: "/datos-gob-es",
    title: "datos.gob.es",
    text: "Toda la analítica del catálogo en una página: sectores, formatos, organismos y evolución, con gráficos interactivos en Apache ECharts.",
  },
  {
    to: "/indicadores",
    title: "Indicadores",
    text: "Series temporales del INE: inflación, PIB, paro, población y precio de la vivienda.",
  },
  {
    to: "/europa",
    title: "Europa",
    text: "Comparativa España vs. UE-27 (paro, inflación, PIB) con datos de Eurostat.",
  },
  {
    to: "/datasets",
    title: "Conjuntos",
    text: "Busca por título y filtra por sector, formato u organismo. Miles de conjuntos de datos con paginación.",
  },
];

function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-col rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg text-fg group-hover:text-accent">{resource.name}</h3>
        <span className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true">→</span>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-muted">{resource.description}</p>
    </a>
  );
}

export default function HomePage() {
  useDocumentMeta(
    "",
    "Explorador de datos abiertos de España: catálogo de datos.gob.es, indicadores del INE y comparativas con Eurostat, visualizados con Apache ECharts.",
  );

  return (
    <div>
      <PageHeader
        title="Datos abiertos de España, bien presentados"
        description={
          <>
            Un explorador del catálogo de{" "}
            <a href="https://datos.gob.es/es/" target="_blank" rel="noreferrer" className="text-accent underline-offset-2 hover:underline">
              datos.gob.es
            </a>
            , el portal de datos abiertos del Gobierno de España. Todos los datos se obtienen en
            directo de su API pública y se visualizan con Apache ECharts.
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Badge tone="accent">Fuente única: datos.gob.es</Badge>
          <div className="flex flex-wrap gap-3">
            <Link to="/datos-gob-es" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-light transition-opacity hover:opacity-90 dark:text-dark">
              Ver datos.gob.es
            </Link>
            <Link to="/datasets" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent">
              Explorar conjuntos
            </Link>
          </div>
        </div>
      </PageHeader>

      <section className="mb-12">
        <div className="grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <Link key={f.to} to={f.to} className="group rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent">
              <h3 className="text-lg text-fg group-hover:text-accent">{f.title}</h3>
              <p className="mt-1 text-sm text-muted">{f.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl text-fg">Recursos útiles</h2>
        <p className="mt-1 text-sm text-muted">
          Portales de datos abiertos y herramientas para encontrar y trabajar con datos públicos.
        </p>

        <div className="mt-6 space-y-8">
          {CATEGORIES.map((category) => {
            const items = RESOURCES.filter((r) => r.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category}>
                <div className="mb-3">
                  <Badge tone="accent">{category}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((resource) => (
                    <ResourceCard key={resource.url} resource={resource} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
