import { lazy, type ComponentType } from "react";

/**
 * Like `React.lazy`, but if the dynamic import fails it triggers a single full
 * page reload. A failed import almost always means a new deploy replaced the
 * hashed chunk referenced by an already-loaded index.html, and reloading pulls
 * the fresh asset graph. A sessionStorage timestamp guards against reload loops
 * when the chunk is genuinely unavailable.
 */
export function lazyWithReload<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      const KEY = "chunk-reload-ts";
      const last = Number(sessionStorage.getItem(KEY) || 0);
      const now = Date.now();
      if (now - last > 10_000) {
        sessionStorage.setItem(KEY, String(now));
        window.location.reload();
        // Keep Suspense pending while the page reloads.
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}
