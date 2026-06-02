import { useIsFetching, useQueryClient } from "@tanstack/react-query";

/**
 * Invalidates every cached query, forcing a fresh fetch from the APIs (and
 * updating the persisted cache). Spins while any request is in flight.
 */
export function RefreshButton() {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching() > 0;

  return (
    <button
      onClick={() => queryClient.invalidateQueries()}
      disabled={isFetching}
      aria-label="Actualizar datos"
      title="Actualizar datos"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
    >
      <svg
        className={isFetching ? "animate-spin" : ""}
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
    </button>
  );
}
