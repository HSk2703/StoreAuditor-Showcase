import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import GeoStats from "./geo/GeoStats";
import GeoHeatmap from "./geo/GeoHeatmap";
import TopCountries, { type CountryRow } from "./geo/TopCountries";

interface GeoData {
  unauthorized?: boolean;
  error?: string;
  total_users: number;
  total_agencies: number;
  total_countries: number;
  countries: CountryRow[];
}

export default function AdminGeoIntelligence() {
  const [data, setData] = useState<GeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error: err } = await supabase.rpc("get_geo_analytics");
      if (err) throw err;
      setData(res as unknown as GeoData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load geo analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-[420px]" />
        <Skeleton className="h-[360px]" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Failed to load Geo Intelligence</h3>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
            <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={load}>
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (data?.unauthorized) {
    return (
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm p-6">
        <p className="text-sm text-muted-foreground">{data.error ?? "Admin access required."}</p>
      </Card>
    );
  }

  const isEmpty = !data || data.total_countries === 0;
  const totalPlatform = (data?.total_users ?? 0) + (data?.total_agencies ?? 0);

  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-start justify-between gap-3 flex-wrap"
      >
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-2.5">
            <Globe2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Geo Intelligence</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live distribution of users and agencies across the planet
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" className="gap-2 text-muted-foreground" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </motion.div>

      <GeoStats
        totalUsers={data?.total_users ?? 0}
        totalAgencies={data?.total_agencies ?? 0}
        totalCountries={data?.total_countries ?? 0}
      />

      {isEmpty ? (
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm p-10 text-center">
          <Globe2 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium">No geo data yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Geo data will appear as users sign up and complete their profile location.
          </p>
        </Card>
      ) : (
        <>
          <GeoHeatmap countries={data!.countries} />
          <TopCountries countries={data!.countries} totalPlatform={totalPlatform} />
        </>
      )}
    </div>
  );
}
