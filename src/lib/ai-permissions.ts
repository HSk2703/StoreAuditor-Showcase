import { AI_NAME } from "@/lib/kairo-identity";

// Execution modes
export type ExecutionMode = "manual" | "assisted" | "autopilot";

export const EXECUTION_MODES = {
  manual: {
    label: "Manual Mode",
    description: "AI suggests only — you approve each action individually",
    badge: "Default",
  },
  assisted: {
    label: "Assisted Mode",
    description: "AI prepares multiple actions — you approve in batch",
    badge: "Recommended",
  },
  autopilot: {
    label: "Auto-Pilot Mode",
    description: "Low-risk actions auto-execute; high-risk require approval",
    badge: "Beta",
  },
} as const;

// Permission categories
export interface AIPermission {
  key: string;
  label: string;
  description: string;
  category: "data" | "action";
  defaultEnabled: boolean;
  riskLevel: "low" | "high";
  minPlan: string;
}

export const AI_PERMISSIONS: AIPermission[] = [
  { key: "view_store_data", label: "View Store Data", description: "Allow AI to read your store analytics and audit data", category: "data", defaultEnabled: true, riskLevel: "low", minPlan: "free" },
  { key: "suggest_improvements", label: "Suggest Improvements", description: "AI can analyze and recommend optimizations", category: "data", defaultEnabled: true, riskLevel: "low", minPlan: "free" },
  { key: "edit_content", label: "Edit Content", description: "Modify product descriptions, headlines, and copy", category: "action", defaultEnabled: false, riskLevel: "low", minPlan: "starter" },
  { key: "modify_ui", label: "Modify UI Elements", description: "Update CTA buttons, layout adjustments, and visual tweaks", category: "action", defaultEnabled: false, riskLevel: "low", minPlan: "growth" },
  { key: "create_campaigns", label: "Create Marketing Campaigns", description: "Build and launch marketing campaigns", category: "action", defaultEnabled: false, riskLevel: "high", minPlan: "growth" },
  { key: "manage_ads", label: "Manage Ads", description: "Control Meta, Google, and TikTok ad campaigns", category: "action", defaultEnabled: false, riskLevel: "high", minPlan: "pro" },
  { key: "email_marketing", label: "Email Marketing Actions", description: "Create and send email campaigns via integrations", category: "action", defaultEnabled: false, riskLevel: "high", minPlan: "pro" },
];

export interface AIPermissionState {
  permissions: Record<string, boolean>;
  executionMode: ExecutionMode;
  onboardingCompleted: boolean;
}

const STORAGE_KEY = "kairo_ai_permissions";

export function getDefaultPermissions(): AIPermissionState {
  return {
    permissions: Object.fromEntries(AI_PERMISSIONS.map((p) => [p.key, p.defaultEnabled])),
    executionMode: "manual",
    onboardingCompleted: false,
  };
}

export function loadPermissions(): AIPermissionState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...getDefaultPermissions(), ...JSON.parse(stored) };
  } catch {}
  return getDefaultPermissions();
}

export function savePermissions(state: AIPermissionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // X5: notify other tabs immediately
  try {
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel("sa_ai_permissions");
      bc.postMessage({ type: "updated", at: Date.now() });
      bc.close();
    }
  } catch {}
}

// Risk classification for auto-pilot
export function isLowRiskAction(actionType: string): boolean {
  const lowRisk = ["content_update"];
  return lowRisk.includes(actionType);
}

// Activity log types
export interface AIActivityEntry {
  id: string;
  timestamp: string;
  actionType: string;
  title: string;
  result: "success" | "failed" | "rolled_back" | "pending";
  detail?: string;
  undoAvailable: boolean;
}
