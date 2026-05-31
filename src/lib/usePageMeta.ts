import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  canonical?: string; // path, e.g. "/pricing"
  keywords?: string[];
}

const SITE_ORIGIN = "https://storeauditor.io";

function setMetaTag(selector: string, content: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    const m = selector.match(/\[(name|property)="([^"]+)"\]/);
    if (m) el.setAttribute(m[1], m[2]);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

/**
 * Per-route head: title, description, canonical, OG/Twitter mirrors, keywords.
 * Falls back to current pathname for canonical.
 */
export function usePageMeta({ title, description, canonical, keywords }: PageMeta) {
  useEffect(() => {
    document.title = title;
    setMetaTag('meta[name="description"]', description);
    setMetaTag('meta[property="og:title"]', title);
    setMetaTag('meta[property="og:description"]', description);
    setMetaTag('meta[name="twitter:title"]', title);
    setMetaTag('meta[name="twitter:description"]', description);
    if (keywords?.length) setMetaTag('meta[name="keywords"]', keywords.join(", "));
    const path = canonical ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const url = path.startsWith("http") ? path : `${SITE_ORIGIN}${path}`;
    setCanonical(url);
    setMetaTag('meta[property="og:url"]', url);
  }, [title, description, canonical, keywords?.join(",")]);
}
