import { useLocation } from "react-router-dom";
import AiTransparencyNotice from "@/components/AiTransparencyNotice";

const AI_MODULE_ROUTES = [
  "/auto-pilot",
  "/revenue-engine",
  "/ux-optimizer",
  "/simulator",
  "/digital-twin",
  "/emotional-personalization",
  "/social-media",
  "/growth-hub",
  "/goals",
  "/ai-permissions",
];

const AI_MODULE_PREFIXES = ["/audit/"];

/**
 * Renders a slim AI transparency banner above the page content
 * on AI-powered module routes. Mounted once in App.tsx.
 */
const AiRouteBanner = () => {
  const { pathname } = useLocation();

  const isAiModule =
    AI_MODULE_ROUTES.includes(pathname) ||
    AI_MODULE_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isAiModule) return null;

  return (
    <div className="border-b border-border/40 bg-muted/20">
      <div className="container max-w-6xl px-4 sm:px-6 py-2">
        <AiTransparencyNotice variant="inline" />
      </div>
    </div>
  );
};

export default AiRouteBanner;
