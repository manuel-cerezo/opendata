import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Spinner } from "@/components/ui/States";

// Route-level code splitting keeps each page (and its data deps) in its own chunk.
const HomePage = lazy(() => import("@/pages/HomePage"));
const DataGobPage = lazy(() => import("@/pages/DataGobPage"));
const DatasetsPage = lazy(() => import("@/pages/DatasetsPage"));
const DatasetDetailPage = lazy(() => import("@/pages/DatasetDetailPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function page(node: React.ReactNode) {
  return <Suspense fallback={<Spinner />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: page(<HomePage />) },
      { path: "datos-gob-es", element: page(<DataGobPage />) },
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
