import { Outlet, ScrollRestoration } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-8 md:px-10 md:py-12">
          <Outlet />
        </main>
        <footer className="border-t border-border px-5 py-6 md:px-10">
          <div className="mx-auto flex max-w-4xl flex-col items-start justify-between gap-2 text-xs text-muted sm:flex-row sm:items-center">
            <p>
              Datos abiertos vía{" "}
              <a href="https://datos.gob.es/es/" target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-accent hover:underline">
                datos.gob.es
              </a>{" "}
              · Visualizaciones con{" "}
              <a href="https://echarts.apache.org/" target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-accent hover:underline">
                Apache ECharts
              </a>
            </p>
            <p>Hecho con React + Vite</p>
          </div>
        </footer>
      </div>
      <ScrollRestoration />
    </div>
  );
}
