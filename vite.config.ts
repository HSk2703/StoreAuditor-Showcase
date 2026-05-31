import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
// @ts-expect-error -- .mjs build script with no type declarations
import { writeSitemap } from "./scripts/build-sitemap.mjs";

/** Regenerates public/sitemap.xml from blog-data.ts on every build. */
function sitemapPlugin(): Plugin {
  return {
    name: "store-auditor:sitemap",
    apply: "build",
    buildStart() {
      try {
        const out = writeSitemap();
        this.info?.(`Sitemap generated → ${out}`);
      } catch (err) {
        this.warn(`Sitemap generation failed: ${(err as Error).message}`);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    sitemapPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
