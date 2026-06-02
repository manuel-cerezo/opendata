import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { RouteError } from "@/components/RouteError";
import { Spinner } from "@/components/ui/States";
import { lazyWithReload } from "@/lib/lazyWithReload";

// Route-level code splitting keeps each page (and its data deps) in its own
// chunk. lazyWithReload recovers from stale chunks after a new deploy.
const HomePage = lazyWithReload(() => import("@/pages/HomePage"));
const DataGobPage = lazyWithReload(() => import("@/pages/DataGobPage"));
const IndicadoresPage = lazyWithReload(() => import("@/pages/IndicadoresPage"));
const DatasetsPage = lazyWithReload(() => import("@/pages/DatasetsPage"));
const DatasetDetailPage = lazyWithReload(() => import("@/pages/DatasetDetailPage"));
const NotFoundPage = lazyWithReload(() => import("@/pages/NotFoundPage"));

function page(node: React.ReactNode) {
  return <Suspense fallback={<Spinner />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: page(<HomePage />) },
      { path: "datos-gob-es", element: page(<DataGobPage />) },
      { path: "indicadores", element: page(<IndicadoresPage />) },
      { path: "datasets", element: page(<DatasetsPage />) },
      { path: "datasets/:id", element: page(<DatasetDetailPage />) },
      // The panel, sectors and publishers views were merged into /datos-gob-es.
      { path: "panel", element: <Navigate to="/datos-gob-es" replace /> },
      { path: "sectores", element: <Navigate to="/datos-gob-es" replace /> },
      { path: "organismos", element: <Navigate to="/datos-gob-es" replace /> },
      { path: "*", element: page(<NotFoundPage />) },
    ],
  },
]);
