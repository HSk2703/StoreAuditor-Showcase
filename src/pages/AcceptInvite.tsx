import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";

interface ClientInviteSummary {
  id: string;
  client_email: string;
  status: string;
  managed_store_id: string;
  agency_user_id: string;
  store_name: string | null;
  store_url: string | null;
}

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<ClientInviteSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, refreshRoles } = useAuth();
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase.rpc("get_client_invite_by_token", {
        p_token: token,
      });
      if (error) {
        console.error("[AcceptInvite] lookup failed", error);
        setInvitation(null);
      } else {
        const row = Array.isArray(data) ? data[0] : null;
        if (row && row.status === "pending") {
          setInvitation(row as ClientInviteSummary);
          setEmail(row.client_email);
        } else {
          setInvitation(null);
        }
      }
      setLoading(false);
    })();
  }, [token]);

  const handleAuth = async () => {
    setAuthLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: window.location.origin + "/auth/callback" },
      });
      if (error) {
        toast({
          title: "Sign up failed",
          description:
            error.message === "Failed to fetch"
              ? "Authentication service is temporarily unreachable. Please try again shortly."
              : error.message,
          variant: "destructive",
        });
        setAuthLoading(false);
        return;
      }
      toast({
        title: "Account created",
        description:
          "Please check your email to verify your account, then come back to this page.",
      });
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        toast({
          title: "Sign in failed",
          description:
            error.message === "Failed to fetch"
              ? "Authentication service is temporarily unreachable. Please try again shortly."
              : error.message,
          variant: "destructive",
        });
        setAuthLoading(false);
        return;
      }
    }
    setAuthLoading(false);
  };

  const acceptInvitation = async () => {
    if (!user || !invitation || !token) return;
    setAccepting(true);

    const { data, error } = await supabase.rpc("accept_client_invite", {
      p_token: token,
      p_user_id: user.id,
    });

    if (error) {
      toast({
        title: "Failed to accept invitation",
        description: error.message,
        variant: "destructive",
      });
      setAccepting(false);
      return;
    }

    const result = data as { success: boolean; error?: string } | null;
    if (!result?.success) {
      toast({
        title: "Invitation could not be accepted",
        description: result?.error ?? "Unknown error",
        variant: "destructive",
      });
      setAccepting(false);
      return;
    }

    await refreshRoles();
    setAccepted(true);
    setAccepting(false);
    toast({ title: "Invitation accepted! Redirecting to your dashboard…" });
    setTimeout(() => navigate("/client"), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!token || !invitation) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="container max-w-md py-20 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-warning mb-3" />
          <h1 className="text-xl font-bold text-foreground mb-2">Invalid Invitation</h1>
          <p className="text-sm text-muted-foreground">
            This invitation link is invalid, expired, or has already been used.
          </p>
        </main>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="container max-w-md py-20 text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-success mb-3" />
          <h1 className="text-xl font-bold text-foreground mb-2">Invitation Accepted!</h1>
          <p className="text-sm text-muted-foreground">Redirecting you to your dashboard…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="container max-w-md py-12">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="text-center mb-6">
            <ShieldCheck className="mx-auto h-10 w-10 text-primary mb-3" />
            <h1 className="text-xl font-bold text-foreground">Accept Store Access</h1>
            <p className="text-sm text-muted-foreground mt-1">
              You've been invited to view performance reports for{" "}
              <span className="font-medium text-foreground">
                {invitation.store_name ?? "your store"}
              </span>
              .
            </p>
          </div>

          {!user ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {isSignUp ? "Create an account" : "Sign in"} to accept your invitation.
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                />
              </div>
              <Button
                onClick={handleAuth}
                disabled={authLoading || !email.trim() || !password}
                className="w-full gap-2"
              >
                {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Need an account?"}{" "}
                <button
                  className="text-primary hover:underline"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Signed in as <span className="font-medium text-foreground">{user.email}</span>
              </p>
              {user.email?.toLowerCase() !== invitation.client_email.toLowerCase() && (
                <div className="rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-warning">
                  This invitation was sent to{" "}
                  <span className="font-medium">{invitation.client_email}</span>. Please sign in
                  with that email to accept.
                </div>
              )}
              <Button
                onClick={acceptInvitation}
                disabled={
                  accepting ||
                  user.email?.toLowerCase() !== invitation.client_email.toLowerCase()
                }
                className="w-full gap-2"
              >
                {accepting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Accept Invitation
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AcceptInvite;
