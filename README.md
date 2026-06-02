# OpenData · Explorador de datos.gob.es

Aplicación web que explora el catálogo de datos abiertos de
[datos.gob.es](https://datos.gob.es/es/) y lo presenta con visualizaciones
interactivas en [Apache ECharts](https://echarts.apache.org/). El diseño
(tipografías, paleta y estilo) replica el de [manuelcerezo.com](https://manuelcerezo.com).

## Stack

- **Vite + React 19 + TypeScript**
- **React Router 7** para el enrutado entre páginas
- **TanStack Query** para fetching con caché, deduplicación y reintentos
- **Apache ECharts** (importaciones tree-shaken, en su propio chunk)
- **Tailwind CSS v4** con los tokens de diseño de manuelcerezo.com
- **Vitest + Testing Library** para los tests

## Datos

Todos los datos provienen en directo de la API pública
[`datos.gob.es/apidata`](https://datos.gob.es/es/accessible-apidata) (linked-data-api,
DCAT). La API expone CORS (`Access-Control-Allow-Origin: *`), por lo que la SPA
consulta directamente sin necesidad de un proxy.

El panel calcula sus métricas sobre una **muestra** reciente del catálogo
(varias páginas obtenidas en paralelo) para mantener acotado el coste de red;
reflejan tendencias, no el total exacto del catálogo (~90.000 conjuntos).

## Páginas

| Ruta | Descripción |
| --- | --- |
| `/` | Inicio: introducción y lista de recursos útiles de datos abiertos |
| `/panel` | Panel con métricas y gráficos del catálogo |
| `/datasets` | Explorador con búsqueda por título y filtros por sector/formato |
| `/datasets/:id` | Ficha de un conjunto con sus distribuciones |
| `/sectores` | Reparto por sector temático (NTI) |
| `/organismos` | Ranking de organismos publicadores |

## Rendimiento

- Code-splitting por ruta (`React.lazy`) y chunks separados para `echarts` y `vendor`.
- ECharts se carga solo cuando se renderiza un gráfico.
- Caché de consultas con `staleTime` de 10 min y `keepPreviousData` en la paginación.
- Tema claro/oscuro aplicado antes del primer paint para evitar parpadeos.

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo
npm run build    # typecheck + build de producción
npm run preview  # previsualizar el build
npm test         # ejecutar los tests (Vitest)
npm run lint     # comprobación de tipos (tsc --noEmit)
```

## Despliegue (Cloudflare Pages)

La app es estática y se sirve en **opendata.manuelcerezo.com** vía Cloudflare Pages,
conectada a este repositorio (auto-deploy en cada push a `main`).

Ajustes del proyecto en Cloudflare Pages:

| Ajuste | Valor |
| --- | --- |
| Framework preset | None / Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` (fijado en `.nvmrc`) |

- `public/_redirects` contiene `/* /index.html 200` para que el enrutado de
  React Router funcione en recargas y enlaces profundos (SPA fallback).
- No requiere variables de entorno ni backend: los datos se consultan
  directamente contra la API pública de datos.gob.es (CORS abierto).
