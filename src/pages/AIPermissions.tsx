import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Brain } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AIPermissionsPanel from "@/components/ai-permissions/AIPermissionsPanel";
import AIActivityLog from "@/components/ai-permissions/AIActivityLog";
import KairoActivityLog from "@/components/copilot/KairoActivityLog";
import PermissionsSummaryCard from "@/components/ai-permissions/PermissionsSummaryCard";
import { usePageMeta } from "@/lib/usePageMeta";
import { AI_NAME } from "@/lib/kairo-identity";

export default function AIPermissions() {
  usePageMeta({
    title: `${AI_NAME} AI Permissions & Activity Log | Store Auditor`,
    description: `Review and control what ${AI_NAME} can access. See exactly what AI auto-drafts vs. what requires your approval, and audit every action.`,
    canonical: "/ai-permissions",
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Shield className="h-4 w-4" /> AI Permissions
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {AI_NAME} Permissions & Activity
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Control what {AI_NAME} can access and do. All actions require your approval.
          </p>
        </motion.div>

        <PermissionsSummaryCard />

        <Tabs defaultValue="permissions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-sm mx-auto">
            <TabsTrigger value="permissions" className="text-xs sm:text-sm">Permissions</TabsTrigger>
            <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity Log</TabsTrigger>
          </TabsList>
          <TabsContent value="permissions">
            <AIPermissionsPanel />
          </TabsContent>
          <TabsContent value="activity" className="space-y-6">
            <AIActivityLog />
            <div>
              <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                Composio Execution Log
              </h2>
              <KairoActivityLog />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
