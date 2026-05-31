import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "default" | "compact" | "inline" | "module";

interface AiTransparencyNoticeProps {
  variant?: Variant;
  className?: string;
  /** Optional override copy — defaults to the global disclosure text. */
  message?: string;
}

const DEFAULT_MESSAGE =
  "Store Auditor uses AI models and automation systems to generate recommendations, simulations, insights, and optimization workflows. All AI-assisted actions remain user-controlled and subject to human review.";

const MODULE_MESSAGE =
  "Kairo's recommendations, simulations, and generated outputs are AI-assisted and should be reviewed before implementation.";

/**
 * Global AI transparency disclosure.
 * Use across homepage, pricing, onboarding, integrations, AI modules, and footer
 * to meet Kickstarter AI disclosure expectations.
 */
const AiTransparencyNotice = ({
  variant = "default",
  className,
  message,
}: AiTransparencyNoticeProps) => {
  const text = message ?? (variant === "module" ? MODULE_MESSAGE : DEFAULT_MESSAGE);

  if (variant === "inline") {
    return (
      <p className={cn("text-xs text-muted-foreground leading-relaxed", className)}>
        <Sparkles className="inline h-3 w-3 mr-1 -mt-0.5 text-primary/70" aria-hidden />
        {text}{" "}
        <Link to="/ai-transparency" className="underline hover:text-foreground transition-colors">
          Learn how Store Auditor uses AI
        </Link>
      </p>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground",
          className,
        )}
        role="note"
      >
        <ShieldCheck className="h-3.5 w-3.5 mt-0.5 text-primary/80 flex-shrink-0" aria-hidden />
        <span className="leading-relaxed">
          {text}{" "}
          <Link to="/ai-transparency" className="underline hover:text-foreground transition-colors">
            Learn how Store Auditor uses AI
          </Link>
        </span>
      </div>
    );
  }

  if (variant === "module") {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-md border border-primary/15 bg-primary/[0.04] px-3 py-2 text-xs",
          className,
        )}
        role="note"
        aria-label="AI output disclosure"
      >
        <Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" aria-hidden />
        <span className="text-muted-foreground leading-relaxed">
          {text}{" "}
          <Link to="/ai-transparency" className="text-primary underline hover:text-primary/80">
            Learn more
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm p-4 sm:p-5",
        className,
      )}
      role="note"
      aria-label="AI transparency notice"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            AI transparency &amp; human oversight
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {text}
          </p>
          <Link
            to="/ai-transparency"
            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
          >
            Learn how Store Auditor uses AI →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AiTransparencyNotice;
