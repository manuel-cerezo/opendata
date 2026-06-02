import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Spinner } from "@/components/ui/States";

// Route-level code splitting keeps each page (and its data deps) in its own chunk.
const HomePage = lazy(() => import("@/pages/HomePage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const DatasetsPage = lazy(() => import("@/pages/DatasetsPage"));
const DatasetDetailPage = lazy(() => import("@/pages/DatasetDetailPage"));
const SectorsPage = lazy(() => import("@/pages/SectorsPage"));
const PublishersPage = lazy(() => import("@/pages/PublishersPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function page(node: React.ReactNode) {
  return <Suspense fallback={<Spinner />}>{node}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: page(<HomePage />) },
      { path: "panel", element: page(<DashboardPage />) },
      { path: "datasets", element: page(<DatasetsPage />) },
      { path: "datasets/:id", element: page(<DatasetDetailPage />) },
      { path: "sectores", element: page(<SectorsPage />) },
      { path: "organismos", element: page(<PublishersPage />) },
      { path: "*", element: page(<NotFoundPage />) },
    ],
  },
]);
