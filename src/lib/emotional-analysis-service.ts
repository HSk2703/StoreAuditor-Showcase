import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "./edge-function-utils";
import { getPersonalizationContext } from "./decision-tracking";

export interface EmotionalState {
  state: string;
  intensity: number;
  triggers: string[];
  current_handling: string;
  improvement: string;
}

export interface DynamicAdjustment {
  element: string;
  current_version: string;
  optimized_version: string;
  target_emotion: string;
  expected_uplift_percent: number;
  priority: string;
  rationale: string;
}

export interface VisitorSegment {
  segment: string;
  percentage: number;
  emotional_profile: string;
  recommended_approach: string;
}

export interface EmotionalAnalytics {
  trust_index: number;
  urgency_effectiveness: number;
  social_proof_strength: number;
  emotional_resonance: number;
  friction_points: number;
  persuasion_gaps: string[];
}

export interface EmotionalAnalysisResult {
  emotional_states: EmotionalState[];
  dynamic_adjustments: DynamicAdjustment[];
  persuasion_score: number;
  predicted_conversion_uplift: number;
  visitor_segments: VisitorSegment[];
  analytics: EmotionalAnalytics;
  ai_summary: string;
}

export interface EmotionalAnalysisRun {
  id: string;
  store_url: string;
  status: string;
  persuasion_score: number | null;
  predicted_conversion_uplift: number | null;
  emotional_states: EmotionalState[];
  dynamic_adjustments: DynamicAdjustment[];
  analytics: EmotionalAnalytics | null;
  ai_summary: string | null;
  created_at: string;
  completed_at: string | null;
  last_heartbeat_at: string | null;
}

export async function runEmotionalAnalysis(
  storeUrl: string,
  userId: string,
  agencyId?: string
): Promise<EmotionalAnalysisRun> {
  const { data: run, error: insertErr } = await (supabase as any)
    .from("emotional_analysis_runs")
    .insert({
      user_id: userId,
      agency_id: agencyId || null,
      store_url: storeUrl,
      status: "running",
      last_heartbeat_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertErr) throw new Error(insertErr.message);

  await supabase.from("feature_usage_log").insert({
    user_id: userId,
    agency_id: agencyId || null,
    feature_name: "emotional_personalization",
    subscription_plan: agencyId ? "agency" : "pro",
    metadata: { store_url: storeUrl, run_id: run.id },
  });

  // R3: heartbeat while AI job runs
  const heartbeat = setInterval(() => {
    (supabase as any)
      .from("emotional_analysis_runs")
      .update({ last_heartbeat_at: new Date().toISOString() })
      .eq("id", run.id)
      .then(() => {}, () => {});
  }, 10_000);

  try {
    const founderContext = await getPersonalizationContext(userId).catch(() => null);
    const result = await invokeEdgeFunction<EmotionalAnalysisResult>({
      functionName: "run-emotional-analysis",
      body: { storeUrl, founder_context: founderContext },
      maxRetries: 2,
      timeoutMs: 25000,
    });

    const { data: updated, error: updateErr } = await (supabase as any)
      .from("emotional_analysis_runs")
      .update({
        status: "completed",
        emotional_states: result.emotional_states as any,
        dynamic_adjustments: result.dynamic_adjustments as any,
        persuasion_score: result.persuasion_score,
        predicted_conversion_uplift: result.predicted_conversion_uplift,
        analytics: result.analytics as any,
        ai_summary: result.ai_summary,
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
      .from("emotional_analysis_runs")
      .update({ status: "failed", last_heartbeat_at: new Date().toISOString() })
      .eq("id", run.id);
    throw err;
  }
}

export async function getEmotionalAnalysisHistory(userId: string): Promise<EmotionalAnalysisRun[]> {
  const { data, error } = await (supabase as any)
    .from("emotional_analysis_runs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data || []).map(mapRun);
}

function mapRun(r: any): EmotionalAnalysisRun {
  return {
    id: r.id,
    store_url: r.store_url,
    status: r.status,
    persuasion_score: r.persuasion_score,
    predicted_conversion_uplift: r.predicted_conversion_uplift,
    emotional_states: (r.emotional_states || []) as EmotionalState[],
    dynamic_adjustments: (r.dynamic_adjustments || []) as DynamicAdjustment[],
    analytics: r.analytics as EmotionalAnalytics | null,
    ai_summary: r.ai_summary,
    created_at: r.created_at,
    completed_at: r.completed_at,
    last_heartbeat_at: r.last_heartbeat_at ?? null,
  };
}
