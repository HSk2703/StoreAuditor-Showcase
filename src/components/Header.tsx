import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Menu, X, ChevronDown, User, LogOut, CreditCard, LayoutDashboard, Shield, Plug, Zap, Target, Rocket, Flame, Trophy } from "lucide-react";
import { motion } from "framer-motion";
const logoIcon = "/logo-icon.png";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";

const featuresLinks = [
  { to: "/simulator", label: "Cognitive Shopper Simulator" },
  { to: "/ux-optimizer", label: "UX Auto-Optimizer" },
  { to: "/emotional-personalization", label: "Emotional Persuasion Layer" },
  { to: "/revenue-engine", label: "Autonomous Revenue Engine" },
  { to: "/digital-twin", label: "AI Digital Twin" },
];

const prominentLinkClass = (path: string, current: string) =>
  `relative rounded-md px-3 py-1.5 text-sm font-semibold transition-colors prominent-glow ${
    current === path
      ? "text-primary"
      : "text-foreground hover:text-primary"
  }`;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, displayName, isAdmin, isReviewer } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (featuresRef.current && !featuresRef.current.contains(e.target as Node)) setFeaturesOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setFeaturesOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
    toast.success("You've been logged out successfully");
    navigate("/login");
  };

  const name = displayName || user?.email?.split("@")[0] || null;
  const initials = name ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  const navLinkClass = (path: string) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      location.pathname === path ? "text-foreground" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed ${isReviewer ? 'top-[34px]' : 'top-0'} left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300`}
    >
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        {/* LEFT — Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <motion.img
            src={logoIcon}
            alt=""
            className="h-10 sm:h-11 w-auto"
            whileHover={{ rotate: [0, -8, 8, -4, 0], scale: 1.08 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
          <span className="logo-text text-lg sm:text-xl">Store Auditor</span>
        </Link>

        {/* CENTER — Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link to="/store-audit" className={navLinkClass("/store-audit")}>Store Audit</Link>

          {/* Features dropdown */}
          <div ref={featuresRef} className="relative">
            <button
              onClick={() => setFeaturesOpen(!featuresOpen)}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features <ChevronDown className={`h-3.5 w-3.5 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
            </button>
            {featuresOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
                {featuresLinks.map(item => (
                  <Link key={item.to} to={item.to} className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{item.label}</Link>
                ))}
              </div>
            )}
          </div>

          {/* Prominent links */}
          <Link to="/goals" className={prominentLinkClass("/goals", location.pathname)}>
            <span className="inline-flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Goals</span>
          </Link>
          <Link to="/auto-pilot" className={prominentLinkClass("/auto-pilot", location.pathname)}>
            <span className="inline-flex items-center gap-1.5"><Rocket className="h-3.5 w-3.5" /> Auto-Pilot</span>
          </Link>
          <Link to="/growth-hub" className={prominentLinkClass("/growth-hub", location.pathname)}>
            <span className="inline-flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" /> Growth Hub</span>
          </Link>
          <Link to="/social-media" className={prominentLinkClass("/social-media", location.pathname)}>
            <span className="inline-flex items-center gap-1.5"><Flame className="h-3.5 w-3.5" /> Social Media</span>
          </Link>
          <Link to="/pricing" className={navLinkClass("/pricing")}>Pricing</Link>
        </nav>

        {/* RIGHT — Auth + CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div ref={profileRef} className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-accent transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{initials}</div>
                <span className="text-sm font-medium text-foreground max-w-[120px] truncate">{name}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${profileOpen ? "rotate-180" : ""}`} />
              </button>
              {profileOpen && (
                <div className="absolute top-full right-0 mt-1 w-56 rounded-lg border border-border bg-card shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-foreground truncate">{name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link to="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link to="/account" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <User className="h-4 w-4" /> My Account
                  </Link>
                  <Link to="/pricing" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <CreditCard className="h-4 w-4" /> Subscription
                  </Link>
                  <Link to="/integrations" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Plug className="h-4 w-4" /> Integrations
                  </Link>
                  <Link to="/ai-permissions" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Zap className="h-4 w-4" /> AI Permissions
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary hover:bg-accent transition-colors">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-border mt-1 pt-1">
                    <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-accent transition-colors w-full text-left">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
              <Button asChild size="sm" className="rounded-full px-6 bg-gradient-to-r from-primary to-[hsl(250,70%,60%)] hover:from-primary/90 hover:to-[hsl(250,70%,55%)] shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_28px_-4px_hsl(var(--primary)/0.5)] transition-all duration-300 hover:scale-[1.03] border-0">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* MOBILE toggle */}
        <button className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* MOBILE menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 pb-4 pt-2 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {user && (
            <>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{initials}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="h-px bg-border my-2" />
            </>
          )}

          <Link to="/store-audit" className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Store Audit</Link>

          <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</p>
          {featuresLinks.map(item => (
            <Link key={item.to} to={item.to} className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors pl-6">{item.label}</Link>
          ))}

          <div className="h-px bg-border my-2" />
          <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Core</p>
          <Link to="/goals" className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent transition-colors"><Target className="h-4 w-4" /> Goals</Link>
          <Link to="/auto-pilot" className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent transition-colors"><Rocket className="h-4 w-4" /> Auto-Pilot</Link>
          <Link to="/growth-hub" className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent transition-colors"><Trophy className="h-4 w-4" /> Growth Hub</Link>

          <div className="h-px bg-border my-2" />
          <Link to="/social-media" className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-foreground hover:text-primary hover:bg-accent transition-colors"><Flame className="h-4 w-4" /> Social Media</Link>
          <Link to="/pricing" className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Pricing</Link>

          <div className="h-px bg-border my-2" />
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme</span>
            <ThemeToggle />
          </div>
          <div className="h-px bg-border my-2" />

          {user ? (
            <>
              <Link to="/dashboard" className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Dashboard</Link>
              <Link to="/account" className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">My Account</Link>
              <Link to="/integrations" className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Integrations</Link>
              {isAdmin && <Link to="/admin" className="block rounded-md px-3 py-2.5 text-sm font-medium text-primary hover:bg-accent transition-colors">Admin Panel</Link>}
              <button onClick={handleLogout} className="block w-full text-left rounded-md px-3 py-2.5 text-sm font-medium text-destructive hover:bg-accent transition-colors">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">Login</Link>
              <div className="px-3 pt-1">
                <Button asChild className="w-full rounded-full min-h-[44px] bg-gradient-to-r from-primary to-[hsl(250,70%,60%)] border-0">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </motion.header>
  );
};

export default Header;
