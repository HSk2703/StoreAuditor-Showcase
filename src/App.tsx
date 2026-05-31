import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider, useAuth } from "@/contexts/AuthProvider";

import DevModeBanner from "@/components/DevModeBanner";
import ReviewerBanner from "@/components/ReviewerBanner";
import BackendStatusBanner from "@/components/BackendStatusBanner";
import AICoPilot from "@/components/AICoPilot";
import AiRouteBanner from "@/components/AiRouteBanner";
import PageTransition from "@/components/PageTransition";
import { Skeleton } from "@/components/ui/skeleton";

const Index = lazy(() => import("./pages/Index"));
const StoreAudit = lazy(() => import("./pages/StoreAudit"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AuditResults = lazy(() => import("./pages/AuditResults"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SharePage = lazy(() => import("./pages/SharePage"));
const AdminLeads = lazy(() => import("./pages/AdminLeads"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminResetPassword = lazy(() => import("./pages/AdminResetPassword"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AgencyDashboard = lazy(() => import("./pages/AgencyDashboard"));
const AgencySignup = lazy(() => import("./pages/AgencySignup"));
const AgencyClientReport = lazy(() => import("./pages/AgencyClientReport"));
const AgencyMonitoring = lazy(() => import("./pages/AgencyMonitoring"));
const ClientPortal = lazy(() => import("./pages/ClientPortal"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const TeamTasks = lazy(() => import("./pages/TeamTasks"));
const PerformanceReport = lazy(() => import("./pages/PerformanceReport"));
const RequireAuth = lazy(() => import("./components/RequireAuth"));
const RequireAdmin = lazy(() => import("./components/RequireAdmin"));
const AgencySubscriptionGate = lazy(() => import("./components/AgencySubscriptionGate"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Blog = lazy(() => import("./pages/Blog"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const CompetitorAnalysisPage = lazy(() => import("./pages/CompetitorAnalysisPage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Simulator = lazy(() => import("./pages/Simulator"));
const UxOptimizer = lazy(() => import("./pages/UxOptimizer"));
const EmotionalPersonalization = lazy(() => import("./pages/EmotionalPersonalization"));
const RevenueEngine = lazy(() => import("./pages/RevenueEngine"));
const DigitalTwin = lazy(() => import("./pages/DigitalTwin"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
const ShopifyOAuth = lazy(() => import("./pages/ShopifyOAuth"));
const EnterpriseSSO = lazy(() => import("./pages/EnterpriseSSO"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const SocialMediaHub = lazy(() => import("./pages/SocialMediaHub"));
const AgencyLanding = lazy(() => import("./pages/AgencyLanding"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Integrations = lazy(() => import("./pages/Integrations"));
const IntegrationsReturn = lazy(() => import("./pages/IntegrationsReturn"));
const AutoPilot = lazy(() => import("./pages/AutoPilot"));
const AIPermissions = lazy(() => import("./pages/AIPermissions"));
const Goals = lazy(() => import("./pages/Goals"));
const GrowthHub = lazy(() => import("./pages/GrowthHub"));
const CanvaCallback = lazy(() => import("./pages/CanvaCallback"));
const CanvaReturn = lazy(() => import("./pages/CanvaReturn"));
const AcceptAgencyInvite = lazy(() => import("./pages/AcceptAgencyInvite"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const Docs = lazy(() => import("./pages/Docs"));
const CookiesPolicy = lazy(() => import("./pages/CookiesPolicy"));
const Careers = lazy(() => import("./pages/Careers"));
const AiTransparency = lazy(() => import("./pages/AiTransparency"));
const AiDataPolicy = lazy(() => import("./pages/AiDataPolicy"));

import CookieConsent from "@/components/CookieConsent";

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background p-8">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl mt-4" />
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Suspense fallback={<PageLoader />}>
      <AiRouteBanner />
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/store-audit" element={<StoreAudit />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/simulator" element={<RequireAuth><Simulator /></RequireAuth>} />
          <Route path="/ux-optimizer" element={<RequireAuth><UxOptimizer /></RequireAuth>} />
          <Route path="/emotional-personalization" element={<RequireAuth><EmotionalPersonalization /></RequireAuth>} />
          <Route path="/revenue-engine" element={<RequireAuth><RevenueEngine /></RequireAuth>} />
          <Route path="/digital-twin" element={<RequireAuth><DigitalTwin /></RequireAuth>} />
          <Route path="/account" element={<RequireAuth><MyAccount /></RequireAuth>} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/integrations/return" element={<RequireAuth><IntegrationsReturn /></RequireAuth>} />
          <Route path="/audit/:id" element={<AuditResults />} />
          <Route path="/share/:id" element={<SharePage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/shopify" element={<ShopifyOAuth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/integrations/canva/callback" element={<CanvaCallback />} />
          <Route path="/canva/return" element={<RequireAuth><CanvaReturn /></RequireAuth>} />
          <Route path="/auth/sso" element={<EnterpriseSSO />} />
          <Route path="/social-media" element={<SocialMediaHub />} />
          <Route path="/auto-pilot" element={<AutoPilot />} />
          <Route path="/ai-permissions" element={<RequireAuth><AIPermissions /></RequireAuth>} />
          <Route path="/goals" element={<RequireAuth><Goals /></RequireAuth>} />
          <Route path="/growth-hub" element={<RequireAuth><GrowthHub /></RequireAuth>} />

          <Route path="/agency-tools" element={<AgencyLanding />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/agency/signup" element={<RequireAuth><AgencySignup /></RequireAuth>} />
          <Route path="/agency" element={<RequireAuth><AgencySubscriptionGate><AgencyDashboard /></AgencySubscriptionGate></RequireAuth>} />
          <Route path="/agency/report/:storeId" element={<RequireAuth><AgencySubscriptionGate><AgencyClientReport /></AgencySubscriptionGate></RequireAuth>} />
          
          <Route path="/agency/monitoring" element={<RequireAuth><AgencySubscriptionGate><AgencyDashboard /></AgencySubscriptionGate></RequireAuth>} />
          <Route path="/agency/tasks" element={<RequireAuth><AgencySubscriptionGate><AgencyDashboard /></AgencySubscriptionGate></RequireAuth>} />
          <Route path="/agency/performance/:storeId" element={<RequireAuth><AgencySubscriptionGate><PerformanceReport /></AgencySubscriptionGate></RequireAuth>} />
          <Route path="/client" element={<RequireAuth><ClientPortal /></RequireAuth>} />
          <Route path="/client/accept-invite" element={<AcceptInvite />} />
          <Route path="/invite" element={<AcceptAgencyInvite />} />

          <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/reset-password" element={<AdminResetPassword />} />
          <Route path="/admin/leads" element={<RequireAdmin><AdminLeads /></RequireAdmin>} />

          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Blog />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiesPolicy />} />
          <Route path="/ai-transparency" element={<AiTransparency />} />
          <Route path="/ai-data-policy" element={<AiDataPolicy />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/competitor-analysis" element={<CompetitorAnalysisPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </Suspense>
  );
}

function ReviewerSpacer() {
  const { isReviewer } = useAuth();
  if (!isReviewer) return null;
  return <div className="h-[34px]" />;
}

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BackendStatusBanner />
          <DevModeBanner />
          <ReviewerBanner />
          <BrowserRouter>
            <ReviewerSpacer />
            <AnimatedRoutes />
            <AICoPilot />
            <CookieConsent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
