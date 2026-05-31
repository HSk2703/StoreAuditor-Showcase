import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Minus, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BASE_PRICE = 199;
const INCLUDED_SEATS = 3;
const EXTRA_SEAT_PRICE = 50;
const MAX_SEATS = 50;

interface SeatCalculatorProps {
  yearly: boolean;
}

const AgencySeatCalculator = ({ yearly }: SeatCalculatorProps) => {
  const { user } = useAuth();
  const [seats, setSeats] = useState(INCLUDED_SEATS);
  const [savedSeats, setSavedSeats] = useState<number | null>(null);
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user?.id) {
        if (active) setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("agencies")
        .select("id, seats_purchased, extra_seats")
        .eq("owner_user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (!error && data) {
        const total = (data.seats_purchased ?? INCLUDED_SEATS) + (data.extra_seats ?? 0);
        setSeats(Math.max(INCLUDED_SEATS, total));
        setSavedSeats(total);
        setAgencyId(data.id);
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const extra = Math.max(0, seats - INCLUDED_SEATS);
  const monthlyTotal = BASE_PRICE + extra * EXTRA_SEAT_PRICE;
  const yearlyTotal = Math.round(monthlyTotal * 12 * 0.9);
  const displayPerMonth = yearly ? Math.round(yearlyTotal / 12) : monthlyTotal;

  const persist = async () => {
    if (!agencyId) {
      toast.info("Sign in to your agency account to save seat configuration");
      return;
    }
    setSaving(true);
    const idempotencyKey = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
    const { data, error } = await supabase.functions.invoke("update-agency-seats", {
      body: { agency_id: agencyId, total_seats: seats, idempotency_key: idempotencyKey },
      headers: { "Idempotency-Key": idempotencyKey },
    });
    setSaving(false);
    if (error || !data?.success) {
      toast.error(data?.error || "Failed to save seat preference");
      return;
    }
    setSavedSeats(seats);
    toast.success(`Saved — ${seats} total seats`);
  };

  const isDirty = savedSeats !== null && savedSeats !== seats;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-card to-card p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Agency Seat Calculator</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Base $199/mo includes {INCLUDED_SEATS} seats · Extra seats $50/seat/month
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-1 justify-end">
            <span className="text-3xl font-extrabold text-foreground">${displayPerMonth}</span>
            <span className="text-sm text-muted-foreground">/month</span>
          </div>
          {yearly && (
            <p className="text-[11px] text-primary font-semibold mt-0.5">
              ${yearlyTotal}/year · 10% off
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-5 items-center">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Team seats</span>
            <span className="text-sm font-bold text-foreground tabular-nums">{seats}</span>
          </div>
          <Slider
            value={[seats]}
            onValueChange={(v) => setSeats(v[0])}
            min={INCLUDED_SEATS}
            max={MAX_SEATS}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
            <span>{INCLUDED_SEATS}</span>
            <span>{MAX_SEATS}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSeats((s) => Math.max(INCLUDED_SEATS, s - 1))}
            disabled={seats <= INCLUDED_SEATS}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSeats((s) => Math.min(MAX_SEATS, s + 1))}
            disabled={seats >= MAX_SEATS}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-border/50 grid sm:grid-cols-3 gap-4 text-xs">
        <div>
          <p className="text-muted-foreground">Base ({INCLUDED_SEATS} seats)</p>
          <p className="font-semibold text-foreground tabular-nums">${BASE_PRICE}/mo</p>
        </div>
        <div>
          <p className="text-muted-foreground">Extra seats</p>
          <p className="font-semibold text-foreground tabular-nums">{extra} × $50 = ${extra * EXTRA_SEAT_PRICE}/mo</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total {yearly ? "annual" : "monthly"}</p>
          <p className="font-semibold text-primary tabular-nums">
            ${yearly ? yearlyTotal : monthlyTotal}{yearly ? "/yr" : "/mo"}
          </p>
        </div>
      </div>

      {agencyId && (
        <div className="mt-5 flex items-center justify-end gap-2">
          {!isDirty && savedSeats !== null && (
            <span className="inline-flex items-center gap-1 text-[11px] text-success mr-1">
              <Check className="h-3 w-3" /> Saved
            </span>
          )}
          <Button onClick={persist} disabled={!isDirty || saving} size="sm">
            {saving && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Save seat configuration
          </Button>
        </div>
      )}
      {!agencyId && !loading && (
        <p className="mt-4 text-[11px] text-muted-foreground">
          Configuration is saved automatically once your agency account is active.
        </p>
      )}
    </motion.div>
  );
};

export default AgencySeatCalculator;
