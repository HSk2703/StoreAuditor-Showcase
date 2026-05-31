import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, Rocket } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";

interface Props {
  children: React.ReactNode;
}

const AgencySubscriptionGate = ({ children }: Props) => {
  const navigate = useNavigate();
  const { user, isReady, isAdmin, accountLoading } = useAuth();
  const { loading, plan, userType } = useSubscription();

  if (!isReady || loading || accountLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?redirect=/agency" replace />;
  }

  if (isAdmin || (plan === "agency" && userType === "agency")) {
    return <>{children}</>;
  }

  if (userType !== "agency") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container max-w-lg py-20 text-center">
          <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Subscribe & Register Your Agency</h1>
          <p className="text-muted-foreground mb-6">
            A paid Agency Plan subscription is required to create an agency account and access the Agency Dashboard.
          </p>
          <Button onClick={() => navigate("/agency/signup")} size="lg">
            Subscribe to Agency Plan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-lg py-20 text-center">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Agency Plan Required</h1>
          <p className="text-muted-foreground mb-6">
            Agency Dashboard is available with the Agency Plan. Please upgrade to access agency analytics and client management.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/pricing")}>
              View Plans
            </Button>
            <Button onClick={() => navigate("/pricing")}>
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencySubscriptionGate;
