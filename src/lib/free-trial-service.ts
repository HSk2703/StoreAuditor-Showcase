import { supabase } from "@/integrations/supabase/client";

export interface FreeTrial {
  id: string;
  user_id: string;
  ip_address: string | null;
  plan_name: string;
  started_at: string;
  ends_at: string;
  status: string;
}

/** Check if user already has/had a trial */
export async function getUserTrial(userId: string): Promise<FreeTrial | null> {
  const { data } = await supabase
    .from("free_trials" as any)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  return data as unknown as FreeTrial | null;
}

/** Get user's public IP for anti-abuse */
async function getPublicIP(): Promise<string> {
  try {
    const res = await fetch("https://api.ipify.org?format=json", { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return data.ip || "unknown";
  } catch {
    return "unknown";
  }
}

/** Check if IP already used a trial */
export async function isIPUsed(ip: string): Promise<boolean> {
  if (ip === "unknown") return false;
  const { count } = await supabase
    .from("free_trials" as any)
    .select("*", { count: "exact", head: true })
    .eq("ip_address", ip);
  return (count || 0) > 0;
}

/** Start a free trial for the user */
export async function startFreeTrial(userId: string, planName: string): Promise<FreeTrial> {
  // Check existing trial
  const existing = await getUserTrial(userId);
  if (existing) throw new Error("You have already used your free trial");

  const ip = await getPublicIP();
  const ipUsed = await isIPUsed(ip);
  if (ipUsed) throw new Error("A free trial has already been used from this network");

  const endsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("free_trials" as any)
    .insert({
      user_id: userId,
      ip_address: ip,
      plan_name: planName,
      ends_at: endsAt,
      status: "active",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data as unknown as FreeTrial;
}

/** Get remaining trial time in hours */
export function getTrialRemainingHours(trial: FreeTrial): number {
  const ends = new Date(trial.ends_at).getTime();
  const now = Date.now();
  return Math.max(0, Math.round((ends - now) / (1000 * 60 * 60)));
}

/** Check if trial is still active */
export function isTrialActive(trial: FreeTrial): boolean {
  if (trial.status !== "active") return false;
  return new Date(trial.ends_at).getTime() > Date.now();
}
