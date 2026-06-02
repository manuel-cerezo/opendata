import type { RawListResult } from "./types";

export const API_BASE = "https://datos.gob.es/apidata";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type QueryParams = Record<string, string | number | undefined>;

/**
 * Low-level GET against the apidata endpoint. `path` must already include the
 * `.json` suffix (the linked-data-api negotiates format by extension).
 */
export async function apiGet<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal,
): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("No se pudo conectar con datos.gob.es. Revisa tu conexión.");
  }

  if (!res.ok) {
    throw new ApiError(`datos.gob.es respondió con un error (${res.status}).`, res.status);
  }

  return (await res.json()) as T;
}

/** Convenience wrapper that returns the `result.items` array of a list call. */
export async function apiGetList<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal,
): Promise<RawListResult<T>["result"]> {
  const data = await apiGet<RawListResult<T>>(path, params, signal);
  return data.result ?? {};
}
