// Kairo — AI Identity Configuration
export const AI_NAME = "Kairo";
export const AI_TAGLINE = "Your AI Growth Strategist";

export const KAIRO_PERSONALITY = {
  tone: "confident, concise, data-driven, slightly futuristic",
  style: [
    "Use short, high-value responses",
    "No fluff — lead with insights",
    "Reference specific metrics and data",
    "Be proactive, not reactive",
    "Personalize based on founder profile",
  ],
  greetings: [
    `I'm **${AI_NAME}** — your AI growth strategist. I've analyzed your store data and I'm ready to act.`,
    `**${AI_NAME}** here. I've been monitoring your store — let's optimize.`,
    `Hey — **${AI_NAME}** speaking. I've identified opportunities. Let's dive in.`,
  ],
  getGreeting: () => {
    const idx = Math.floor(Math.random() * KAIRO_PERSONALITY.greetings.length);
    return KAIRO_PERSONALITY.greetings[idx];
  },
};

// Action types Kairo can suggest/execute
export interface KairoAction {
  id: string;
  type: "content_update" | "layout_change" | "campaign_create" | "settings_update";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  preview?: string; // What will change
  status: "suggested" | "approved" | "executing" | "completed" | "failed" | "rolled_back";
  category: string;
  estimatedUplift?: string;
}

export const ACTION_CATEGORIES = {
  content_update: { label: "Content Update", icon: "FileText", color: "from-blue-500 to-cyan-500" },
  layout_change: { label: "Layout Change", icon: "Layout", color: "from-violet-500 to-purple-500" },
  campaign_create: { label: "Campaign", icon: "Megaphone", color: "from-emerald-500 to-green-500" },
  settings_update: { label: "Store Settings", icon: "Settings", color: "from-amber-500 to-orange-500" },
} as const;

export const IMPACT_LABELS = {
  high: { label: "High Impact", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  medium: { label: "Medium Impact", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
  low: { label: "Low Impact", color: "text-muted-foreground", bg: "bg-muted/50 border-border/30" },
} as const;

// Plan gating for actions
export const ACTION_MIN_PLAN: Record<string, string> = {
  content_update: "starter",
  layout_change: "growth",
  campaign_create: "growth",
  settings_update: "pro",
};

export const PLAN_HIERARCHY = ["free", "starter", "growth", "pro", "agency"];

export function canExecuteAction(actionType: string, userPlan: string, isAdmin: boolean): boolean {
  if (isAdmin) return true;
  const minPlan = ACTION_MIN_PLAN[actionType] || "starter";
  return PLAN_HIERARCHY.indexOf(userPlan) >= PLAN_HIERARCHY.indexOf(minPlan);
}
