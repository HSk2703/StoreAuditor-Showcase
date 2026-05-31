import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Curated, well-known tool slugs used by Composio. Logos pulled via favicon service.
// We intentionally hard-code a hand-picked set for the homepage so first paint never
// waits on Composio. The real catalog (1000+ tools) lives at /integrations/all.
const HOMEPAGE_LOGOS: { name: string; domain: string; category: string }[] = [
  { name: "Shopify", domain: "shopify.com", category: "Ecommerce" },
  { name: "Google Ads", domain: "ads.google.com", category: "Ads" },
  { name: "Meta Ads", domain: "facebook.com", category: "Ads" },
  { name: "TikTok Ads", domain: "tiktok.com", category: "Ads" },
  { name: "Google Analytics", domain: "analytics.google.com", category: "Analytics" },
  { name: "Mixpanel", domain: "mixpanel.com", category: "Analytics" },
  { name: "Amplitude", domain: "amplitude.com", category: "Analytics" },
  { name: "PostHog", domain: "posthog.com", category: "Analytics" },
  { name: "Hotjar", domain: "hotjar.com", category: "Analytics" },
  { name: "HubSpot", domain: "hubspot.com", category: "CRM" },
  { name: "Salesforce", domain: "salesforce.com", category: "CRM" },
  { name: "Pipedrive", domain: "pipedrive.com", category: "CRM" },
  { name: "Klaviyo", domain: "klaviyo.com", category: "Email" },
  { name: "Mailchimp", domain: "mailchimp.com", category: "Email" },
  { name: "Resend", domain: "resend.com", category: "Email" },
  { name: "Omnisend", domain: "omnisend.com", category: "Email" },
  { name: "Canva", domain: "canva.com", category: "Design" },
  { name: "Figma", domain: "figma.com", category: "Design" },
  { name: "Jitter", domain: "jitter.video", category: "Design" },
  { name: "Zapier", domain: "zapier.com", category: "Automation" },
  { name: "Make", domain: "make.com", category: "Automation" },
  { name: "n8n", domain: "n8n.io", category: "Automation" },
  { name: "Slack", domain: "slack.com", category: "Communication" },
  { name: "Notion", domain: "notion.so", category: "Productivity" },
  { name: "Linear", domain: "linear.app", category: "Productivity" },
  { name: "Stripe", domain: "stripe.com", category: "Payments" },
  { name: "Intercom", domain: "intercom.com", category: "Support" },
  { name: "Gorgias", domain: "gorgias.com", category: "Support" },
  { name: "Search Console", domain: "search.google.com", category: "SEO" },
  { name: "Semrush", domain: "semrush.com", category: "SEO" },
];

const CATEGORY_TAGS = ["Ads", "Analytics", "CRM", "Email", "Design", "Automation"];
const VISIBLE_COUNT = 18; // shown on screen at any time
const ROTATE_MS = 3500;

export default function ToolkitShowcase() {
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setOffset((o) => (o + 6) % HOMEPAGE_LOGOS.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, []);

  const visible = useMemo(() => {
    const out = [];
    for (let i = 0; i < VISIBLE_COUNT; i++) {
      out.push(HOMEPAGE_LOGOS[(offset + i) % HOMEPAGE_LOGOS.length]);
    }
    return out;
  }, [offset]);

  return (
    <section className="bg-surface py-16 sm:py-24">
      <div className="container max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-5">
            <Sparkles className="h-3.5 w-3.5" />
            Universal Connectivity
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
            Works Across 1,000+ Tools
          </h2>
          <p className="text-muted-foreground mx-auto text-sm sm:text-base max-w-2xl">
            Kairo connects your stack to automate growth, optimize conversions, and scale your Shopify business.
          </p>
        </motion.div>

        {/* Logo cloud */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 mb-8 min-h-[280px] sm:min-h-[180px]">
          <AnimatePresence mode="popLayout">
            {visible.map((tool) => (
              <motion.div
                key={`${tool.name}-${offset}`}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-3 sm:p-4 hover:border-primary/30 hover:bg-card transition-all"
                title={tool.name}
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${tool.domain}&sz=64`}
                  alt={tool.name}
                  loading="lazy"
                  decoding="async"
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded opacity-90 group-hover:opacity-100 transition"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
                <span className="text-[10px] sm:text-xs text-muted-foreground group-hover:text-foreground transition truncate max-w-full">
                  {tool.name}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Category tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {CATEGORY_TAGS.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="px-3 py-1 text-xs border-border/60 bg-card/40 backdrop-blur-sm cursor-pointer hover:border-primary/40 hover:text-primary transition"
              onClick={() => navigate(`/integrations?cat=${encodeURIComponent(tag)}`)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            variant="outline"
            className="gap-2 rounded-lg border-primary/30 hover:bg-primary/5 hover:border-primary/50"
            onClick={() => navigate("/integrations")}
          >
            Explore All Integrations <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
