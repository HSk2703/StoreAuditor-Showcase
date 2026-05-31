import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleCallback = async () => {
      try {
        // Supabase automatically exchanges the token from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data?.session) {
          setStatus("success");
          // Clear the first-visit flag so onboarding shows
          localStorage.removeItem("sa_first_visit_done");
          // Brief pause for the success animation, then redirect
          timeout = setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
        } else {
          // No session yet — listen for auth state change (token exchange may be async)
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
              setStatus("success");
              localStorage.removeItem("sa_first_visit_done");
              timeout = setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
              subscription.unsubscribe();
            }
          });

          // Fallback timeout — if no session after 8s, show error
          timeout = setTimeout(() => {
            setStatus("error");
            subscription.unsubscribe();
          }, 8000);
        }
      } catch {
        setStatus("error");
      }
    };

    handleCallback();

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center px-6 max-w-md"
      >
        {status === "verifying" && (
          <>
            <motion.div
              className="mx-auto mb-6 relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <div className="h-20 w-20 mx-auto rounded-full gradient-primary flex items-center justify-center shadow-[0_0_40px_-8px_hsl(217_91%_60%/0.5)]">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <motion.div
                className="absolute inset-0 h-20 w-20 mx-auto rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <h1 className="text-xl font-bold text-foreground mb-2">Verifying your account</h1>
            <p className="text-sm text-muted-foreground">Preparing your AI growth engine</p>
          </>
        )}

        {status === "success" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center shadow-[0_0_30px_-8px_hsl(142_71%_45%/0.3)]">
              <motion.svg
                className="h-10 w-10 text-success"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </motion.svg>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Account verified</h1>
            <p className="text-sm text-muted-foreground">Redirecting to your dashboard…</p>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-xl font-bold text-foreground mb-2">Session expired</h1>
            <p className="text-sm text-muted-foreground mb-6">Please login again to continue</p>
            <Button onClick={() => navigate("/login", { replace: true })} className="min-h-[44px]">
              Go to Login
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthCallback;
