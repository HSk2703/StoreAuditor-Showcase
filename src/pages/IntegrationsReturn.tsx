import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function IntegrationsReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<"working" | "ok" | "error">("working");
  const [message, setMessage] = useState("Finalizing secure connection...");

  const provider = params.get("provider") || params.get("appName") || "";
  const connectedAccountId =
    params.get("connectedAccountId") ||
    params.get("connected_account_id") ||
    "";
  const status = params.get("status") || "";

  useEffect(() => {
    (async () => {
      try {
        if (!provider || !connectedAccountId) {
          setState("error");
          setMessage(
            status === "success"
              ? "Provider returned success but no account ID was included. Please retry the connection."
              : "Missing connection details from provider."
          );
          return;
        }
        const { data, error } = await supabase.functions.invoke("composio-finalize-connection", {
          body: { provider, connected_account_id: connectedAccountId },
        });
        if (error || !data?.success) {
          setState("error");
          setMessage(data?.error || error?.message || "We couldn't confirm your connection.");
          return;
        }
        if (data.status === "connected") {
          window.dispatchEvent(new CustomEvent("integration:changed", {
            detail: { provider, status: "connected" },
          }));
          setState("ok");
          setMessage(`${provider} connected successfully.`);
          setTimeout(() => navigate("/integrations", { replace: true }), 1200);
        } else {
          setState("error");
          setMessage(`Connection is still ${data.status}. Please try again.`);
        }
      } catch (e: any) {
        setState("error");
        setMessage(e?.message || "Unexpected error finalizing connection.");
      }
    })();
  }, [provider, connectedAccountId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-sm w-full rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl p-8 text-center shadow-2xl">
        {state === "working" && <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />}
        {state === "ok" && <CheckCircle2 className="h-10 w-10 mx-auto text-success mb-4" />}
        {state === "error" && <XCircle className="h-10 w-10 mx-auto text-destructive mb-4" />}
        <h1 className="text-lg font-semibold mb-2">
          {state === "working" ? "Securing your connection" : state === "ok" ? "Connected" : "Connection failed"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">{message}</p>
        {state !== "working" && (
          <Button onClick={() => navigate("/integrations", { replace: true })} className="w-full">
            Back to Integrations
          </Button>
        )}
      </div>
    </div>
  );
}
