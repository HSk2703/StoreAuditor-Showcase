/**
 * Build-time sitemap generator.
 * Reads blog slugs from src/lib/blog-data.ts and emits public/sitemap.xml.
 * Runs from the Vite plugin in vite.config.ts (buildStart hook) AND can be
 * invoked directly with `node scripts/build-sitemap.mjs`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITE = "https://storeauditor.io";

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/store-audit", changefreq: "weekly", priority: "0.9" },
  { loc: "/pricing", changefreq: "monthly", priority: "0.9" },
  { loc: "/about", changefreq: "monthly", priority: "0.7" },
  { loc: "/how-it-works", changefreq: "monthly", priority: "0.7" },
  { loc: "/agency-tools", changefreq: "monthly", priority: "0.8" },
  { loc: "/social-media", changefreq: "monthly", priority: "0.7" },
  { loc: "/competitor-analysis", changefreq: "monthly", priority: "0.7" },
  { loc: "/blog", changefreq: "weekly", priority: "0.8" },
  { loc: "/help-center", changefreq: "monthly", priority: "0.6" },
  { loc: "/docs", changefreq: "monthly", priority: "0.6" },
  { loc: "/careers", changefreq: "monthly", priority: "0.5" },
  { loc: "/contact", changefreq: "yearly", priority: "0.5" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.4" },
  { loc: "/terms", changefreq: "yearly", priority: "0.4" },
  { loc: "/cookies", changefreq: "yearly", priority: "0.4" },
  { loc: "/login", changefreq: "yearly", priority: "0.3" },
  { loc: "/signup", changefreq: "yearly", priority: "0.5" },
];

function extractBlogPosts() {
  const filePath = resolve(ROOT, "src/lib/blog-data.ts");
  const src = readFileSync(filePath, "utf8");
  // Parse simple `slug: "..."` and `date: "..."` pairs in declaration order.
  const slugRe = /slug:\s*"([^"]+)"/g;
  const dateRe = /date:\s*"([^"]+)"/g;
  const slugs = [...src.matchAll(slugRe)].map((m) => m[1]);
  const dates = [...src.matchAll(dateRe)].map((m) => m[1]);
  // The first slug match is the type definition (`slug: string;`) — filter it.
  const onlyPostSlugs = slugs.filter((s) => s !== "string");
  return onlyPostSlugs.map((slug, i) => ({ slug, date: dates[i] || null }));
}

function buildXml() {
  const posts = extractBlogPosts();
  const urls = [
    ...STATIC_PAGES.map(
      (p) =>
        `  <url><loc>${SITE}${p.loc}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
    ),
    ...posts.map(
      (p) =>
        `  <url><loc>${SITE}/blog/${p.slug}</loc>${p.date ? `<lastmod>${p.date}</lastmod>` : ""}<changefreq>monthly</changefreq><priority>0.7</priority></url>`,
    ),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

export function writeSitemap() {
  const xml = buildXml();
  const outPath = resolve(ROOT, "public/sitemap.xml");
  writeFileSync(outPath, xml, "utf8");
  return outPath;
}

// Direct CLI invocation
if (import.meta.url === `file://${process.argv[1]}`) {
  const out = writeSitemap();
  // eslint-disable-next-line no-console
  console.log(`✓ Sitemap written: ${out}`);
}
