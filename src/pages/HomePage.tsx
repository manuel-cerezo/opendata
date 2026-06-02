import { Link } from "react-router-dom";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { RESOURCES, type Resource } from "@/data/resources";

const CATEGORIES: Resource["category"][] = ["España", "Europa", "Internacional", "Herramientas"];

const FEATURES = [
  { to: "/panel", title: "Panel", text: "Métricas y gráficos interactivos del catálogo en Apache ECharts." },
  { to: "/datasets", title: "Conjuntos", text: "Busca y explora miles de conjuntos de datos con paginación." },
  { to: "/sectores", title: "Sectores", text: "Reparto de los datos por sector temático (NTI)." },
  { to: "/organismos", title: "Organismos", text: "Qué administraciones publican más datos abiertos." },
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
  return (
    <div>
      <PageHeader
        title="Datos abiertos de España, bien presentados"
        description={
          <>
            Un explorador del catálogo de{" "}
            <a href="https://datos.gob.es/es/" target="_blank" rel="noreferrer" className="text-accent underline-offset-2 hover:underline">
              datos.gob.es
            </a>{" "}
            con visualizaciones interactivas en Apache ECharts. Navega entre conjuntos de
            datos, sectores y organismos publicadores.
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <Link to="/panel" className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-light transition-opacity hover:opacity-90">
            Ver el panel
          </Link>
          <Link to="/datasets" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent">
            Explorar conjuntos
          </Link>
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
