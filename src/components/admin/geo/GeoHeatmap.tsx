import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { canonicalizeCountry } from "./countryAliases";
import type { CountryRow } from "./TopCountries";

interface Props {
  countries: CountryRow[];
}

// Self-hosted to avoid third-party CDN dependency. File lives in /public.
const TOPO_URL = "/world-110m.json";

interface Tooltip {
  x: number;
  y: number;
  country: string;
  users: number;
  agencies: number;
}

export default function GeoHeatmap({ countries }: Props) {
  const [topo, setTopo] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(TOPO_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load map data");
        return r.json();
      })
      .then((data) => {
        if (!cancelled) setTopo(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message ?? "Map data unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lookup = useMemo(() => {
    const map = new Map<string, CountryRow>();
    for (const c of countries) {
      map.set(canonicalizeCountry(c.country).toLowerCase(), c);
    }
    return map;
  }, [countries]);

  const maxCount = Math.max(1, ...countries.map((c) => c.total_count));

  // Quantize to 6 buckets; using HSL primary opacities for theme alignment
  const colorScale = useMemo(
    () =>
      scaleQuantize<string>()
        .domain([1, maxCount])
        .range([
          "hsl(var(--primary) / 0.12)",
          "hsl(var(--primary) / 0.25)",
          "hsl(var(--primary) / 0.4)",
          "hsl(var(--primary) / 0.55)",
          "hsl(var(--primary) / 0.75)",
          "hsl(var(--primary) / 0.95)",
        ]),
    [maxCount],
  );

  return (
    <Card className="relative border-border/50 bg-card/60 backdrop-blur-sm p-4 sm:p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Global Distribution</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Hover a country for details</p>
        </div>
        <Legend />
      </div>

      <div
        className="relative w-full aspect-[2/1] rounded-lg overflow-hidden bg-background/40 border border-border/40"
        onMouseLeave={() => setTooltip(null)}
      >
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
            {error}
          </div>
        ) : !topo ? (
          <Skeleton className="absolute inset-0" />
        ) : (
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 110, center: [10, 30] }}
            width={980}
            height={490}
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={topo}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = (geo.properties?.name as string) ?? "";
                  const row = lookup.get(name.toLowerCase());
                  const fill = row ? colorScale(row.total_count) : "hsl(var(--muted) / 0.35)";
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="hsl(var(--border))"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          outline: "none",
                          fill: "hsl(var(--accent) / 0.85)",
                          cursor: row ? "pointer" : "default",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={(e) => {
                        const rect = (e.currentTarget.ownerSVGElement as SVGSVGElement)
                          ?.getBoundingClientRect();
                        const parent = (
                          e.currentTarget.closest("[data-heatmap-wrap]") as HTMLElement | null
                        )?.getBoundingClientRect();
                        const px = rect && parent ? e.clientX - parent.left : e.clientX;
                        const py = rect && parent ? e.clientY - parent.top : e.clientY;
                        setTooltip({
                          x: px,
                          y: py,
                          country: name,
                          users: row?.user_count ?? 0,
                          agencies: row?.agency_count ?? 0,
                        });
                      }}
                      onMouseMove={(e) => {
                        const parent = (
                          e.currentTarget.closest("[data-heatmap-wrap]") as HTMLElement | null
                        )?.getBoundingClientRect();
                        if (!parent) return;
                        setTooltip((t) =>
                          t
                            ? { ...t, x: e.clientX - parent.left, y: e.clientY - parent.top }
                            : t,
                        );
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        )}
        <div data-heatmap-wrap className="absolute inset-0 pointer-events-none" />

        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none rounded-md border border-border/60 bg-popover/95 backdrop-blur px-3 py-2 text-xs shadow-lg"
            style={{
              left: Math.min(tooltip.x + 12, 9999),
              top: Math.max(tooltip.y - 8, 0),
              transform: "translate(0, -100%)",
            }}
          >
            <p className="font-semibold text-popover-foreground">{tooltip.country}</p>
            <p className="text-muted-foreground tabular-nums">
              <span className="text-primary">{tooltip.users}</span> users ·{" "}
              <span className="text-accent-foreground">{tooltip.agencies}</span> agencies
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function Legend() {
  const stops = [0.12, 0.25, 0.4, 0.55, 0.75, 0.95];
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Low</span>
      <div className="flex h-2 rounded-full overflow-hidden border border-border/40">
        {stops.map((o) => (
          <div
            key={o}
            className="w-4 h-full"
            style={{ backgroundColor: `hsl(var(--primary) / ${o})` }}
          />
        ))}
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">High</span>
    </div>
  );
}
