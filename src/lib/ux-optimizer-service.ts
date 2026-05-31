import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "./edge-function-utils";
import { getPersonalizationContext } from "./decision-tracking";

export interface UxChange {
  area: string;
  current: string;
  proposed: string;
  rationale: string;
  predicted_impact: string;
}

export interface UxVariation {
  id: string;
  name: string;
  strategy: string;
  changes: UxChange[];
  predicted_metrics: {
    conversion_rate_change: number;
    bounce_rate_change: number;
    avg_session_duration_change: number;
    cart_add_rate_change: number;
    overall_uplift_percentage: number;
  };
  implementation_effort: "low" | "medium" | "high";
  confidence_score: number;
  best_for: string;
}

export interface UxOptimizationResults {
  current_analysis: {
    layout_score: number;
    usability_score: number;
    conversion_potential: number;
    strengths: string[];
    weaknesses: string[];
    critical_issues: {
      area: string;
      issue: string;
      impact: "high" | "medium" | "low";
      affected_metric: string;
    }[];
  };
  variations: UxVariation[];
  comparison_summary: string;
  quick_wins: {
    change: string;
    predicted_impact: string;
    effort: "minutes" | "hours" | "days";
  }[];
  best_variation_index: number;
}

export async function runUxOptimizer(
  storeUrl: string,
  storeData?: any,
  auditData?: any,
  userId?: string
): Promise<UxOptimizationResults> {
  let founderContext: string | null = null;
  if (userId) {
    founderContext = await getPersonalizationContext(userId).catch(() => null);
  }
  const data = await invokeEdgeFunction<UxOptimizationResults>({
    functionName: "run-ux-optimizer",
    body: { store_url: storeUrl, store_data: storeData, audit_data: auditData, founder_context: founderContext },
    maxRetries: 2,
    timeoutMs: 15000,
  });
  return data;
}

export async function saveUxOptimizationRun(
  userId: string,
  storeUrl: string,
  results: UxOptimizationResults,
  agencyId?: string,
  auditId?: string
): Promise<string> {
  const { data, error } = await supabase
    .from("ux_optimization_runs")
    .insert({
      user_id: userId,
      agency_id: agencyId || null,
      store_url: storeUrl,
      store_audit_id: auditId || null,
      status: "completed",
      current_analysis: results.current_analysis as any,
      variations: results.variations as any,
      comparison_summary: results.comparison_summary,
      best_variation_index: results.best_variation_index,
      predicted_overall_uplift: results.variations[results.best_variation_index]?.predicted_metrics?.overall_uplift_percentage || null,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function getUxOptimizationRuns(userId: string) {
  const { data, error } = await supabase
    .from("ux_optimization_runs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
