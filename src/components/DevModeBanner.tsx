import { isDevBypassEnabled, getDevRole } from "@/lib/dev-auth-bypass";

export default function DevModeBanner() {
  if (!isDevBypassEnabled()) return null;

  const role = getDevRole();

  return (
    <div className="fixed bottom-0 inset-x-0 z-[9999] flex items-center justify-center gap-2 bg-warning/90 text-warning-foreground px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
      <span className="inline-block h-2 w-2 rounded-full bg-warning-foreground animate-pulse" />
      Development Mode Active — Auth Bypass Enabled
      {role && <span className="opacity-80">({role})</span>}
    </div>
  );
}
