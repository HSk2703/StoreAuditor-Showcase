import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { isDevBypassEnabled, getDevMeta } from "@/lib/dev-auth-bypass";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { session, isReady } = useAuth();

  // Dev bypass check
  if (isDevBypassEnabled() && getDevMeta() !== null) {
    return <>{children}</>;
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
