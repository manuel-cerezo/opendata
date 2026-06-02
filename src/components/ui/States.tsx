import type { ReactNode } from "react";

export function Spinner({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-muted" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center" role="alert">
      <p className="text-lg text-fg">Algo no ha salido bien</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">
        {message ?? "No se pudieron cargar los datos desde datos.gob.es."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-border bg-bg px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-accent hover:text-accent"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      <p className="text-lg text-fg">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</p>}
    </div>
  );
}
