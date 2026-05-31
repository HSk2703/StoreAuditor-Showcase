import { supabase } from "@/integrations/supabase/client";

/**
 * V3: best-effort admin audit logger. Server enforces caller is admin and
 * never throws back at the UI; callers should not await for UX-critical paths.
 */
export async function logAdminAction(
  action: string,
  targetType?: string | null,
  targetId?: string | null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await supabase.rpc("log_admin_action", {
      p_action: action,
      p_target_type: targetType ?? null,
      p_target_id: targetId ?? null,
      p_metadata: metadata as never,
    });
  } catch {
    // swallow — telemetry must never break the admin UX
  }
}
