import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, RefreshCcw, AlertCircle, CalendarIcon, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface FnError {
  id: string;
  function_name: string;
  user_id: string | null;
  status_code: number | null;
  error_message: string;
  context: Record<string, unknown> | null;
  created_at: string;
}

interface AuditRow {
  id: string;
  actor_user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const PAGE_SIZE = 200;

const AdminFunctionErrors = () => {
  const [tab, setTab] = useState<"errors" | "audit">("errors");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [errors, setErrors] = useState<FnError[]>([]);
  const [audits, setAudits] = useState<AuditRow[]>([]);

  // W2: filters
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();
  const [nameFilter, setNameFilter] = useState("");

  const load = async () => {
    setLoading(true);
    setErr(null);
    const fromIso = from ? new Date(from.setHours(0, 0, 0, 0)).toISOString() : null;
    const toIso = to ? new Date(new Date(to).setHours(23, 59, 59, 999)).toISOString() : null;

    if (tab === "errors") {
      // Y5: server-side search via admin-only RPC
      const { data, error } = await supabase.rpc("search_function_errors", {
        p_from: fromIso,
        p_to: toIso,
        p_query: nameFilter.trim() || null,
        p_limit: PAGE_SIZE,
      });
      if (error) setErr(error.message);
      setErrors((data ?? []) as FnError[]);
    } else {
      let q = supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(PAGE_SIZE);
      if (fromIso) q = q.gte("created_at", fromIso);
      if (toIso) q = q.lte("created_at", toIso);
      if (nameFilter.trim()) q = q.ilike("action", `%${nameFilter.trim()}%`);
      const { data, error } = await q;
      if (error) setErr(error.message);
      setAudits((data ?? []) as AuditRow[]);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tab, from, to, nameFilter]);

  const clearFilters = () => { setFrom(undefined); setTo(undefined); setNameFilter(""); };
  const hasFilters = useMemo(() => !!(from || to || nameFilter.trim()), [from, to, nameFilter]);

  // Z2: tamper-evident hash-chain verifier
  const [verifying, setVerifying] = useState(false);
  const verifyChain = async () => {
    setVerifying(true);
    const { data, error } = await supabase.rpc("verify_audit_chain", { p_limit: 5000 });
    setVerifying(false);
    if (error) { toast.error(error.message); return; }
    const r = data as { ok: boolean; checked: number; first_bad_id: string | null; first_bad_at: string | null };
    if (r.ok) {
      toast.success(`Audit chain intact — verified ${r.checked} entries`);
    } else {
      toast.error(`Tampering detected at entry ${r.first_bad_id} (${r.first_bad_at})`, { duration: 10000 });
    }
  };


  const DateBtn = ({ value, onChange, label }: { value?: Date; onChange: (d?: Date) => void; label: string }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 gap-2 font-normal", !value && "text-muted-foreground")}>
          <CalendarIcon className="h-3.5 w-3.5" />
          {value ? format(value, "MMM d, yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className={cn("p-3 pointer-events-auto")} />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <Button variant={tab === "errors" ? "default" : "outline"} size="sm" onClick={() => setTab("errors")}>Function Errors</Button>
          <Button variant={tab === "audit" ? "default" : "outline"} size="sm" onClick={() => setTab("audit")}>Admin Audit Log</Button>
        </div>
        <div className="flex gap-2">
          {tab === "audit" && (
            <Button variant="outline" size="sm" onClick={verifyChain} disabled={verifying} className="gap-2">
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Verify integrity
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={load}><RefreshCcw className="h-4 w-4 mr-2" />Refresh</Button>
        </div>

      </div>

      {/* W2 — filter bar */}
      <div className="flex items-center gap-2 flex-wrap rounded-lg border border-border/60 bg-muted/30 p-2">
        <Input
          placeholder={tab === "errors" ? "Filter by function name…" : "Filter by action…"}
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="h-8 w-56 text-xs"
        />
        <DateBtn value={from} onChange={setFrom} label="From date" />
        <DateBtn value={to} onChange={setTo} label="To date" />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 gap-1 text-xs">
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {tab === "errors" ? errors.length : audits.length} of max {PAGE_SIZE}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" />Loading…</div>
      ) : err ? (
        <div className="text-center py-12">
          <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-destructive mb-3">{err}</p>
          <Button onClick={load} variant="outline" size="sm">Retry</Button>
        </div>
      ) : tab === "errors" ? (
        errors.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground">
            {hasFilters ? "No errors match these filters" : "No function errors recorded"}
          </div>
        ) : (
          <div className="border rounded-lg divide-y">
            {errors.map((e) => (
              <div key={e.id} className="p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-medium">{e.function_name}</span>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</span>
                </div>
                <div className="text-destructive mt-1 break-words">{e.error_message}</div>
                {e.context && Object.keys(e.context).length > 0 && (
                  <pre className="text-xs text-muted-foreground mt-1 overflow-x-auto">{JSON.stringify(e.context, null, 2)}</pre>
                )}
              </div>
            ))}
          </div>
        )
      ) : audits.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg text-muted-foreground">
          {hasFilters ? "No audit rows match these filters" : "No admin actions recorded"}
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {audits.map((a) => (
            <div key={a.id} className="p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{a.action}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {a.target_type ?? "—"} · {a.target_id ?? "—"} · actor {a.actor_user_id?.slice(0, 8) ?? "system"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFunctionErrors;
