import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "./edge-function-utils";

export interface SimulationPersona {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  device: "mobile" | "desktop" | "tablet";
  intent: string;
  emotional_state: {
    trust: number;
    urgency: number;
    hesitation: number;
    excitement: number;
  };
  journey: {
    step: number;
    page: string;
    action: string;
    duration_seconds: number;
    emotional_shift: string;
    drop_off_risk: number;
  }[];
  outcome: string;
  abandonment_reason: string | null;
  estimated_cart_value: number;
}

export interface SimulationResults {
  personas: SimulationPersona[];
  aggregate_metrics: {
    predicted_conversion_rate: number;
    predicted_monthly_revenue: number;
    average_cart_value: number;
    bounce_rate: number;
    cart_abandonment_rate: number;
    average_session_duration_seconds: number;
  };
  drop_off_analysis: {
    page: string;
    drop_off_percentage: number;
    primary_reason: string;
    fix_suggestion: string;
  }[];
  heatmap_insights: {
    high_engagement_areas: string[];
    low_engagement_areas: string[];
    recommended_cta_positions: string[];
  };
  top_recommendations: {
    priority: "high" | "medium" | "low";
    area: string;
    issue: string;
    suggestion: string;
    predicted_uplift: string;
  }[];
  summary: string;
}

export async function runSimulation(
  storeUrl: string,
  personaCount: number = 5,
  storeData?: any
): Promise<SimulationResults> {
  const data = await invokeEdgeFunction<SimulationResults>({
    functionName: "run-simulation",
    body: { store_url: storeUrl, persona_count: personaCount, store_data: storeData },
    maxRetries: 2,
    timeoutMs: 30000,
  });
  return data;
}

export async function saveSimulationRun(
  userId: string,
  storeUrl: string,
  results: SimulationResults,
  agencyId?: string,
  auditId?: string
): Promise<string> {
  const { data, error } = await supabase
    .from("simulation_runs")
    .insert({
      user_id: userId,
      agency_id: agencyId || null,
      store_url: storeUrl,
      store_audit_id: auditId || null,
      status: "completed",
      persona_count: results.personas.length,
      results: results as any,
      predicted_conversion_rate: results.aggregate_metrics.predicted_conversion_rate,
      predicted_revenue: results.aggregate_metrics.predicted_monthly_revenue,
      drop_off_points: results.drop_off_analysis as any,
      simulated_journeys: results.personas.map((p) => ({
        persona_id: p.id,
        name: p.name,
        outcome: p.outcome,
        journey_length: p.journey.length,
      })) as any,
      heatmap_data: results.heatmap_insights as any,
      ai_summary: results.summary,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return data.id;
}

export async function logFeatureUsage(
  userId: string,
  featureName: string,
  plan: string,
  metadata?: Record<string, any>
) {
  await supabase.from("feature_usage_log").insert({
    user_id: userId,
    feature_name: featureName,
    subscription_plan: plan,
    metadata: metadata || {},
  });
}

export async function getSimulationRuns(userId: string) {
  const { data, error } = await supabase
    .from("simulation_runs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getMonthlySimulationCount(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  
  const { count, error } = await supabase
    .from("simulation_runs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth);

  if (error) return 0;
  return count || 0;
}
