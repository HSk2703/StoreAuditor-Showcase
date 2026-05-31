import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminInquiries from "@/components/admin/AdminInquiries";
import AdminIndividuals from "@/components/admin/AdminIndividuals";
import AdminAgencies from "@/components/admin/AdminAgencies";
import AdminSubscribers from "@/components/admin/AdminSubscribers";
import AdminAccessControl from "@/components/admin/AdminAccessControl";
import AdminTickets from "@/components/admin/AdminTickets";
import AdminFeedback from "@/components/admin/AdminFeedback";
import AdminApplications from "@/components/admin/AdminApplications";
import AdminIntegrations from "@/components/admin/AdminIntegrations";
import AdminBehavioralAnalytics from "@/components/admin/AdminBehavioralAnalytics";
import AdminGeoIntelligence from "@/components/admin/AdminGeoIntelligence";
import AdminBlogManager from "@/components/admin/AdminBlogManager";
import AdminFunctionErrors from "@/components/admin/AdminFunctionErrors";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const sections: Record<string, React.FC> = {
  overview: AdminOverview,
  inquiries: AdminInquiries,
  individuals: AdminIndividuals,
  agencies: AdminAgencies,
  subscribers: AdminSubscribers,
  access: AdminAccessControl,
  tickets: AdminTickets,
  feedback: AdminFeedback,
  applications: AdminApplications,
  integrations: AdminIntegrations,
  behavioral: AdminBehavioralAnalytics,
  geo: AdminGeoIntelligence,
  blog: AdminBlogManager,
  observability: AdminFunctionErrors,
};

const AdminDashboard = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const navigate = useNavigate();
  const Section = sections[tab] || AdminOverview;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm font-semibold text-foreground">Admin Dashboard</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
                navigate("/admin/login");
              }}

              className="gap-2 text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6 bg-background">
            <Section />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
