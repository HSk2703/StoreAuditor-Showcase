import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, ExternalLink, ImageIcon, Layers, LayoutGrid, FileImage, Sparkles, CheckCircle2, Loader2, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const templates = [
  { name: "Instagram Post", size: "1080×1080", icon: ImageIcon, category: "Social" },
  { name: "Instagram Story", size: "1080×1920", icon: Layers, category: "Social" },
  { name: "Facebook Ad", size: "1200×628", icon: LayoutGrid, category: "Ads" },
  { name: "Google Display Ad", size: "300×250", icon: FileImage, category: "Ads" },
  { name: "TikTok Video Cover", size: "1080×1920", icon: ImageIcon, category: "Social" },
  { name: "Story Ad", size: "1080×1920", icon: Layers, category: "Ads" },
  { name: "Carousel Slide", size: "1080×1080", icon: LayoutGrid, category: "Social" },
  { name: "Banner Ad", size: "728×90", icon: FileImage, category: "Ads" },
];

const SocialDesignStudio = () => {
  const { user, isReviewer } = useAuth();
  const [filter, setFilter] = useState<"all" | "Social" | "Ads">("all");
  const [canvaStatus, setCanvaStatus] = useState<"disconnected" | "connected" | "loading">("loading");
  const [connecting, setConnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const filtered = filter === "all" ? templates : templates.filter((t) => t.category === filter);

  // Check Canva connection status
  useEffect(() => {
    if (!user) {
      setCanvaStatus("disconnected");
      return;
    }
    const checkConnection = async () => {
      const { data } = await supabase
        .from("user_integrations")
        .select("status")
        .eq("user_id", user.id)
        .eq("provider", "canva")
        .maybeSingle();
      setCanvaStatus(data?.status === "connected" ? "connected" : "disconnected");
    };
    checkConnection();
  }, [user]);

  // Listen for callback return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("canva") === "connected") {
      setCanvaStatus("connected");
    }
  }, []);

  const initiateCanvaOAuth = async () => {
    if (!user) {
      toast.error("Please log in to connect Canva.");
      return;
    }

    setConnecting(true);
    setShowConnectModal(true);

    try {
      // Generate PKCE code_verifier (43-128 chars, URL-safe)
      const verifierBytes = new Uint8Array(32);
      crypto.getRandomValues(verifierBytes);
      const codeVerifier = btoa(String.fromCharCode(...verifierBytes))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

      // Derive code_challenge = BASE64URL(SHA256(code_verifier))
      const encoder = new TextEncoder();
      const digest = await crypto.subtle.digest("SHA-256", encoder.encode(codeVerifier));
      const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

      // Store verifier for the callback to use during token exchange
      sessionStorage.setItem("canva_code_verifier", codeVerifier);

      // Generate unique state for CSRF protection
      const state = crypto.randomUUID();
      sessionStorage.setItem("canva_oauth_state", state);

      const redirectUri = "https://shopify-sparkle-score.lovable.app/integrations/canva/callback";
      const scopes = "design:content:read design:content:write design:meta:read asset:read asset:write profile:read";

      const { data, error } = await supabase.functions.invoke("canva-oauth-exchange", {
        body: {
          action: "get_auth_url",
          redirect_uri: redirectUri,
          state,
          scopes,
          code_challenge: codeChallenge,
          code_challenge_method: "S256",
        },
      });

      if (error || !data?.auth_url) {
        toast.error("Canva integration is not configured yet.");
        setConnecting(false);
        setShowConnectModal(false);
        return;
      }

      console.log("Canva OAuth URL:", data.auth_url);

      await new Promise((r) => setTimeout(r, 1500));
      window.location.href = data.auth_url;
    } catch (err) {
      console.error("Failed to start Canva OAuth:", err);
      toast.error("Failed to connect Canva. Please try again.");
      setConnecting(false);
      setShowConnectModal(false);
    }
  };

  const openCanva = (templateName: string) => {
    const query = encodeURIComponent(templateName);
    window.open(`https://www.canva.com/search/templates?q=${query}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Connect Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <Dialog open={showConnectModal} onOpenChange={() => {}}>
            <DialogContent className="border-primary/30 bg-card/95 backdrop-blur-xl shadow-[0_0_60px_hsl(var(--primary)/0.15)] max-w-md [&>button]:hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center gap-5 py-4"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Launching secure Canva connection…</h2>
                  <p className="text-sm text-muted-foreground mt-1">You'll be redirected to Canva to authorize access.</p>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Palette className="h-5 w-5 text-primary" /> Design Studio
              </CardTitle>
              <CardDescription>
                Create stunning ad creatives and social posts — powered by Canva
              </CardDescription>
            </div>

            {/* Canva Connection Status */}
            {canvaStatus === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : canvaStatus === "connected" ? (
              <Badge variant="outline" className="border-green-500/30 text-green-500 bg-green-500/5 gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Canva Connected
              </Badge>
            ) : (
              <Button
                onClick={initiateCanvaOAuth}
                disabled={connecting}
                className={`gap-2 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.3)] ${isReviewer ? "animate-pulse ring-2 ring-primary/50" : ""}`}
                size="sm"
              >
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Connect Canva
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            {(["all", "Social", "Ads"] as const).map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
                {f === "all" ? "All Templates" : f}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((t) => (
              <Card key={t.name} className="group hover:border-primary/40 transition-colors cursor-pointer" onClick={() => openCanva(t.name)}>
                <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <t.icon className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.size}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{t.category}</Badge>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Open in Canva <ExternalLink className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI Creative Generator */}
          <Card className="mt-6 border-primary/20 bg-gradient-to-r from-primary/5 to-violet-500/5">
            <CardContent className="pt-6 pb-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="h-14 w-14 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2 justify-center sm:justify-start">
                  AI Creative Generator <Badge variant="outline" className="text-[9px]">Coming Soon</Badge>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Generate ad creatives, product images, and social content using AI — directly inside the platform</p>
              </div>
              <Button disabled variant="outline" className="gap-2 shrink-0 opacity-75">
                <Sparkles className="h-4 w-4" /> Generate Creative
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialDesignStudio;
