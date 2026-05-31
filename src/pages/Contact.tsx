import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthProvider";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const SUBJECTS = [
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing & Subscriptions" },
  { value: "agency", label: "Agency Partnership" },
  { value: "enterprise", label: "Enterprise / SSO" },
  { value: "feedback", label: "Feature Request / Feedback" },
];

const TURNSTILE_SITE_KEY = "0x4AAAAAABc1QRDKLf8B2J3c";

const Contact = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", email: user?.email || "", subject: "general", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("submit-contact", {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject,
          message: form.message.trim(),
          user_id: user?.id || null,
          form_type: "contact",
          turnstile_token: turnstileToken,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSubmitted(true);
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-2">Get in Touch</h1>
          <p className="text-muted-foreground">Have a question, feedback, or need support? We'd love to hear from you.</p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Info */}
          <div className="md:col-span-2 space-y-4">
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Email</p>
                  <a href="mailto:support@storeauditor.io" className="text-xs text-primary hover:underline">
                    support@storeauditor.io
                  </a>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Live Chat</p>
                  <p className="text-xs text-muted-foreground">Available in-app via Kairo Co-Pilot</p>
                </div>
              </div>
            </Card>
            <Card className="p-5 border-primary/20 bg-primary/5">
              <p className="text-sm font-semibold text-foreground mb-1">Response Time</p>
              <p className="text-xs text-muted-foreground">We typically respond within 24 hours on business days. Agency and Enterprise plans receive priority support.</p>
            </Card>
          </div>

          {/* Form */}
          <Card className="md:col-span-3 p-6">
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Message Received!</h3>
                <p className="text-sm text-muted-foreground mb-4">We'll get back to you within 24 hours.</p>
                <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: "", email: user?.email || "", subject: "general", message: "" }); setTurnstileToken(null); turnstileRef.current?.reset(); }}>
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" maxLength={100} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="you@example.com" maxLength={255} />
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={form.subject} onValueChange={(v) => setForm((p) => ({ ...p, subject: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" required value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="How can we help?" rows={5} maxLength={2000} />
                </div>
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken(null)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{ theme: "auto", size: "normal" }}
                />
                <Button type="submit" disabled={loading || !turnstileToken} className="w-full rounded-full gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
