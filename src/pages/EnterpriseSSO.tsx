/**
 * Enterprise SSO Scaffold
 * -----------------------
 * UI scaffold for Agency SSO configuration and login.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";

type SSOProvider = "saml" | "google-workspace" | "azure-ad";

export default function EnterpriseSSOPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSSO = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Scaffold: detect SSO provider from email domain and redirect
      const domain = email.split("@")[1];
      toast({
        title: "SSO not yet configured",
        description: `No SSO provider configured for ${domain}. Contact your agency administrator.`,
      });
    } catch (err: any) {
      toast({ title: "SSO failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-foreground text-center mb-1">
              Enterprise Single Sign-On
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Sign in with your organisation's identity provider
            </p>

            <form onSubmit={handleSSO} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="sso-email">Work Email</Label>
                <Input
                  id="sso-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full min-h-[44px]">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Checking…</>
                ) : (
                  "Continue with SSO"
                )}
              </Button>
            </form>

            <div className="mt-6 grid gap-2">
              <p className="text-xs text-muted-foreground text-center">Supported providers</p>
              <div className="flex justify-center gap-3 text-xs text-muted-foreground">
                <span className="px-2 py-1 rounded bg-muted">SAML 2.0</span>
                <span className="px-2 py-1 rounded bg-muted">Google Workspace</span>
                <span className="px-2 py-1 rounded bg-muted">Azure AD</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
