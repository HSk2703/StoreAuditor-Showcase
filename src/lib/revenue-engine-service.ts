import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "./edge-function-utils";
import { getPersonalizationContext } from "./decision-tracking";

export interface DetectedIssue {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  estimated_revenue_impact_monthly: number;
  evidence: string;
}

export interface ExperimentVariation {
  name: string;
  description: string;
  predicted_uplift_percent: number;
}

export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  type: string;
  target_element: string;
  control: string;
  variations: ExperimentVariation[];
  priority: string;
  estimated_duration_days: number;
  traffic_allocation_percent: number;
  minimum_sample_size: number;
  linked_issue_id: string | null;
  expected_monthly_revenue_gain: number;
}

export interface PrioritizedAction {
  rank: number;
  action: string;
  category: string;
  effort: string;
  impact: string;
  timeline: string;
  expected_revenue_gain: number;
}

export interface RevenueEngineResult {
  detected_issues: DetectedIssue[];
  experiments: Experiment[];
  predicted_monthly_revenue: number;
  predicted_revenue_uplift: number;
  confidence_score: number;
  prioritized_actions: PrioritizedAction[];
  ai_strategy_summary: string;
}

export interface RevenueEngineRun {
  id: string;
  store_url: string;
  status: string;
  detected_issues: DetectedIssue[];
  experiments: Experiment[];
  current_monthly_revenue: number | null;
  predicted_monthly_revenue: number | null;
  predicted_revenue_uplift: number | null;
  confidence_score: number | null;
  prioritized_actions: PrioritizedAction[];
  ai_strategy_summary: string | null;
  created_at: string;
  completed_at: string | null;
  last_heartbeat_at: string | null;
}

export async function runRevenueEngine(
  storeUrl: string,
  userId: string,
  agencyId?: string,
  currentMonthlyRevenue?: number
): Promise<RevenueEngineRun> {
  const { data: run, error: insertErr } = await (supabase as any)
    .from("revenue_engine_runs")
    .insert({
      user_id: userId,
      agency_id: agencyId || null,
      store_url: storeUrl,
      current_monthly_revenue: currentMonthlyRevenue || null,
      status: "running",
      last_heartbeat_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertErr) throw new Error(insertErr.message);

  await supabase.from("feature_usage_log").insert({
    user_id: userId,
    agency_id: agencyId || null,
    feature_name: "revenue_engine",
    subscription_plan: "agency",
    metadata: { store_url: storeUrl, run_id: run.id },
  });

  // R3: heartbeat while the long-running AI job is in flight
  const heartbeat = setInterval(() => {
    (supabase as any)
      .from("revenue_engine_runs")
      .update({ last_heartbeat_at: new Date().toISOString() })
      .eq("id", run.id)
      .then(() => {}, () => {});
  }, 10_000);

  try {
    const founderContext = await getPersonalizationContext(userId).catch(() => null);
    const result = await invokeEdgeFunction<RevenueEngineResult>({
      functionName: "run-revenue-engine",
      body: { storeUrl, currentMonthlyRevenue, founder_context: founderContext },
      maxRetries: 2,
      timeoutMs: 30000,
    });

    const { data: updated, error: updateErr } = await (supabase as any)
      .from("revenue_engine_runs")
      .update({
        status: "completed",
        detected_issues: result.detected_issues as any,
        experiments: result.experiments as any,
        predicted_monthly_revenue: result.predicted_monthly_revenue,
        predicted_revenue_uplift: result.predicted_revenue_uplift,
        confidence_score: result.confidence_score,
        prioritized_actions: result.prioritized_actions as any,
        ai_strategy_summary: result.ai_strategy_summary,
        completed_at: new Date().toISOString(),
        last_heartbeat_at: new Date().toISOString(),
      })
      .eq("id", run.id)
      .select()
      .single();

    clearInterval(heartbeat);
    if (updateErr) throw new Error(updateErr.message);
    return mapRun(updated);
  } catch (err: any) {
    clearInterval(heartbeat);
    await (supabase as any)
      .from("revenue_engine_runs")
      .update({ status: "failed", last_heartbeat_at: new Date().toISOString() })
      .eq("id", run.id);
    throw err;
  }
}

export async function getRevenueEngineHistory(userId: string): Promise<RevenueEngineRun[]> {
  const { data, error } = await (supabase as any)
    .from("revenue_engine_runs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data || []).map(mapRun);
}

function mapRun(r: any): RevenueEngineRun {
  return {
    id: r.id,
    store_url: r.store_url,
    status: r.status,
    detected_issues: (r.detected_issues || []) as DetectedIssue[],
    experiments: (r.experiments || []) as Experiment[],
    current_monthly_revenue: r.current_monthly_revenue,
    predicted_monthly_revenue: r.predicted_monthly_revenue,
    predicted_revenue_uplift: r.predicted_revenue_uplift,
    confidence_score: r.confidence_score,
    prioritized_actions: (r.prioritized_actions || []) as PrioritizedAction[],
    ai_strategy_summary: r.ai_strategy_summary,
    created_at: r.created_at,
    completed_at: r.completed_at,
    last_heartbeat_at: r.last_heartbeat_at ?? null,
  };
}
