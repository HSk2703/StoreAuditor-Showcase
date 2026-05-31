import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "./edge-function-utils";

export interface AuditProgress {
  step: "creating" | "scraping_homepage" | "scraping_products" | "analyzing" | "generating_report" | "completed" | "failed";
  message: string;
}

const stepMessages: Record<string, string> = {
  creating: "Creating audit...",
  pending: "Initializing...",
  scraping_homepage: "Analyzing homepage...",
  scraping_products: "Analyzing product pages...",
  analyzing: "Processing store data...",
  generating_report: "Generating optimization report...",
  completed: "Audit complete!",
  failed: "Audit failed",
};

export function getStepMessage(status: string): string {
  return stepMessages[status] || "Processing...";
}

export function getStepIndex(status: string): number {
  const steps = ["creating", "scraping_homepage", "scraping_products", "analyzing", "generating_report", "completed"];
  const idx = steps.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export async function startAudit(storeUrl: string): Promise<string> {
  const data = await invokeEdgeFunction({
    functionName: "start-audit",
    body: { storeUrl },
    maxRetries: 1,
    timeoutMs: 10000,
  });

  if (!data?.id) {
    throw new Error("Failed to create audit record");
  }

  return data.id;
}

export async function runScraping(auditId: string, storeUrl: string) {
  const data = await invokeEdgeFunction({
    functionName: "scrape-store",
    body: { storeUrl, auditId },
    maxRetries: 1,
    timeoutMs: 20000,
  });

  return data.data || data;
}

export async function runAnalysis(auditId: string, scrapedData: any) {
  const data = await invokeEdgeFunction({
    functionName: "analyze-store",
    body: { auditId, scrapedData },
    maxRetries: 1,
    timeoutMs: 30000,
  });

  return data?.analysis || data;
}

export async function getAudit(auditId: string) {
  const { data, error } = await supabase
    .from("store_audits")
    .select("*")
    .eq("id", auditId)
    .single();

  if (error) throw new Error("Audit not found");
  return data;
}

export async function getPreviousAudits(limit = 10) {
  const { data, error } = await supabase
    .from("store_audits")
    .select("id, store_url, overall_score, created_at, status")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}
