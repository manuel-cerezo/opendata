import { useEffect } from "react";

const SITE = "OpenData";
const DEFAULT_DESCRIPTION =
  "Explorador de datos abiertos de España (datos.gob.es e INE) con visualizaciones interactivas en Apache ECharts.";

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Client-side SEO: sets the document title, description and Open Graph/Twitter
 * tags per route, plus a canonical URL. (For crawler-grade SEO a prerender
 * step would be the next level; this covers titles, sharing and SPA nav.)
 */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${SITE}` : `${SITE} · Datos abiertos de España`;
    const desc = description ?? DEFAULT_DESCRIPTION;

    document.title = fullTitle;
    upsertMeta("name", "description", desc);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:type", "website");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", desc);

    const url = window.location.origin + window.location.pathname;
    upsertMeta("property", "og:url", url);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);
  }, [title, description]);
}
