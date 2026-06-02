import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { router } from "./router";
import "./index.css";

const ONE_DAY = 1000 * 60 * 60 * 24;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // gcTime must outlast the persisted maxAge so cached entries are restored.
      gcTime: ONE_DAY,
      staleTime: 1000 * 60 * 30,
    },
  },
});

// Persist the query cache to localStorage so reloads/return visits hydrate
// instantly from disk instead of hitting the datos.gob.es API every time.
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "opendata-query-cache",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: ONE_DAY,
        // Bump this string to invalidate all persisted caches after a deploy
        // that changes data shapes.
        buster: "v1",
      }}
    >
      <RouterProvider router={router} />
    </PersistQueryClientProvider>
  </StrictMode>,
);
