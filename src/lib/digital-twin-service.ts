import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "./edge-function-utils";
import { getPersonalizationContext } from "./decision-tracking";

export interface BaselineSnapshot {
  store_name: string;
  estimated_monthly_visitors: number;
  current_conversion_rate: number;
  current_aov: number;
  current_monthly_revenue: number;
  key_strengths: string[];
  key_weaknesses: string[];
  tech_stack_observations: string[];
}

export interface SimulatedChange {
  id: string;
  area: string;
  change_title: string;
  current_state: string;
  proposed_state: string;
  implementation_effort: string;
  risk_level: string;
  predicted_conversion_delta: number;
  predicted_aov_delta: number;
  predicted_revenue_delta: number;
  confidence: number;
  rationale: string;
}

export interface PriceTest {
  test_name: string;
  current_price_point: string;
  tested_price_point: string;
  predicted_volume_change_percent: number;
  predicted_revenue_change_percent: number;
  recommendation: string;
}

export interface PricingAnalysis {
  current_price_positioning: string;
  price_sensitivity_score: number;
  optimal_discount_threshold: number;
  bundle_opportunity_score: number;
  price_tests: PriceTest[];
}

export interface ImpactPrediction {
  scenario_name: string;
  changes_combined: string[];
  predicted_conversion_rate: number;
  predicted_aov: number;
  predicted_monthly_revenue: number;
  uplift_percent: number;
  implementation_timeline: string;
  risk_score: number;
}

export interface RiskItem {
  risk: string;
  severity: string;
  mitigation: string;
}

export interface DigitalTwinResult {
  baseline_snapshot: BaselineSnapshot;
  simulated_changes: SimulatedChange[];
  pricing_analysis: PricingAnalysis;
  impact_predictions: ImpactPrediction[];
  baseline_conversion_rate: number;
  predicted_conversion_rate: number;
  baseline_aov: number;
  predicted_aov: number;
  baseline_monthly_revenue: number;
  predicted_monthly_revenue: number;
  confidence_score: number;
  risk_assessment: RiskItem[];
  ai_executive_summary: string;
}

export interface DigitalTwinRun {
  id: string;
  store_url: string;
  status: string;
  scenario_type: string;
  baseline_snapshot: BaselineSnapshot | null;
  simulated_changes: SimulatedChange[];
  pricing_analysis: PricingAnalysis | null;
  impact_predictions: ImpactPrediction[];
  baseline_conversion_rate: number | null;
  predicted_conversion_rate: number | null;
  baseline_aov: number | null;
  predicted_aov: number | null;
  baseline_monthly_revenue: number | null;
  predicted_monthly_revenue: number | null;
  confidence_score: number | null;
  risk_assessment: RiskItem[];
  ai_executive_summary: string | null;
  created_at: string;
  completed_at: string | null;
  last_heartbeat_at: string | null;
}

export async function runDigitalTwin(
  storeUrl: string,
  userId: string,
  scenarioType: string = "general",
  agencyId?: string,
  scenarioConfig?: Record<string, any>
): Promise<DigitalTwinRun> {
  const { data: run, error: insertErr } = await (supabase as any)
    .from("digital_twin_runs")
    .insert({
      user_id: userId,
      agency_id: agencyId || null,
      store_url: storeUrl,
      scenario_type: scenarioType,
      scenario_config: scenarioConfig || {},
      status: "running",
      last_heartbeat_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertErr) throw new Error(insertErr.message);

  await supabase.from("feature_usage_log").insert({
    user_id: userId,
    agency_id: agencyId || null,
    feature_name: "digital_twin",
    subscription_plan: "agency",
    metadata: { store_url: storeUrl, run_id: run.id, scenario_type: scenarioType },
  });

  // R3: client-side heartbeat keeps last_heartbeat_at fresh while the run is in flight
  const heartbeat = setInterval(() => {
    (supabase as any)
      .from("digital_twin_runs")
      .update({ last_heartbeat_at: new Date().toISOString() })
      .eq("id", run.id)
      .then(() => {}, () => {});
  }, 10_000);

  try {
    const founderContext = await getPersonalizationContext(userId).catch(() => null);
    const result = await invokeEdgeFunction<DigitalTwinResult>({
      functionName: "run-digital-twin",
      body: { storeUrl, scenarioType, scenarioConfig, founder_context: founderContext },
      maxRetries: 2,
      timeoutMs: 30000,
    });

    const { data: updated, error: updateErr } = await (supabase as any)
      .from("digital_twin_runs")
      .update({
        status: "completed",
        baseline_snapshot: result.baseline_snapshot as any,
        simulated_changes: result.simulated_changes as any,
        pricing_analysis: result.pricing_analysis as any,
        impact_predictions: result.impact_predictions as any,
        baseline_conversion_rate: result.baseline_conversion_rate,
        predicted_conversion_rate: result.predicted_conversion_rate,
        baseline_aov: result.baseline_aov,
        predicted_aov: result.predicted_aov,
        baseline_monthly_revenue: result.baseline_monthly_revenue,
        predicted_monthly_revenue: result.predicted_monthly_revenue,
        confidence_score: result.confidence_score,
        risk_assessment: result.risk_assessment as any,
        ai_executive_summary: result.ai_executive_summary,
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
      .from("digital_twin_runs")
      .update({ status: "failed", last_heartbeat_at: new Date().toISOString() })
      .eq("id", run.id);
    throw err;
  }
}

export async function getDigitalTwinHistory(userId: string): Promise<DigitalTwinRun[]> {
  const { data, error } = await (supabase as any)
    .from("digital_twin_runs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data || []).map(mapRun);
}

function mapRun(r: any): DigitalTwinRun {
  return {
    id: r.id,
    store_url: r.store_url,
    status: r.status,
    scenario_type: r.scenario_type || "general",
    baseline_snapshot: r.baseline_snapshot as BaselineSnapshot | null,
    simulated_changes: (r.simulated_changes || []) as SimulatedChange[],
    pricing_analysis: r.pricing_analysis as PricingAnalysis | null,
    impact_predictions: (r.impact_predictions || []) as ImpactPrediction[],
    baseline_conversion_rate: r.baseline_conversion_rate,
    predicted_conversion_rate: r.predicted_conversion_rate,
    baseline_aov: r.baseline_aov,
    predicted_aov: r.predicted_aov,
    baseline_monthly_revenue: r.baseline_monthly_revenue,
    predicted_monthly_revenue: r.predicted_monthly_revenue,
    confidence_score: r.confidence_score,
    risk_assessment: (r.risk_assessment || []) as RiskItem[],
    ai_executive_summary: r.ai_executive_summary,
    created_at: r.created_at,
    completed_at: r.completed_at,
    last_heartbeat_at: r.last_heartbeat_at ?? null,
  };
}
