export interface Resource {
  name: string;
  url: string;
  description: string;
  category: "España" | "Europa" | "Internacional" | "Herramientas";
}

/** Curated catalogue of open-data portals and tooling shown on the home page. */
export const RESOURCES: Resource[] = [
  {
    name: "datos.gob.es",
    url: "https://datos.gob.es/es/",
    description:
      "Portal de datos abiertos del Gobierno de España. Federa más de 90.000 conjuntos de datos de administraciones públicas. Es la fuente de esta aplicación.",
    category: "España",
  },
  {
    name: "INE — Instituto Nacional de Estadística",
    url: "https://www.ine.es/",
    description:
      "Estadística oficial de España: demografía, economía, sociedad. Ofrece la API INEbase con series temporales en JSON.",
    category: "España",
  },
  {
    name: "AEMET OpenData",
    url: "https://opendata.aemet.es/",
    description:
      "API pública de la Agencia Estatal de Meteorología con predicciones, observaciones y datos climatológicos.",
    category: "España",
  },
  {
    name: "Banco de España",
    url: "https://www.bde.es/webbde/es/estadis/infoest/series_estadisticas.html",
    description:
      "Series estadísticas de tipos de interés, agregados monetarios, balanza de pagos y mercados financieros.",
    category: "España",
  },
  {
    name: "data.europa.eu",
    url: "https://data.europa.eu/",
    description:
      "Portal oficial de datos abiertos de la Unión Europea. Agrega datasets de instituciones de la UE y de los Estados miembros.",
    category: "Europa",
  },
  {
    name: "Eurostat",
    url: "https://ec.europa.eu/eurostat/web/main/data/database",
    description:
      "Oficina estadística de la UE. Miles de indicadores comparables entre países con API REST y formato JSON-stat.",
    category: "Europa",
  },
  {
    name: "World Bank Open Data",
    url: "https://data.worldbank.org/",
    description:
      "Indicadores de desarrollo de más de 200 países. API REST gratuita con series históricas muy completas.",
    category: "Internacional",
  },
  {
    name: "OWID — Our World in Data",
    url: "https://ourworldindata.org/",
    description:
      "Datos y visualizaciones sobre los grandes problemas del mundo. Todos los conjuntos descargables en CSV.",
    category: "Internacional",
  },
  {
    name: "Apache ECharts",
    url: "https://echarts.apache.org/",
    description:
      "Librería de visualización usada en este proyecto. Gráficos declarativos, performantes y altamente personalizables.",
    category: "Herramientas",
  },
  {
    name: "JSON-stat",
    url: "https://json-stat.org/",
    description:
      "Estándar ligero para publicar datos estadísticos en JSON, adoptado por Eurostat, INE y otros institutos.",
    category: "Herramientas",
  },
];
