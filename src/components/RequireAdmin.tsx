import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { isDevBypassEnabled, getDevMeta } from "@/lib/dev-auth-bypass";

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { session, isReady, isAdmin, accountLoading } = useAuth();

  // Default-deny while resolving
  if (!isReady || (session && accountLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}${location.hash}`);
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />;
  }

  // Dev bypass: only with real session + dev meta admin
  if (isDevBypassEnabled()) {
    const devMeta = getDevMeta();
    if (devMeta?.role === "admin") {
      return <>{children}</>;
    }
  }

  // Fail-closed: must be explicitly true
  if (isAdmin !== true) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
