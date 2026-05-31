import { supabase } from "@/integrations/supabase/client";

export type ActionType = "viewed" | "clicked" | "accepted" | "rejected" | "edited" | "ignored";

const ACTION_WEIGHTS: Record<ActionType, number> = {
  accepted: 5,
  edited: 4,
  clicked: 3,
  viewed: 1,
  ignored: -1,
  rejected: -4,
};

export interface DecisionEvent {
  feature_name: string;
  suggestion_id: string;
  action_type: ActionType;
  metadata?: Record<string, unknown>;
  original_content?: string;
  edited_content?: string;
}

export async function trackDecision(event: DecisionEvent) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const weight = ACTION_WEIGHTS[event.action_type] ?? 0;

  await supabase.from("ai_decision_events" as any).insert({
    user_id: user.id,
    feature_name: event.feature_name,
    suggestion_id: event.suggestion_id,
    action_type: event.action_type,
    confidence_weight: weight,
    metadata: event.metadata ?? {},
    original_content: event.original_content,
    edited_content: event.edited_content,
  });

  // Update founder profile asynchronously
  updateFounderProfile(user.id, event.action_type).catch(() => {});
}

async function updateFounderProfile(userId: string, action: ActionType) {
  const { data: existing } = await supabase
    .from("founder_profiles" as any)
    .select("*")
    .eq("user_id", userId)
    .single();

  const profile = (existing as any) ?? {
    total_accepts: 0,
    total_rejects: 0,
    total_edits: 0,
    total_ignores: 0,
    cumulative_score: 0,
  };

  const updates: Record<string, any> = {
    cumulative_score: profile.cumulative_score + ACTION_WEIGHTS[action],
    last_updated_at: new Date().toISOString(),
  };

  if (action === "accepted") updates.total_accepts = profile.total_accepts + 1;
  if (action === "rejected") updates.total_rejects = profile.total_rejects + 1;
  if (action === "edited") updates.total_edits = profile.total_edits + 1;
  if (action === "ignored") updates.total_ignores = profile.total_ignores + 1;

  // Derive preferences from cumulative data
  const totalInteractions = (updates.total_accepts ?? profile.total_accepts) +
    (updates.total_rejects ?? profile.total_rejects) +
    (updates.total_edits ?? profile.total_edits);

  if (totalInteractions > 5) {
    const acceptRate = (updates.total_accepts ?? profile.total_accepts) / totalInteractions;
    const editRate = (updates.total_edits ?? profile.total_edits) / totalInteractions;
    updates.risk_level = acceptRate > 0.7 ? "aggressive" : acceptRate < 0.3 ? "conservative" : "moderate";
    updates.strategy_bias = editRate > 0.4 ? "custom" : "standard";
  }

  // Fetch top features
  const { data: featureData } = await supabase
    .from("ai_decision_events" as any)
    .select("feature_name")
    .eq("user_id", userId)
    .in("action_type", ["accepted", "edited"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (featureData && featureData.length > 0) {
    const counts: Record<string, number> = {};
    (featureData as any[]).forEach((e) => {
      counts[e.feature_name] = (counts[e.feature_name] || 0) + 1;
    });
    updates.top_features = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([k]) => k);
  }

  if (existing) {
    await supabase.from("founder_profiles" as any).update(updates).eq("user_id", userId);
  } else {
    await supabase.from("founder_profiles" as any).insert({ user_id: userId, ...updates });
  }
}

export async function getFounderProfile(userId: string) {
  const { data } = await supabase
    .from("founder_profiles" as any)
    .select("*")
    .eq("user_id", userId)
    .single();
  return data as any;
}

/** Build a short personalization context string for AI prompts */
export async function getPersonalizationContext(userId: string): Promise<string | null> {
  const profile = await getFounderProfile(userId);
  if (!profile || (profile.total_accepts + profile.total_rejects + profile.total_edits) < 3) {
    return null;
  }
  const parts: string[] = [];
  if (profile.tone_preference && profile.tone_preference !== "balanced") {
    parts.push(`Preferred tone: ${profile.tone_preference}`);
  }
  if (profile.design_preference && profile.design_preference !== "balanced") {
    parts.push(`Design preference: ${profile.design_preference}`);
  }
  if (profile.strategy_bias && profile.strategy_bias !== "balanced") {
    parts.push(`Strategy approach: ${profile.strategy_bias}`);
  }
  if (profile.risk_level && profile.risk_level !== "moderate") {
    parts.push(`Risk tolerance: ${profile.risk_level}`);
  }
  if (profile.top_features?.length > 0) {
    parts.push(`Most-used features: ${profile.top_features.join(", ")}`);
  }
  const acceptRate = Math.round(
    (profile.total_accepts / (profile.total_accepts + profile.total_rejects + profile.total_edits)) * 100
  );
  if (profile.total_edits > profile.total_accepts) {
    parts.push("This user frequently edits AI outputs — provide flexible, editable suggestions");
  }
  if (acceptRate > 70) {
    parts.push("This user has a high acceptance rate — maintain current recommendation style");
  }
  return parts.length > 0 ? parts.join(". ") + "." : null;
}

export function generateSuggestionId(feature: string, context: string, index = 0): string {
  const slug = context.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
  return `${feature}-${slug}-${String(index).padStart(2, "0")}`;
}
