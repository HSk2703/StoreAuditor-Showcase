import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportSection {
  id: string;
  label: string;
}

interface ReportNavProps {
  sections: ReportSection[];
}

const ReportNav = ({ sections }: ReportNavProps) => {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id || "");
  const [isVisible, setIsVisible] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveId(sections[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false);
  };

  const activeLabel = sections.find((s) => s.id === activeId)?.label || "Navigate";

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Desktop: floating sidebar */}
          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-1 rounded-xl border border-border bg-card/95 backdrop-blur-sm p-2 shadow-lg"
          >
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all text-left whitespace-nowrap",
                  activeId === s.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {s.label}
              </button>
            ))}
          </motion.nav>

          {/* Mobile/Tablet: collapsible dropdown at top */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 sm:top-16 left-0 right-0 z-40 xl:hidden"
          >
            <div className="container px-4 sm:px-6 py-2">
              <div className="rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg overflow-hidden">
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-foreground"
                >
                  <span>📍 {activeLabel}</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", mobileOpen && "rotate-180")} />
                </button>
                {mobileOpen && (
                  <div className="border-t border-border px-2 pb-2 pt-1 grid grid-cols-2 gap-1">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className={cn(
                          "rounded-lg px-3 py-2 text-xs font-medium transition-all text-left",
                          activeId === s.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportNav;
