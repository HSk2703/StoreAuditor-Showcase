// Gamification System — Core Configuration
import { AI_NAME } from "@/lib/kairo-identity";

// ─── Levels ─────────────────────────────────────────
export interface Level {
  name: string;
  minScore: number;
  icon: string;
  color: string;
  gradient: string;
}

export const LEVELS: Level[] = [
  { name: "Starter", minScore: 0, icon: "🌱", color: "text-muted-foreground", gradient: "from-slate-400 to-slate-500" },
  { name: "Builder", minScore: 15, icon: "🔧", color: "text-blue-400", gradient: "from-blue-400 to-blue-500" },
  { name: "Optimizer", minScore: 35, icon: "⚡", color: "text-cyan-400", gradient: "from-cyan-400 to-blue-500" },
  { name: "Growth Hacker", minScore: 55, icon: "🚀", color: "text-violet-400", gradient: "from-violet-400 to-purple-500" },
  { name: "Revenue Master", minScore: 75, icon: "💎", color: "text-amber-400", gradient: "from-amber-400 to-orange-500" },
  { name: "Elite Operator", minScore: 90, icon: "👑", color: "text-yellow-300", gradient: "from-yellow-300 to-amber-400" },
];

export function getLevelForScore(score: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].minScore) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getNextLevel(score: number): Level | null {
  const current = getLevelForScore(score);
  const idx = LEVELS.indexOf(current);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getLevelProgress(score: number): number {
  const current = getLevelForScore(score);
  const next = getNextLevel(score);
  if (!next) return 100;
  const range = next.minScore - current.minScore;
  return Math.round(((score - current.minScore) / range) * 100);
}

// ─── Sub-Scores ─────────────────────────────────────
export interface SubScore {
  key: string;
  label: string;
  icon: string;
  color: string;
}

export const SUB_SCORES: SubScore[] = [
  { key: "conversion", label: "Conversion", icon: "💰", color: "bg-emerald-500" },
  { key: "ux", label: "UX Score", icon: "🎨", color: "bg-blue-500" },
  { key: "traffic", label: "Traffic", icon: "📈", color: "bg-violet-500" },
  { key: "marketing", label: "Marketing", icon: "📢", color: "bg-amber-500" },
];

// ─── Achievements ─────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  condition: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_audit", title: "First Scan", description: "Run your first store audit", icon: "🔍", tier: "bronze", condition: "Run 1 audit" },
  { id: "first_optimization", title: "First Fix", description: "Apply your first AI suggestion", icon: "🔧", tier: "bronze", condition: "Apply 1 suggestion" },
  { id: "campaign_launcher", title: "Campaign Launcher", description: "Launch your first campaign", icon: "🚀", tier: "bronze", condition: "Launch 1 campaign" },
  { id: "score_50", title: "Half Century", description: "Reach a Growth Score of 50", icon: "⭐", tier: "silver", condition: "Growth Score ≥ 50" },
  { id: "streak_7", title: "On Fire", description: "Maintain a 7-day streak", icon: "🔥", tier: "silver", condition: "7-day streak" },
  { id: "conversion_boost", title: "Conversion Boost", description: "Increase conversion by 10%", icon: "📈", tier: "gold", condition: "10% conversion increase" },
  { id: "score_75", title: "Top Performer", description: "Reach a Growth Score of 75", icon: "💎", tier: "gold", condition: "Growth Score ≥ 75" },
  { id: "streak_30", title: "Unstoppable", description: "Maintain a 30-day streak", icon: "⚡", tier: "gold", condition: "30-day streak" },
  { id: "elite_score", title: "Elite Operator", description: "Reach a Growth Score of 90+", icon: "👑", tier: "platinum", condition: "Growth Score ≥ 90" },
  { id: "revenue_master", title: "Revenue Master", description: "Complete all revenue optimizations", icon: "🏆", tier: "platinum", condition: "All revenue tasks done" },
];

export const TIER_COLORS = {
  bronze: "from-amber-700 to-amber-600",
  silver: "from-slate-400 to-slate-300",
  gold: "from-yellow-500 to-amber-400",
  platinum: "from-cyan-300 to-blue-400",
};

// ─── Daily Missions ─────────────────────────────────
export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
}

export const DAILY_MISSIONS: DailyMission[] = [
  { id: "run_audit", title: "Run an Audit", description: "Scan any store for issues", xp: 15, icon: "🔍" },
  { id: "apply_suggestion", title: "Apply a Suggestion", description: `Accept 1 ${AI_NAME} recommendation`, xp: 20, icon: "✅" },
  { id: "launch_campaign", title: "Launch Campaign", description: "Schedule or publish content", xp: 25, icon: "🚀" },
  { id: "improve_score", title: "Improve Score", description: "Increase your Growth Score by 2+", xp: 30, icon: "📈" },
];

// ─── Leaderboard Entry (type only — data fetched from DB) ─────
export interface LeaderboardEntry {
  rank: number;
  storeName: string;
  score: number;
  level: string;
  trend: "up" | "down" | "stable";
  region?: string;
}
