import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Brain, PenTool, Palette, Rocket, BarChart3,
  Zap, Calendar
} from "lucide-react";
import SocialStrategyEngine from "@/components/social/SocialStrategyEngine";
import SocialContentGenerator from "@/components/social/SocialContentGenerator";
import SocialDesignStudio from "@/components/social/SocialDesignStudio";
import SocialCampaignBuilder from "@/components/social/SocialCampaignBuilder";
import SocialAnalyticsDashboard from "@/components/social/SocialAnalyticsDashboard";
import SocialContentCalendar from "@/components/social/SocialContentCalendar";
import TrackingConnectionGate, { TrackingBanner, useTrackingConnection } from "@/components/TrackingConnectionGate";

const tabs = [
  { value: "strategy", label: "Strategy", icon: Brain },
  { value: "content", label: "Content", icon: PenTool },
  { value: "calendar", label: "Calendar", icon: Calendar },
  { value: "design", label: "Design", icon: Palette },
  { value: "campaigns", label: "Campaigns", icon: Rocket },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
];

const SocialMediaHub = () => {
  const [activeTab, setActiveTab] = useState("strategy");
  const { hasTracking } = useTrackingConnection();
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-16">
        <div className="container px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Social Media Management</h1>
                <p className="text-sm text-muted-foreground">Plan, create, launch & optimize — all in one place</p>
              </div>
            </div>
          </motion.div>

          {/* Tracking gate banner */}
          {!hasTracking && (
            <div className="mb-6">
              <TrackingBanner onConnect={() => setShowTrackingModal(true)} />
            </div>
          )}
          <TrackingConnectionGate open={showTrackingModal} onClose={() => setShowTrackingModal(false)} />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full justify-start gap-1 bg-muted/50 p-1 h-auto flex-wrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="strategy"><SocialStrategyEngine /></TabsContent>
            <TabsContent value="content"><SocialContentGenerator /></TabsContent>
            <TabsContent value="calendar"><SocialContentCalendar /></TabsContent>
            <TabsContent value="design"><SocialDesignStudio /></TabsContent>
            <TabsContent value="campaigns"><SocialCampaignBuilder /></TabsContent>
            <TabsContent value="analytics"><SocialAnalyticsDashboard /></TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SocialMediaHub;
