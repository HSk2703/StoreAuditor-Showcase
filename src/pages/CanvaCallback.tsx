import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const CANVA_REDIRECT_URI = "https://shopify-sparkle-score.lovable.app/integrations/canva/callback";

type Status = "exchanging" | "success" | "error";

const CanvaCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("exchanging");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setStatus("error");
      setErrorMsg("Canva authorization was denied.");
      return;
    }

    if (!code) {
      setStatus("error");
      setErrorMsg("No authorization code received.");
      return;
    }

    // Validate state
    const savedState = sessionStorage.getItem("canva_oauth_state");
    if (!savedState || savedState !== state) {
      setStatus("error");
      setErrorMsg("Invalid session state. Please try again.");
      return;
    }

    // Retrieve PKCE code_verifier
    const codeVerifier = sessionStorage.getItem("canva_code_verifier");
    if (!codeVerifier) {
      setStatus("error");
      setErrorMsg("Missing PKCE verifier. Please restart the Canva connection.");
      return;
    }

    // Clean up session storage
    sessionStorage.removeItem("canva_oauth_state");
    sessionStorage.removeItem("canva_code_verifier");

    const exchangeToken = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          setStatus("error");
          setErrorMsg("You must be logged in to connect Canva.");
          return;
        }

        const { data, error } = await supabase.functions.invoke("canva-oauth-exchange", {
          body: { code, redirect_uri: CANVA_REDIRECT_URI, code_verifier: codeVerifier },
        });

        if (error || !data?.success) {
          throw new Error(data?.error || error?.message || "Token exchange failed");
        }

        setStatus("success");
        toast.success("Canva connected successfully!");

        setTimeout(() => {
          navigate("/social-media?tab=design&canva=connected", { replace: true });
        }, 2000);
      } catch (err: unknown) {
        console.error("Canva OAuth exchange failed:", err);
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Failed to connect Canva. Please try again.");
      }
    };

    exchangeToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 max-w-md mx-auto px-6"
      >
        {status === "exchanging" && (
          <>
            <div className="h-20 w-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Connecting Canva…</h1>
            <p className="text-muted-foreground">Securely exchanging credentials. This will only take a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="h-20 w-20 mx-auto rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20"
            >
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">✅ Canva Connected</h1>
            <p className="text-muted-foreground">
              Kairo can now optimize your visuals in real-time. Redirecting…
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="h-20 w-20 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Connection Failed</h1>
            <p className="text-muted-foreground">{errorMsg}</p>
            <button
              onClick={() => navigate("/social-media?tab=design", { replace: true })}
              className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Back to Design Studio
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default CanvaCallback;
