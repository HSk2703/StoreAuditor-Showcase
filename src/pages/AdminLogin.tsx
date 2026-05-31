import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { clearLocalAuthState, isAuthNetworkError, pruneExpiredAuthState } from "@/lib/auth-session";
import { withRetry, checkRateLimit, friendlyErrorMessage, logAuthEvent } from "@/lib/auth-resilience";
import { isDevBypassEnabled, devSignIn } from "@/lib/dev-auth-bypass";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = useMemo(() => searchParams.get("redirect") || "/admin", [searchParams]);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    logAuthEvent("login_attempt", email, "admin");

    try {
      checkRateLimit(`admin-login:${email.trim().toLowerCase()}`, 5, 60_000);
    } catch {
      toast({ title: "Too many attempts", description: "Please wait a moment and try again.", variant: "destructive" });
      setLoading(false);
      return;
    }

    // Dev bypass — admin login always maps to admin role
    if (isDevBypassEnabled()) {
      const result = devSignIn(email, password, "admin");
      if (result) {
        logAuthEvent("login_success", email, "dev-bypass");
        navigate(redirectTarget, { replace: true });
        setLoading(false);
        return;
      }
    }

    try {
      pruneExpiredAuthState();

      const data = await withRetry(async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        return data;
      }, { maxAttempts: 1, timeoutMs: 10_000 });

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });

      if (!isAdmin) {
        toast({
          title: "Access denied",
          description: "This account does not have admin access.",
          variant: "destructive",
        });
        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
        logAuthEvent("login_failure", "not admin", "admin");
        return;
      }

      logAuthEvent("login_success", email, "admin");
      navigate(redirectTarget, { replace: true });
    } catch (err: unknown) {
      logAuthEvent("login_failure", friendlyErrorMessage(err), "admin");
      if (isAuthNetworkError(err)) clearLocalAuthState();
      toast({ title: "Login failed", description: friendlyErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    logAuthEvent("signup_attempt", email, "admin");

    try {
      checkRateLimit(`admin-signup:${email.trim().toLowerCase()}`, 3, 120_000);

      await withRetry(async () => {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + "/admin/login" },
        });
        if (error) throw error;
      }, { maxAttempts: 2 });

      logAuthEvent("signup_success", email, "admin");
      toast({
        title: "Check your email",
        description: "We sent you a verification link. Please confirm your email before signing in.",
      });
      setIsSignUp(false);
    } catch (err: unknown) {
      logAuthEvent("signup_failure", friendlyErrorMessage(err), "admin");
      toast({ title: "Sign up failed", description: friendlyErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      checkRateLimit(`admin-reset:${email.trim().toLowerCase()}`, 3, 120_000);

      await withRetry(async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin + "/admin/reset-password",
        });
        if (error) throw error;
      }, { maxAttempts: 2 });

      toast({ title: "Check your email", description: "We sent you a password reset link." });
      setResetMode(false);
    } catch (err: unknown) {
      toast({ title: "Reset failed", description: friendlyErrorMessage(err), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
          </div>

          <h1 className="text-xl font-bold text-foreground text-center mb-1">
            {resetMode ? "Reset Password" : isSignUp ? "Create Account" : "Admin Login"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {resetMode
              ? "Enter your email to receive a reset link"
              : isSignUp
              ? "Sign up to access the admin dashboard"
              : "Sign in to view your leads"}
          </p>

          <form onSubmit={resetMode ? handleResetPassword : isSignUp ? handleSignUp : handleLogin} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                />
              </div>
            </div>

            {!resetMode && (
              <div className="grid gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full min-h-[44px]">
              {loading ? (
                <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Please wait…</>
              ) : resetMode ? (
                "Send Reset Link"
              ) : isSignUp ? (
                "Sign Up"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-4 flex flex-col items-center gap-2 text-sm">
            {resetMode ? (
              <button
                onClick={() => setResetMode(false)}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" /> Back to login
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                </button>
                {!isSignUp && (
                  <button
                    onClick={() => setResetMode(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
