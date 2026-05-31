import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "./edge-function-utils";
import { type AuditCategory } from "@/lib/types";

export async function generateAIRecommendation(
  categoryKey: string,
  category: AuditCategory
): Promise<string> {
  const result = await invokeEdgeFunction<{ categoryKey: string; recommendation: string }>({
    functionName: "generate-recommendations",
    body: { categoryKey, category },
    maxRetries: 1,
    timeoutMs: 15000,
  });

  return result.recommendation;
}
