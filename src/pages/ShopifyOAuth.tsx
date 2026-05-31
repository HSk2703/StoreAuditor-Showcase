/**
 * Shopify OAuth — Real Connection Flow
 * Initiates OAuth via edge function, handles callback, stores credentials.
 */
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, ShoppingBag, Loader2, CheckCircle2, Store, BarChart3, Zap, AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { invokeEdgeFunction } from "@/lib/edge-function-utils";
import Header from "@/components/Header";

const FEATURES = [
  { icon: Store, label: "Auto-import store data" },
  { icon: BarChart3, label: "AI-powered audit insights" },
  { icon: Zap, label: "Kairo AI can execute real optimizations" },
];

export default function ShopifyOAuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [shopDomain, setShopDomain] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [stores, setStores] = useState<{ id: string; store_name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [callbackProcessing, setCallbackProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's managed stores
  useEffect(() => {
    if (!user) return;
    supabase
      .from("managed_stores")
      .select("id, store_name")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setStores(data);
          setSelectedStoreId(data[0].id);
        }
      });
  }, [user]);

  // Handle OAuth callback (code + shop + state in URL params)
  useEffect(() => {
    const code = searchParams.get("code");
    const shop = searchParams.get("shop");
    const state = searchParams.get("state");

    if (code && shop && state && user) {
      setCallbackProcessing(true);
      setError(null);

      invokeEdgeFunction({
        functionName: "shopify-oauth-callback",
        body: { code, shop, state },
        maxRetries: 1,
        timeoutMs: 30000,
      })
        .then((result) => {
          if (result.success) {
            setSuccess(true);
            toast({
              title: "Shopify connected!",
              description: `${result.shop_info?.name || shop} is now linked. Kairo can execute real optimizations.`,
            });
            setTimeout(() => navigate("/agency"), 2000);
          } else {
            setError(result.error || "Connection failed");
          }
        })
        .catch((err) => {
          setError(err.message || "Failed to complete OAuth");
        })
        .finally(() => setCallbackProcessing(false));
    }
  }, [searchParams, user, navigate]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedStoreId) return;
    setLoading(true);
    setError(null);

    try {
      const redirectUri = `${window.location.origin}/auth/shopify`;

      const result = await invokeEdgeFunction({
        functionName: "shopify-oauth-initiate",
        body: {
          shop_domain: shopDomain.trim(),
          managed_store_id: selectedStoreId,
          redirect_uri: redirectUri,
        },
        maxRetries: 1,
        timeoutMs: 15000,
      });

      if (result.install_url) {
        // Redirect to Shopify OAuth consent screen
        window.location.href = result.install_url;
      } else {
        setError("Failed to generate install URL");
      }
    } catch (err: any) {
      setError(err.message || "Connection failed");
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Processing callback state
  if (callbackProcessing) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">Connecting your Shopify store...</h2>
            <p className="text-sm text-muted-foreground">Exchanging credentials and verifying access</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">Store Connected!</h2>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-center mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-foreground text-center mb-1">
              Connect Your Shopify Store
            </h1>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Link your store so Kairo can execute real optimizations
            </p>

            <div className="mb-6 space-y-2.5">
              {FEATURES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {label}
                </div>
              ))}
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-critical/30 bg-critical/5 p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-critical mt-0.5 shrink-0" />
                <p className="text-xs text-critical">{error}</p>
              </div>
            )}

            <form onSubmit={handleConnect} className="grid gap-4">
              {stores.length > 0 && (
                <div className="grid gap-1.5">
                  <Label>Select Store</Label>
                  <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.store_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-1.5">
                <Label htmlFor="shop-domain">Shopify Domain</Label>
                <div className="flex items-center gap-0">
                  <Input
                    id="shop-domain"
                    type="text"
                    required
                    value={shopDomain}
                    onChange={(e) => setShopDomain(e.target.value)}
                    placeholder="your-store"
                    className="rounded-r-none border-r-0"
                  />
                  <span className="inline-flex items-center h-9 px-3 rounded-r-md border border-l-0 border-border bg-muted text-xs text-muted-foreground whitespace-nowrap">
                    .myshopify.com
                  </span>
                </div>
              </div>

              <Button type="submit" disabled={loading || !selectedStoreId} className="w-full min-h-[44px]">
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Connecting…</>
                ) : (
                  <><ShoppingBag className="h-4 w-4 mr-2" /> Connect with Shopify</>
                )}
              </Button>
            </form>

            <p className="mt-4 text-[11px] text-muted-foreground text-center leading-relaxed">
              We'll request access to products, orders, customers, and theme data.
              Kairo will only make changes you approve. You can disconnect at any time.
            </p>

            <div className="mt-4 text-center">
              <Link to="/agency" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
