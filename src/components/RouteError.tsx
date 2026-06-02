import { useRouteError, Link } from "react-router-dom";

/** Friendly fallback shown when a route (or its lazy chunk) fails to load. */
export function RouteError() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : String(error ?? "");
  const isChunkError = /dynamically imported module|importing|chunk/i.test(message);

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-5">
      <div className="w-full max-w-md text-center">
        <img src="/favicon.svg" alt="" width="40" height="40" className="mx-auto" />
        <h1 className="mt-5 text-3xl text-fg">Algo no ha salido bien</h1>
        <p className="mx-auto mt-2 text-sm leading-relaxed text-muted">
          {isChunkError
            ? "Hay una versión nueva de la aplicación disponible. Recarga la página para cargarla."
            : "Se ha producido un error inesperado. Recarga la página o vuelve al inicio."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-light transition-opacity hover:opacity-90 dark:text-dark"
          >
            Recargar
          </button>
          <Link
            to="/"
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
