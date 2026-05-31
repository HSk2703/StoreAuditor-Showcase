import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy, Flame, Target, Zap, Award, BarChart3, Share2, Lock
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import GrowthScoreRing from "@/components/gamification/GrowthScoreRing";
import StreakWidget from "@/components/gamification/StreakWidget";
import DailyMissionsCard from "@/components/gamification/DailyMissionsCard";
import AchievementsGrid from "@/components/gamification/AchievementsGrid";
import LeaderboardTab from "@/components/gamification/LeaderboardTab";
import { DAILY_MISSIONS, getLevelForScore } from "@/lib/gamification-config";
import { AI_NAME } from "@/lib/kairo-identity";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate, { StoreConnectionBanner } from "@/components/ShopifyConnectionGate";
import { useGrowthScore } from "@/hooks/useGrowthScore";

const GrowthHub = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "leaderboard" ? "leaderboard" : "missions";
  const { plan, isAdmin } = useSubscription();
  const { toast } = useToast();
  const { hasConnectedStore, showConnectionModal, setShowConnectionModal } = useStoreConnection();
  const { data, loading: growthLoading } = useGrowthScore();
  const level = getLevelForScore(data.overall);

  const completedMissionIds = DAILY_MISSIONS.slice(0, data.missionsCompleted).map(m => m.id);

  const isPro = isAdmin || plan === "pro" || plan === "agency" || plan === "growth";

  const handleShare = () => {
    toast({
      title: "Score card generated",
      description: "Your shareable Growth Score card is ready to download",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-left mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-7 w-7 text-amber-400 shrink-0" />
            Growth Hub
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track your performance, level up, and compete
          </p>
        </motion.div>

        {/* Connection Gate */}
        {!hasConnectedStore && (
          <div className="mb-8">
            <StoreConnectionBanner onConnect={() => setShowConnectionModal(true)} />
          </div>
        )}
        <ShopifyConnectionGate open={showConnectionModal} onClose={() => setShowConnectionModal(false)} />

        {/* Top Section: Score + Streak + XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 mb-8"
        >
          {/* Growth Score */}
          <Card className="border-border bg-card/80 backdrop-blur-sm p-6 flex flex-col items-center">
            <GrowthScoreRing score={data.overall} subScores={data.subScores} />
          </Card>

          {/* Side stats */}
          <div className="flex flex-col gap-3 min-w-[200px]">
            <StreakWidget streak={data.streak} />

            <Card className="border-border bg-card/80 backdrop-blur-sm p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Total XP</span>
              </div>
              <span className="text-2xl font-extrabold text-foreground">{data.xp.toLocaleString()}</span>
              <p className="text-[10px] text-muted-foreground">Earned from missions & achievements</p>
            </Card>

            <Card className="border-border bg-card/80 backdrop-blur-sm p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-bold text-foreground">Achievements</span>
              </div>
              <span className="text-2xl font-extrabold text-foreground">
                {data.achievementsUnlocked.length}
                <span className="text-sm text-muted-foreground font-medium"> / 10</span>
              </span>
            </Card>

            <Button onClick={handleShare} variant="outline" size="sm" className="gap-2 w-full">
              <Share2 className="h-3.5 w-3.5" />
              Share My Score
            </Button>
          </div>
        </motion.div>

        {/* Tabs: Missions / Achievements / Leaderboard */}
        <Tabs defaultValue={defaultTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="missions" className="gap-1.5 text-xs">
              <Target className="h-3.5 w-3.5" /> Missions
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-1.5 text-xs">
              <Award className="h-3.5 w-3.5" /> Achievements
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-1.5 text-xs">
              <BarChart3 className="h-3.5 w-3.5" /> Leaderboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="missions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DailyMissionsCard completedIds={completedMissionIds} />

              {/* Kairo tip */}
              <Card className="border-primary/20 bg-primary/5 p-4 flex flex-col justify-center">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground mb-1">{AI_NAME}'s Tip</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {data.overall < 75
                        ? `You're ${75 - data.overall} points away from Revenue Master. Run an audit and apply suggestions to boost your score`
                        : data.overall < 90
                          ? `Almost Elite! Focus on marketing campaigns to push past 90`
                          : `Incredible — you're at Elite Operator level. Keep the streak going`}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsGrid unlockedIds={data.achievementsUnlocked} />
          </TabsContent>

          <TabsContent value="leaderboard">
            {isPro ? (
              <LeaderboardTab isAdmin={isAdmin} />
            ) : (
              <Card className="border-border bg-card p-8 text-center space-y-3">
                <Lock className="h-8 w-8 text-muted-foreground mx-auto" />
                <h3 className="text-sm font-bold text-foreground">Leaderboard — Pro Feature</h3>
                <p className="text-xs text-muted-foreground">
                  Unlock advanced growth tracking and compete with top stores
                </p>
                <Button size="sm" className="gap-2">
                  Upgrade to Pro
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default GrowthHub;
