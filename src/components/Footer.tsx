import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { openCookiePreferences } from "@/components/CookieConsent";
const logoIcon = "/logo-icon.png";

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Store Audit", to: "/store-audit" },
      { label: "AI Features", to: "/#features" },
      { label: "Goals & Auto-Pilot", to: "/goals" },
      { label: "Growth Hub", to: "/growth-hub" },
      { label: "Social Media AI", to: "/social-media" },
      { label: "Pricing", to: "/pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Shopify CRO Audit", to: "/store-audit" },
      { label: "For Agencies", to: "/agency" },
      { label: "Conversion Optimization", to: "/store-audit" },
      { label: "AI Revenue Engine", to: "/revenue-engine" },
      { label: "UX Auto-Optimizer", to: "/ux-optimizer" },
      { label: "Cognitive Shopper Simulator", to: "/simulator" },
      { label: "Emotional Persuasion", to: "/emotional-personalization" },
      { label: "Agency Tools", to: "/agency-tools" },
    ],
  },
  {
    title: "Platform Capabilities",
    links: [
      { label: "AI Shopify Optimization", to: "/store-audit" },
      { label: "Conversion Rate Optimization (CRO)", to: "/store-audit" },
      { label: "eCommerce Automation Platform", to: "/auto-pilot" },
      { label: "AI Growth Operating System", to: "/" },
      { label: "Shopify Analytics & Insights", to: "/growth-hub" },
      { label: "Automated Store Audits", to: "/store-audit" },
      { label: "AI Digital Twin for eCommerce", to: "/digital-twin" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Blog", to: "/blog" },
      { label: "Contact", to: "/contact" },
      { label: "Careers", to: "/careers" },
    ],
  },
  {
    title: "Support & Legal",
    links: [
      { label: "Help Center", to: "/help-center" },
      { label: "API Documentation", to: "/docs" },
      { label: "AI Transparency", to: "/ai-transparency" },
      { label: "Responsible AI Use", to: "/ai-transparency#responsible-use" },
      { label: "AI Data Policy", to: "/ai-data-policy" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Policy", to: "/cookies" },
    ],
  },
];

const Footer = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(function Footer(props, ref) {
  return (
    <footer ref={ref} {...props} className="relative border-t border-border bg-background overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/[0.03] pointer-events-none" />

      <div className="container relative px-4 sm:px-6 py-14 sm:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-7 gap-10 lg:gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-5 group">
              <motion.img
                src={logoIcon}
                alt="Store Auditor logo"
                className="h-9 w-auto"
                whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.08 }}
                transition={{ duration: 0.6 }}
              />
              <span className="logo-text text-lg">Store Auditor</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              An AI-assisted growth operating system that helps Shopify store owners analyze, optimize, and scale their business with advanced AI and data-driven insights — under full human oversight.
            </p>
          </div>

          {footerColumns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-sm font-semibold text-foreground mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {col.title === "Support & Legal" && (
                  <li>
                    <button
                      type="button"
                      onClick={() => openCookiePreferences()}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 text-left"
                    >
                      Manage Cookies
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="grid gap-6 sm:grid-cols-3 text-xs text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">AI Store Audit</h4>
              <p className="leading-relaxed">Comprehensive Shopify store analysis covering conversion rate optimization, UX performance, SEO health, and mobile responsiveness with actionable AI recommendations</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Growth Automation</h4>
              <p className="leading-relaxed">Set revenue goals and let AI assist with executing approved strategies — from A/B testing and UX improvements to marketing campaigns and performance tracking, with human review in the loop</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Revenue Intelligence</h4>
              <p className="leading-relaxed">AI Digital Twin technology simulates changes before going live, predicting revenue impact with cognitive shopper modeling and emotional persuasion analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container px-4 sm:px-6 py-5 space-y-3">
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center sm:text-left max-w-4xl">
            Store Auditor uses AI models and automation systems to generate recommendations, simulations, insights, and optimization workflows. All AI-assisted actions remain user-controlled and subject to human review.{" "}
            <Link to="/ai-transparency" className="underline hover:text-foreground transition-colors">
              Learn how Store Auditor uses AI
            </Link>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Store Auditor — AI-assisted Growth Operating System for Shopify Stores</p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <Link to="/ai-transparency" className="hover:text-foreground transition-colors">AI Transparency</Link>
              <Link to="/ai-transparency#responsible-use" className="hover:text-foreground transition-colors">Responsible AI Use</Link>
              <Link to="/ai-data-policy" className="hover:text-foreground transition-colors">AI Data Policy</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/cookies" className="hover:text-foreground transition-colors">Cookies</Link>
              <button
                type="button"
                onClick={() => openCookiePreferences()}
                className="hover:text-foreground transition-colors"
              >
                Manage Cookies
              </button>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
