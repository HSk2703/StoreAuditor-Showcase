import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Settings2, ShieldCheck, BarChart3, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  acceptAll,
  applyConsentSideEffects,
  getConsent,
  isPrivacyRegion,
  onConsentChange,
  rejectAll,
  saveConsent,
  type ConsentState,
} from "@/lib/cookie-consent";

const MANAGE_EVENT = "sa:open-cookie-preferences";

export function openCookiePreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MANAGE_EVENT));
  }
}

const CookieConsent = () => {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  // Boot: load existing consent
  useEffect(() => {
    const existing = getConsent();
    setConsent(existing);

    if (existing) {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
      applyConsentSideEffects(existing);
      setShowBanner(false);
    } else if (!isPrivacyRegion()) {
      // L9: outside privacy jurisdictions — auto-accept essentials silently.
      const next = saveConsent({ analytics: true, marketing: false });
      applyConsentSideEffects(next);
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }

    const off = onConsentChange((next) => {
      setConsent(next);
      if (next) applyConsentSideEffects(next);
    });
    const handleManage = () => setShowCustomize(true);
    window.addEventListener(MANAGE_EVENT, handleManage);
    return () => {
      off();
      window.removeEventListener(MANAGE_EVENT, handleManage);
    };
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
    setShowCustomize(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
    setShowCustomize(false);
  };

  const handleSavePreferences = () => {
    saveConsent({ analytics, marketing });
    setShowBanner(false);
    setShowCustomize(false);
  };

  return (
    <>
      {/* Banner — only when no consent saved yet */}
      <AnimatePresence>
        {showBanner && !showCustomize && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 220 }}
            className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pointer-events-none"
            role="dialog"
            aria-live="polite"
            aria-label="Cookie preferences"
          >
            <div className="pointer-events-auto mx-auto max-w-5xl rounded-2xl border border-border/70 bg-background/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.45)] p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Cookie className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      We value your privacy
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      We use cookies to make Store Auditor work, measure performance, and improve your experience. You can accept all,
                      reject non-essential, or customize your choices. See our{" "}
                      <Link to="/cookies" className="text-primary underline underline-offset-2 hover:text-primary/80">
                        Cookie Policy
                      </Link>
                      .
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => setShowCustomize(true)} className="gap-1.5">
                    <Settings2 className="h-3.5 w-3.5" />
                    Customize
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleRejectAll}>
                    Reject all
                  </Button>
                  <Button size="sm" onClick={handleAcceptAll} className="shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]">
                    Accept all
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Customize modal */}
      <Dialog open={showCustomize} onOpenChange={setShowCustomize}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              Cookie preferences
            </DialogTitle>
            <DialogDescription>
              Choose what categories of cookies you want to allow. You can change this anytime from the footer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Necessary — always on */}
            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5">
              <div className="h-9 w-9 rounded-lg bg-success/15 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4.5 w-4.5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Strictly necessary</p>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                    Always on
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Required for authentication, session persistence, and core platform functionality. The site cannot work without these.
                </p>
              </div>
            </div>

            {/* Analytics */}
            <label className="flex items-start gap-3 rounded-xl border border-border/60 p-3.5 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Analytics</p>
                  <Switch checked={analytics} onCheckedChange={setAnalytics} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Microsoft Clarity and Google Analytics — anonymized usage to help us improve features and fix issues.
                </p>
              </div>
            </label>

            {/* Marketing */}
            <label className="flex items-start gap-3 rounded-xl border border-border/60 p-3.5 cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="h-9 w-9 rounded-lg bg-accent/40 flex items-center justify-center shrink-0">
                <Megaphone className="h-4.5 w-4.5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">Marketing</p>
                  <Switch checked={marketing} onCheckedChange={setMarketing} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Meta Pixel and similar — used to measure ad performance and re-engage visitors. Disabled by default.
                </p>
              </div>
            </label>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={handleRejectAll} className="sm:mr-auto gap-1.5">
              <X className="h-3.5 w-3.5" />
              Reject all
            </Button>
            <Button variant="outline" onClick={handleSavePreferences}>
              Save preferences
            </Button>
            <Button onClick={handleAcceptAll}>Accept all</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
