import { useCallback, useMemo, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, ArrowLeft, Building2, User, RefreshCw, ShoppingBag, Shield, Chrome, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import LoginTransition from "@/components/LoginTransition";
import { clearLocalAuthState, isAuthNetworkError, pruneExpiredAuthState } from "@/lib/auth-session";
import { withRetry, checkRateLimit, friendlyErrorMessage, logAuthEvent } from "@/lib/auth-resilience";
import { isDevBypassEnabled, devSignIn, type DevRole } from "@/lib/dev-auth-bypass";

type LoginType = "individual" | "agency";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = useMemo(() => searchParams.get("redirect") || "", [searchParams]);
  const [loginType, setLoginType] = useState<LoginType>("individual");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [devRole, setDevRole] = useState<DevRole>("user");
  const [transitionPhase, setTransitionPhase] = useState<"loading" | "success" | null>(null);
  const [pendingDestination, setPendingDestination] = useState("/dashboard");

  const resolveDestination = (isAdmin: boolean) => {
    if (redirectTarget) return redirectTarget;
    if (isAdmin) return "/admin";
    return loginType === "agency" ? "/agency" : "/dashboard";
  };

  const handleTransitionComplete = useCallback(() => {
    navigate(pendingDestination, { replace: true });
  }, [navigate, pendingDestination]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    logAuthEvent("login_attempt", email, "primary");

    try {
      checkRateLimit(`login:${email.trim().toLowerCase()}`, 5, 60_000);
    } catch {
      toast({ title: "Too many attempts", description: "Please wait a moment and try again.", variant: "destructive" });
      setLoading(false);
      setTransitionPhase(null);
      return;
    }

    // Dev bypass with role selection — uses real Supabase auth
    if (isDevBypassEnabled()) {
      const role: DevRole = loginType === "agency" ? "agency" : devRole;
      const devResult = await devSignIn(email, password, role);
      if (devResult.success) {
        logAuthEvent("login_success", email, "dev-bypass");
        const dest = role === "admin" ? "/admin" : role === "agency" ? "/agency" : "/dashboard";
        localStorage.removeItem("sa_first_visit_done");
        setPendingDestination(redirectTarget || dest);
        setTransitionPhase("loading");
        setTimeout(() => setTransitionPhase("success"), 2500);
        setLoading(false);
        return;
      }
      // If dev bypass credentials didn't match, fall through to normal login
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

      // Auth succeeded — show premium transition
      setTransitionPhase("loading");

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });

      logAuthEvent("login_success", email, "primary");
      const dest = resolveDestination(Boolean(isAdmin));
      setPendingDestination(dest);
      localStorage.removeItem("sa_first_visit_done");
      setTransitionPhase("success");
    } catch (err: unknown) {
      logAuthEvent("login_failure", friendlyErrorMessage(err), "primary");

      if (isAuthNetworkError(err)) {
        clearLocalAuthState();
      }

      // Enhanced error messages
      const raw = err instanceof Error ? err.message : String(err);
      let title = "Login failed";
      let description = friendlyErrorMessage(err);
      if (raw.includes("Email not confirmed")) {
        title = "Email not verified";
        description = "Please check your inbox and verify your email before logging in.";
      } else if (raw.includes("Invalid login credentials")) {
        title = "Invalid credentials";
        description = "The email or password you entered is incorrect. If you signed up with Google, please use the 'Continue with Google' button instead.";
      }

      toast({ title, description, variant: "destructive" });
      setTransitionPhase(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    logAuthEvent("login_attempt", "google", "oauth");

    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (err: unknown) {
      logAuthEvent("login_failure", "google oauth", "oauth");
      const msg = friendlyErrorMessage(err);
      const isNetworkIssue = isAuthNetworkError(err) || msg.toLowerCase().includes("fetch");
      toast({
        title: isNetworkIssue ? "Google sign-in temporarily unavailable" : "Google sign-in failed",
        description: isNetworkIssue
          ? "The authentication service is currently unreachable. Please try email/password or try again later."
          : msg,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      checkRateLimit(`reset:${email.trim().toLowerCase()}`, 3, 120_000);

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

  const showDevRoleSelector = isDevBypassEnabled() && loginType === "individual";

  return (
    <>
      <LoginTransition phase={transitionPhase} onComplete={handleTransitionComplete} />
      <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-foreground text-center mb-1">
              {resetMode ? "Reset Password" : "Welcome Back"}
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              {resetMode ? "Enter your email to receive a reset link" : "Sign in to your account"}
            </p>

            {/* Account type toggle */}
            {!resetMode && (
              <div className="flex rounded-lg border border-border overflow-hidden mb-6">
                <button
                  type="button"
                  onClick={() => setLoginType("individual")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    loginType === "individual"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Individual
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("agency")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
                    loginType === "agency"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  Agency
                </button>
              </div>
            )}

            {/* Google OAuth */}
            {!resetMode && (
              <div className="mb-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-h-[44px] gap-2"
                  disabled={googleLoading}
                  onClick={handleGoogleSignIn}
                >
                  {googleLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  Continue with Google
                </Button>
              </div>
            )}

            {/* Divider */}
            {!resetMode && (
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
                </div>
              </div>
            )}

            {/* Dev role selector */}
            {showDevRoleSelector && (
              <div className="mb-4 p-3 rounded-lg border border-dashed border-warning/40 bg-warning/5">
              <p className="text-xs font-medium text-warning-foreground mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  Dev Mode — Select Role
                </p>
                <div className="flex gap-1.5">
                  {(["user", "admin", "agency"] as DevRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setDevRole(role)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        devRole === role
                          ? "bg-warning/20 text-warning-foreground ring-1 ring-warning/40"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={resetMode ? handleResetPassword : handleLogin} className="grid gap-4">
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
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full min-h-[44px]">
                {loading ? (
                  <><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Please wait…</>
                ) : resetMode ? (
                  "Send Reset Link"
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Alternative auth methods */}
            {!resetMode && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link to="/auth/shopify">
                    <ShoppingBag className="h-3.5 w-3.5 mr-1.5" /> Shopify
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link to="/auth/sso">
                    <Shield className="h-3.5 w-3.5 mr-1.5" /> Enterprise SSO
                  </Link>
                </Button>
              </div>
            )}

            <div className="mt-4 flex flex-col items-center gap-2 text-sm">
              {resetMode ? (
                <button onClick={() => setResetMode(false)} className="text-primary hover:underline flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Back to login
                </button>
              ) : (
                <>
                  <button onClick={() => setResetMode(true)} className="text-muted-foreground hover:text-foreground">
                    Forgot password?
                  </button>
                  <p className="text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to={loginType === "agency" ? "/signup?type=agency" : "/signup"} className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Login;
