import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Eye, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";


const CONSENT_POLICY_VERSION = "v1";

async function logConsent(intent: "audit" | "apply") {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("ai_consent_log").insert({
      user_id: user?.id ?? null,
      intent,
      policy_version: CONSENT_POLICY_VERSION,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
    });
  } catch {
    // Fail silent — UX must not block on logging
  }
}



interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** What the user is about to do. e.g. "Run AI Audit" or "Apply AI-drafted changes" */
  intent?: "audit" | "apply";
}

const SESSION_KEY = "sa_ai_consent_session";

export function hasSessionConsent(intent: "audit" | "apply" = "audit") {
  try {
    return sessionStorage.getItem(`${SESSION_KEY}_${intent}`) === "1";
  } catch {
    return false;
  }
}

export function rememberSessionConsent(intent: "audit" | "apply" = "audit") {
  try {
    sessionStorage.setItem(`${SESSION_KEY}_${intent}`, "1");
  } catch {}
}

const COPY: Record<"audit" | "apply", { title: string; subtitle: string; cta: string; points: { icon: any; text: string }[] }> = {
  audit: {
    title: "AI-Assisted Audit — Human Oversight Required",
    subtitle: "Before we begin, please confirm you understand how this AI system works.",
    cta: "I Understand — Run AI Audit",
    points: [
      { icon: Sparkles, text: "AI will analyze your public store data to draft recommendations." },
      { icon: Eye, text: "All output is suggestion-only. Nothing is published to your store from this audit." },
      { icon: AlertTriangle, text: "AI may make mistakes. Always review insights before acting on them." },
      { icon: Shield, text: "No store changes occur without an explicit, separate approval step." },
    ],
  },
  apply: {
    title: "Approve AI-Drafted Change",
    subtitle: "You're about to apply an AI-assisted change to your store. Please review carefully.",
    cta: "Approve & Apply",
    points: [
      { icon: Sparkles, text: "This change was drafted by AI based on your audit data." },
      { icon: Eye, text: "You are the human approver. The change executes under your account." },
      { icon: AlertTriangle, text: "AI-generated content can contain errors. Verify copy, pricing, and links first." },
      { icon: CheckCircle2, text: "Every change is logged and reversible from the AI Permissions panel." },
    ],
  },
};

export default function AiAuditConsentModal({ open, onConfirm, onCancel, intent = "audit" }: Props) {
  const [ack, setAck] = useState(false);
  const [remember, setRemember] = useState(true);
  const copy = COPY[intent];

  const handleConfirm = () => {
    if (!ack) return;
    if (remember) rememberSessionConsent(intent);
    void logConsent(intent);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-lg border-border/40 bg-background/95 backdrop-blur-xl p-0 overflow-hidden">
        <div className="relative px-6 pt-7 pb-5 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent">
          <div className="flex items-center gap-2 text-xs font-medium text-primary uppercase tracking-wide mb-3">
            <Shield className="h-3.5 w-3.5" /> AI Transparency Notice
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground leading-tight">{copy.title}</h2>
          <p className="text-sm text-muted-foreground mt-1.5">{copy.subtitle}</p>
        </div>

        <div className="px-6 pb-6 space-y-3">
          {copy.points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.06 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/20"
            >
              <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                <p.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{p.text}</p>
            </motion.div>
          ))}

          <label className="flex items-start gap-2.5 p-3 rounded-lg border border-border/30 cursor-pointer hover:bg-muted/20 transition-colors">
            <Checkbox checked={ack} onCheckedChange={(v) => setAck(Boolean(v))} className="mt-0.5" />
            <span className="text-sm text-foreground/90">
              I understand this is an AI-assisted tool that requires human review. I have read the{" "}
              <Link to="/ai-transparency" className="text-primary underline-offset-2 hover:underline" target="_blank">
                AI Transparency
              </Link>{" "}
              and{" "}
              <Link to="/ai-data-policy" className="text-primary underline-offset-2 hover:underline" target="_blank">
                AI Data Policy
              </Link>
              .
            </span>
          </label>

          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
            Don't ask again for the rest of this session
          </label>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={!ack} className="flex-1 gap-2">
              <CheckCircle2 className="h-4 w-4" /> {copy.cta}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
