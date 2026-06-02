import { ApiError } from "./client";

/**
 * Publisher (organism) names are not available through the apidata catalog,
 * which only exposes DIR3 codes. They *are* available via the datos.gob.es
 * SPARQL endpoint (CORS-enabled), so we resolve human-readable names there in
 * batches with a single `VALUES` query.
 */
const SPARQL_ENDPOINT = "https://datos.gob.es/virtuoso/sparql";
const ORG_PREFIX = "http://datos.gob.es/recurso/sector-publico/org/Organismo/";

export function buildOrgNameQuery(codes: string[]): string {
  const values = codes.map((code) => `<${ORG_PREFIX}${code}>`).join(" ");
  return [
    "PREFIX foaf: <http://xmlns.com/foaf/0.1/>",
    `SELECT ?org ?name WHERE { VALUES ?org { ${values} } ?org foaf:name ?name . }`,
  ].join("\n");
}

interface SparqlResults {
  results?: { bindings?: { org?: { value?: string }; name?: { value?: string } }[] };
}

export function parseOrgNames(data: SparqlResults): Record<string, string> {
  const names: Record<string, string> = {};
  for (const binding of data.results?.bindings ?? []) {
    const code = binding.org?.value?.split("/").pop();
    const name = binding.name?.value;
    if (code && name && !names[code]) names[code] = name;
  }
  return names;
}

/** Resolve a batch of DIR3 codes to organism names (`{ code: name }`). */
export async function resolvePublisherNames(
  codes: string[],
  signal?: AbortSignal,
): Promise<Record<string, string>> {
  const unique = Array.from(new Set(codes.filter(Boolean)));
  if (unique.length === 0) return {};

  const url = new URL(SPARQL_ENDPOINT);
  url.searchParams.set("query", buildOrgNameQuery(unique));
  url.searchParams.set("format", "application/sparql-results+json");

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      headers: { Accept: "application/sparql-results+json" },
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ApiError("No se pudieron resolver los nombres de los organismos.");
  }
  if (!res.ok) {
    throw new ApiError(`El servicio SPARQL respondió con un error (${res.status}).`, res.status);
  }
  return parseOrgNames(await res.json());
}
