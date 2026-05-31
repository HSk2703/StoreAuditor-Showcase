import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, CheckCircle, AlertTriangle, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";

const AcceptAgencyInvite = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, isReady, refreshRoles } = useAuth();
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    // Tokens stored as SHA-256 hashes; lookup metadata via RPC.
    supabase
      .rpc("get_agency_invite_by_token" as any, { p_token: token })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          console.error("Fetch invite error:", fetchError);
          setError("Failed to load invitation");
        } else {
          const invite = Array.isArray(data) ? data[0] : data;
          if (!invite) {
            setError("This invitation link is invalid or has already been used.");
          } else if (invite.status === "accepted") {
            setError("This invitation has already been accepted.");
          } else if (invite.status === "revoked") {
            setError("This invitation has been revoked.");
          } else if (invite.status === "expired" || new Date(invite.expires_at) < new Date()) {
            setError("This invitation has expired. Please ask the team admin to send a new one.");
          } else {
            setInvitation(invite);
            setEmail(invite.email);
          }
        }
        setLoading(false);
      });
  }, [token]);

  // Auto-accept if user is already logged in and invite is loaded
  useEffect(() => {
    if (user && invitation && !accepting && !accepted) {
      // Check email match
      if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
        setError(`This invitation was sent to ${invitation.email}. Please sign in with that email address.`);
        return;
      }
    }
  }, [user, invitation, accepting, accepted]);

  const handleAuth = async () => {
    setAuthLoading(true);
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() || email.split("@")[0] },
          emailRedirectTo: `${window.location.origin}/invite?token=${token}`,
        },
      });
      if (signUpError) {
        toast({
          title: "Sign up failed",
          description: signUpError.message === "Failed to fetch"
            ? "Authentication service is temporarily unreachable."
            : signUpError.message,
          variant: "destructive",
        });
        setAuthLoading(false);
        return;
      }
      toast({
        title: "Account created",
        description: "Please check your email to verify your account, then come back to this page.",
      });
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        toast({
          title: "Sign in failed",
          description: signInError.message === "Failed to fetch"
            ? "Authentication service is temporarily unreachable."
            : signInError.message,
          variant: "destructive",
        });
        setAuthLoading(false);
        return;
      }
    }
    setAuthLoading(false);
  };

  const acceptInvitation = async () => {
    if (!user || !invitation) return;
    setAccepting(true);

    try {
      const { data, error: rpcError } = await supabase.rpc("accept_agency_invite", {
        p_token: token!,
        p_user_id: user.id,
      });

      if (rpcError) {
        throw rpcError;
      }

      const result = typeof data === "string" ? JSON.parse(data) : data;

      if (!result.success) {
        toast({
          title: "Failed to accept invitation",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
        setAccepting(false);
        return;
      }

      setAccepted(true);
      // Refresh role cache so /agency unlocks immediately
      await refreshRoles();
      toast({
        title: "Welcome to the team!",
        description: `You've joined ${result.agency_name} as ${result.role.replace("_", " ")}`,
      });
      setTimeout(() => navigate("/agency"), 2000);
    } catch (err: any) {
      console.error("Accept invite error:", err);
      toast({
        title: "Failed to accept invitation",
        description: err.message || "Unknown error",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading || !isReady) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error || !token || !invitation) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <main className="container max-w-md py-20 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-warning mb-3" />
          <h1 className="text-xl font-bold text-foreground mb-2">Invalid Invitation</h1>
          <p className="text-sm text-muted-foreground">{error || "This invitation link is invalid or has expired."}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>
            Go Home
          </Button>
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
          <h1 className="text-xl font-bold text-foreground mb-2">Welcome to the Team!</h1>
          <p className="text-sm text-muted-foreground">Redirecting you to the agency dashboard…</p>
        </main>
      </div>
    );
  }

  const roleLabel = invitation.role?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="container max-w-md py-12">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Team Invitation</h1>
            <p className="text-sm text-muted-foreground mt-1">
              You've been invited to join as <span className="font-semibold text-foreground">{roleLabel}</span>
            </p>
          </div>

          {!user ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {isSignUp ? "Create an account" : "Sign in"} to accept your invitation.
              </p>
              {isSignUp && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email is locked to the invited address
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
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
                <button className="text-primary hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Signed in as <span className="font-medium text-foreground">{user.email}</span>
              </p>
              <Button onClick={acceptInvitation} disabled={accepting} className="w-full gap-2">
                {accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Accept Invitation & Join Team
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AcceptAgencyInvite;
