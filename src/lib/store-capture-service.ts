import { supabase } from "@/integrations/supabase/client";

export interface StoreCaptureResult {
  screenshot: string | null;
  html: string | null;
  markdown: string | null;
  metadata: {
    title?: string;
    description?: string;
    sourceURL?: string;
  } | null;
}

export interface DetectedSection {
  type: "navigation" | "hero" | "products" | "cta" | "footer" | "trust" | "testimonials" | "collections" | "value_prop" | "unknown";
  label: string;
  selector: string;
  confidence: number;
  /** Estimated vertical position 0-100% */
  estimatedPosition: number;
  /** Extracted text snippets from this section */
  textContent?: string[];
  /** Whether this section has interactive elements */
  hasInteractiveElements?: boolean;
}

/**
 * Captures a real screenshot + HTML of a store using Firecrawl.
 * Requests full-page capture with extended wait time.
 */
export async function captureStore(storeUrl: string): Promise<StoreCaptureResult> {
  try {
    const { data, error } = await supabase.functions.invoke("firecrawl-scrape", {
      body: {
        url: storeUrl,
        options: {
          formats: ["screenshot", "html", "markdown"],
          waitFor: 5000,
          onlyMainContent: false,
        },
      },
    });

    if (error) {
      console.warn("Store capture failed:", error.message);
      return emptyResult();
    }

    const content = data?.data || data;

    return {
      screenshot: content?.screenshot || null,
      html: content?.html || null,
      markdown: content?.markdown || null,
      metadata: content?.metadata || null,
    };
  } catch (err) {
    console.warn("Store capture error:", err);
    return emptyResult();
  }
}

function emptyResult(): StoreCaptureResult {
  return { screenshot: null, html: null, markdown: null, metadata: null };
}

/**
 * Advanced section detection from HTML structure.
 * Returns sections with estimated vertical positions and metadata.
 */
export function detectSectionsFromHtml(html: string): DetectedSection[] {
  if (!html) return [];

  const sections: DetectedSection[] = [];
  let position = 0;

  // Navigation detection
  if (/<nav|<header|class="[^"]*header[^"]*"|id="[^"]*header[^"]*"|class="[^"]*nav[^"]*"/i.test(html)) {
    sections.push({
      type: "navigation",
      label: "Navigation Bar",
      selector: "nav, header",
      confidence: 92,
      estimatedPosition: position,
      hasInteractiveElements: true,
      textContent: extractTextNear(html, /<nav[^>]*>([\s\S]*?)<\/nav>/i),
    });
    position += 5;
  }

  // Hero section detection
  if (/hero|banner|slideshow|carousel|class="[^"]*hero[^"]*"|class="[^"]*banner[^"]*"|class="[^"]*slide[^"]*"/i.test(html)) {
    sections.push({
      type: "hero",
      label: "Hero Section",
      selector: ".hero, .banner, .slideshow, [class*=hero]",
      confidence: 88,
      estimatedPosition: position + 5,
      hasInteractiveElements: true,
      textContent: extractTextNear(html, /class="[^"]*hero[^"]*"[^>]*>([\s\S]*?)<\/(?:div|section)>/i),
    });
    position += 25;
  }

  // Trust signals (often after hero)
  if (/trust|guarantee|secure|badge|shield|free.?shipping|money.?back/i.test(html)) {
    sections.push({
      type: "trust",
      label: "Trust Signals",
      selector: ".trust-badges, [class*=trust], [class*=guarantee]",
      confidence: 72,
      estimatedPosition: position,
      hasInteractiveElements: false,
    });
    position += 8;
  }

  // Featured products / product grid
  if (/product-grid|product-list|featured|collection-products|class="[^"]*product[^"]*grid[^"]*"|class="[^"]*product-card/i.test(html)) {
    sections.push({
      type: "products",
      label: "Featured Products",
      selector: ".product-grid, .collection-products, [class*=product-grid]",
      confidence: 85,
      estimatedPosition: position,
      hasInteractiveElements: true,
    });
    position += 25;
  }

  // Collections grid
  if (/collection-list|collections-grid|category|shop-by|class="[^"]*collection[^"]*"/i.test(html)) {
    sections.push({
      type: "collections",
      label: "Collections",
      selector: ".collection-list, [class*=collection]",
      confidence: 78,
      estimatedPosition: position,
      hasInteractiveElements: true,
    });
    position += 15;
  }

  // Value proposition / about section
  if (/about|value.?prop|why.?us|our.?story|mission|brand.?story/i.test(html)) {
    sections.push({
      type: "value_prop",
      label: "Value Proposition",
      selector: ".about, [class*=value-prop], [class*=why-us]",
      confidence: 68,
      estimatedPosition: position,
      hasInteractiveElements: false,
    });
    position += 12;
  }

  // Testimonials / reviews
  if (/testimonial|review|rating|star|customer.?say/i.test(html)) {
    sections.push({
      type: "testimonials",
      label: "Reviews & Testimonials",
      selector: ".reviews, .testimonials, [class*=review]",
      confidence: 74,
      estimatedPosition: position,
      hasInteractiveElements: false,
    });
    position += 12;
  }

  // CTA sections
  if (/call-to-action|cta|shop-now|add-to-cart|subscribe|newsletter/i.test(html)) {
    sections.push({
      type: "cta",
      label: "Call to Action",
      selector: ".cta, .shop-now, [class*=cta]",
      confidence: 76,
      estimatedPosition: position,
      hasInteractiveElements: true,
    });
    position += 10;
  }

  // Footer
  if (/<footer|class="[^"]*footer[^"]*"/i.test(html)) {
    sections.push({
      type: "footer",
      label: "Footer",
      selector: "footer, [class*=footer]",
      confidence: 92,
      estimatedPosition: 92,
      hasInteractiveElements: true,
    });
  }

  // Normalize positions to span 0-100
  if (sections.length > 0) {
    const totalSections = sections.length;
    sections.forEach((s, i) => {
      s.estimatedPosition = Math.round((i / totalSections) * 85) + 3;
    });
  }

  return sections;
}

function extractTextNear(html: string, regex: RegExp): string[] {
  const match = html.match(regex);
  if (!match?.[1]) return [];
  const text = match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.split(" ").slice(0, 10).filter(Boolean);
}

/**
 * Extract store metadata from HTML for display.
 */
export function extractStoreInfo(html: string, metadata?: StoreCaptureResult["metadata"]) {
  const title = metadata?.title || html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || "Store";
  const description = metadata?.description || "";
  const favicon = html.match(/<link[^>]*rel="[^"]*icon[^"]*"[^>]*href="([^"]+)"/i)?.[1] || "";

  return { title: title.replace(/\s*[-|–]\s*.*$/, "").trim(), description, favicon };
}
