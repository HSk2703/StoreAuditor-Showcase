import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Send, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueType: string;
}

const CONTRA_URL = "https://contra.com/hira_saleem_iq3qnseh/";
const TURNSTILE_SITE_KEY = "0x4AAAAAABc1QRDKLf8B2J3c";

const revenueRanges = [
  "Under $1,000/mo",
  "$1,000 - $5,000/mo",
  "$5,000 - $20,000/mo",
  "$20,000 - $50,000/mo",
  "$50,000+/mo",
];

const LeadCaptureModal = ({ open, onOpenChange, issueType }: LeadCaptureModalProps) => {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    store_url: "",
    revenue_range: "",
    problem: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-contact", {
        body: {
          name: form.name,
          email: form.email,
          store_url: form.store_url,
          revenue_range: form.revenue_range,
          issue_type: issueType,
          form_type: "service_lead",
          turnstile_token: turnstileToken,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSubmitted(true);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setShowForm(false);
      setSubmitted(false);
      setTurnstileToken(null);
      turnstileRef.current?.reset();
      setForm({ name: "", email: "", store_url: "", revenue_range: "", problem: "" });
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {submitted ? (
          <div className="flex flex-col items-center py-6 text-center gap-3">
            <div className="rounded-full bg-success/10 p-3">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">Thanks!</DialogTitle>
              <DialogDescription className="text-center">
                We'll review your store and contact you with optimization suggestions.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => handleClose(false)} className="mt-2">Close</Button>
          </div>
        ) : !showForm ? (
          <>
            <DialogHeader>
              <DialogTitle>We can help optimize your store and improve conversions.</DialogTitle>
              <DialogDescription>Choose how you'd like to get started.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 pt-2">
              <a href={CONTRA_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-between gap-2">
                  Get Help Fixing This
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <Button onClick={() => setShowForm(true)} className="w-full justify-between gap-2">
                Request Optimization Audit
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request Optimization Audit</DialogTitle>
              <DialogDescription>Fill in your details and we'll review your store.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-3 pt-1">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="store_url">Store URL</Label>
                <Input id="store_url" required value={form.store_url} onChange={(e) => setForm({ ...form, store_url: e.target.value })} placeholder="your-store.myshopify.com" />
              </div>
              <div className="grid gap-1.5">
                <Label>Monthly Revenue Range</Label>
                <Select value={form.revenue_range} onValueChange={(v) => setForm({ ...form, revenue_range: v })}>
                  <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                  <SelectContent>
                    {revenueRanges.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="problem">Main problem to fix</Label>
                <Textarea id="problem" value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} placeholder="Describe the issue..." rows={2} />
              </div>
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                onError={() => setTurnstileToken(null)}
                onExpire={() => setTurnstileToken(null)}
                options={{ theme: "auto", size: "compact" }}
              />
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">Back</Button>
                <Button type="submit" disabled={loading || !form.revenue_range || !turnstileToken} className="flex-1">
                  {loading ? "Submitting…" : "Submit Request"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadCaptureModal;
