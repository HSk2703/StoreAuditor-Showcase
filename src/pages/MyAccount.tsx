import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import Header from "@/components/Header";
import AICreditsWidget from "@/components/AICreditsWidget";
import TopUpHistory from "@/components/TopUpHistory";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { User, Shield, CreditCard, Settings, Loader2, BarChart3, Target, CheckCircle2, XCircle, Brain, Sparkles, Heart, Globe2, ShoppingBag, Download } from "lucide-react";

export default function MyAccount() {
  const navigate = useNavigate();
  const { plan, userId, userType, isAuthenticated, loading: subLoading } = useSubscription();
  const [profile, setProfile] = useState<any>(null);
  const [agency, setAgency] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", city: "", country: "" });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });
  const [changingPassword, setChangingPassword] = useState(false);
  const [trackingForm, setTrackingForm] = useState({ google_analytics_id: "", meta_pixel_id: "" });
  const [savingTracking, setSavingTracking] = useState(false);

  // AI Learning Profile state
  const [aiProfile, setAiProfile] = useState({
    tone_preference: "",
    design_preference: "",
    strategy_bias: "",
    risk_level: "",
    business_type: "",
    target_audience: "",
    brand_voice: "",
    goals_description: "",
    pain_points: "",
    preferred_platforms: "",
    monthly_budget_range: "",
    decision_style: "",
  });
  const [savingAiProfile, setSavingAiProfile] = useState(false);

  useEffect(() => {
    if (!userId) return;

    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(data);
          setForm({ full_name: data.full_name || "", email: data.email || "", phone: data.phone || "", city: data.city || "", country: data.country || "" });
          setTrackingForm({
            google_analytics_id: (data as any).google_analytics_id || "",
            meta_pixel_id: (data as any).meta_pixel_id || "",
          });
        }
      });

    supabase.from("agencies").select("*").eq("owner_user_id", userId).maybeSingle()
      .then(({ data }) => { if (data) setAgency(data); });

    // Load founder profile for AI learning
    supabase.from("founder_profiles").select("*").eq("user_id", userId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAiProfile({
            tone_preference: (data as any).tone_preference || "",
            design_preference: (data as any).design_preference || "",
            strategy_bias: (data as any).strategy_bias || "",
            risk_level: (data as any).risk_level || "",
            business_type: (data as any).business_type || "",
            target_audience: (data as any).target_audience || "",
            brand_voice: (data as any).brand_voice || "",
            goals_description: (data as any).goals_description || "",
            pain_points: (data as any).pain_points || "",
            preferred_platforms: (data as any).preferred_platforms || "",
            monthly_budget_range: (data as any).monthly_budget_range || "",
            decision_style: (data as any).decision_style || "",
          });
        }
      });
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name, phone: form.phone, city: form.city, country: form.country,
    }).eq("user_id", userId);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Profile updated");
  };

  const handlePasswordChange = async () => {
    if (passwordForm.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (passwordForm.password !== passwordForm.confirm) { toast.error("Passwords don't match"); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.password });
    setChangingPassword(false);
    if (error) toast.error(error.message);
    else { toast.success("Password updated"); setPasswordForm({ password: "", confirm: "" }); }
  };

  // Z4: GDPR DSAR — export a user's data (profile + consent log + integrations)
  const [exporting, setExporting] = useState(false);
  const handleExportData = async () => {
    if (!userId) return;
    setExporting(true);
    try {
      const [profileRes, founderRes, consentRes, integrationsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", userId),
        supabase.from("founder_profiles").select("*").eq("user_id", userId),
        supabase.from("ai_consent_log").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
        supabase.from("user_integrations" as any).select("provider, status, account_name, last_verified_at, created_at").eq("user_id", userId),
      ]);

      const payload = {
        exported_at: new Date().toISOString(),
        user_id: userId,
        profile: profileRes.data ?? [],
        founder_profile: founderRes.data ?? [],
        ai_consent_log: consentRes.data ?? [],
        integrations: integrationsRes.data ?? [],
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `storeauditor-account-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Account data exported");
    } catch (e: any) {
      toast.error(e?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };


  const validateGA = (id: string) => !id || /^(G|UA|YT|MO)-[A-Za-z0-9-]+$/.test(id);
  const validatePixel = (id: string) => !id || /^\d{10,20}$/.test(id);

  const handleSaveTracking = async () => {
    if (!userId) return;
    if (!validateGA(trackingForm.google_analytics_id)) { toast.error("Invalid Google Analytics ID format"); return; }
    if (!validatePixel(trackingForm.meta_pixel_id)) { toast.error("Invalid Meta Pixel ID format"); return; }
    setSavingTracking(true);
    const { error } = await supabase.from("profiles").update({
      google_analytics_id: trackingForm.google_analytics_id || null,
      meta_pixel_id: trackingForm.meta_pixel_id || null,
    } as any).eq("user_id", userId);
    setSavingTracking(false);
    if (error) toast.error("Failed to save tracking settings");
    else toast.success("Tracking settings saved");
  };

  const handleSaveAiProfile = async () => {
    if (!userId) return;
    setSavingAiProfile(true);
    const payload: any = {
      tone_preference: aiProfile.tone_preference || null,
      design_preference: aiProfile.design_preference || null,
      strategy_bias: aiProfile.strategy_bias || null,
      risk_level: aiProfile.risk_level || null,
    };
    // Check if founder profile exists
    const { data: existing } = await supabase.from("founder_profiles").select("id").eq("user_id", userId).maybeSingle();
    if (existing) {
      await supabase.from("founder_profiles").update({ ...payload, last_updated_at: new Date().toISOString() } as any).eq("user_id", userId);
    } else {
      await supabase.from("founder_profiles").insert({ user_id: userId, ...payload } as any);
    }
    setSavingAiProfile(false);
    toast.success("AI learning profile updated — Kairo will adapt to your preferences");
  };

  if (subLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container px-4 sm:px-6 py-8 max-w-4xl mx-auto mt-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">My Account</h1>
            <p className="text-sm text-muted-foreground">Manage your profile, preferences & AI settings</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start gap-1 bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="profile" className="text-xs gap-1.5"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
            <TabsTrigger value="ai-learning" className="text-xs gap-1.5"><Brain className="h-3.5 w-3.5" /> AI Learning</TabsTrigger>
            <TabsTrigger value="tracking" className="text-xs gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Tracking</TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5"><Shield className="h-3.5 w-3.5" /> Security</TabsTrigger>
          </TabsList>

          {/* PROFILE TAB */}
          <TabsContent value="profile" className="space-y-6">
            <AICreditsWidget />
            <TopUpHistory />

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>Full Name</Label><Input value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} /></div>
                  <div><Label>Email</Label><Input value={form.email} disabled className="bg-muted/50" /></div>
                  <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                  <div><Label>City</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
                  <div><Label>Country</Label><Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} /></div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
                </Button>
              </CardContent>
            </Card>

            {agency && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" /> Agency Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><span className="font-medium text-foreground">Agency:</span> <span className="text-muted-foreground">{agency.agency_name}</span></p>
                  <p><span className="font-medium text-foreground">Email:</span> <span className="text-muted-foreground">{agency.email}</span></p>
                  {agency.website && <p><span className="font-medium text-foreground">Website:</span> <span className="text-muted-foreground">{agency.website}</span></p>}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="capitalize">{plan}</Badge>
                  <span className="text-sm text-muted-foreground">{userType === "agency" ? "Agency Plan" : `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`}</span>
                </div>
                <Button variant="outline" onClick={() => navigate("/pricing")} size="sm">View Plans & Upgrade</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI LEARNING TAB */}
          <TabsContent value="ai-learning" className="space-y-6">
            <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Help Kairo Understand You Better</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    The more Kairo knows about your business, personality, and preferences, the smarter and more personalized its recommendations become. Fill in as much as you'd like.
                  </p>
                </div>
              </div>
            </div>

            {/* Communication & Personality */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Heart className="h-4 w-4 text-primary" /> Communication & Personality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Preferred Tone</Label>
                    <Select value={aiProfile.tone_preference} onValueChange={v => setAiProfile(p => ({ ...p, tone_preference: v }))}>
                      <SelectTrigger><SelectValue placeholder="How should Kairo talk to you?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional & Formal</SelectItem>
                        <SelectItem value="friendly">Friendly & Casual</SelectItem>
                        <SelectItem value="direct">Direct & No-Nonsense</SelectItem>
                        <SelectItem value="motivational">Motivational & Encouraging</SelectItem>
                        <SelectItem value="technical">Technical & Data-Driven</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Decision-Making Style</Label>
                    <Select value={aiProfile.decision_style} onValueChange={v => setAiProfile(p => ({ ...p, decision_style: v }))}>
                      <SelectTrigger><SelectValue placeholder="How do you make decisions?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="data_driven">Data-Driven — Show me the numbers</SelectItem>
                        <SelectItem value="intuitive">Intuitive — Go with what feels right</SelectItem>
                        <SelectItem value="collaborative">Collaborative — Let's discuss options</SelectItem>
                        <SelectItem value="fast">Fast-Mover — Just tell me what to do</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Risk Appetite</Label>
                    <Select value={aiProfile.risk_level} onValueChange={v => setAiProfile(p => ({ ...p, risk_level: v }))}>
                      <SelectTrigger><SelectValue placeholder="Your risk tolerance" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conservative">Conservative — Safe, proven strategies</SelectItem>
                        <SelectItem value="moderate">Moderate — Balanced approach</SelectItem>
                        <SelectItem value="aggressive">Aggressive — High-risk, high-reward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Brand Voice</Label>
                    <Input placeholder="e.g., Fun, luxurious, minimalist, bold..." value={aiProfile.brand_voice} onChange={e => setAiProfile(p => ({ ...p, brand_voice: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Context */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-primary" /> Business Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Business Type / Niche</Label>
                    <Input placeholder="e.g., Fashion, Electronics, Health & Wellness..." value={aiProfile.business_type} onChange={e => setAiProfile(p => ({ ...p, business_type: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Target Audience</Label>
                    <Input placeholder="e.g., Women 25-40, Tech enthusiasts, Parents..." value={aiProfile.target_audience} onChange={e => setAiProfile(p => ({ ...p, target_audience: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monthly Marketing Budget</Label>
                    <Select value={aiProfile.monthly_budget_range} onValueChange={v => setAiProfile(p => ({ ...p, monthly_budget_range: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-500">$0 – $500</SelectItem>
                        <SelectItem value="500-2000">$500 – $2,000</SelectItem>
                        <SelectItem value="2000-10000">$2,000 – $10,000</SelectItem>
                        <SelectItem value="10000+">$10,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Preferred Platforms</Label>
                    <Input placeholder="e.g., Instagram, TikTok, Google Ads..." value={aiProfile.preferred_platforms} onChange={e => setAiProfile(p => ({ ...p, preferred_platforms: e.target.value }))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Globe2 className="h-4 w-4 text-primary" /> Strategy & Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Design Preference</Label>
                    <Select value={aiProfile.design_preference} onValueChange={v => setAiProfile(p => ({ ...p, design_preference: v }))}>
                      <SelectTrigger><SelectValue placeholder="Visual style preference" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal & Clean</SelectItem>
                        <SelectItem value="bold">Bold & Eye-Catching</SelectItem>
                        <SelectItem value="elegant">Elegant & Premium</SelectItem>
                        <SelectItem value="playful">Playful & Colorful</SelectItem>
                        <SelectItem value="modern">Modern & Futuristic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Strategy Focus</Label>
                    <Select value={aiProfile.strategy_bias} onValueChange={v => setAiProfile(p => ({ ...p, strategy_bias: v }))}>
                      <SelectTrigger><SelectValue placeholder="What matters most?" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conversion">Conversion Rate Optimization</SelectItem>
                        <SelectItem value="traffic">Traffic & Reach Growth</SelectItem>
                        <SelectItem value="retention">Customer Retention & Loyalty</SelectItem>
                        <SelectItem value="revenue">Revenue Maximization</SelectItem>
                        <SelectItem value="brand">Brand Building & Awareness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Your Main Goals</Label>
                  <Textarea placeholder="Tell Kairo what you're trying to achieve... e.g., 'I want to increase my conversion rate from 1.5% to 3% and grow my email list to 10K subscribers'" value={aiProfile.goals_description} onChange={e => setAiProfile(p => ({ ...p, goals_description: e.target.value }))} rows={3} />
                </div>
                <div className="space-y-1.5">
                  <Label>Pain Points & Challenges</Label>
                  <Textarea placeholder="What are your biggest challenges? e.g., 'Low conversion, high cart abandonment, not enough traffic from social media...'" value={aiProfile.pain_points} onChange={e => setAiProfile(p => ({ ...p, pain_points: e.target.value }))} rows={3} />
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveAiProfile} disabled={savingAiProfile} className="gap-2 w-full sm:w-auto">
              {savingAiProfile && <Loader2 className="h-4 w-4 animate-spin" />}
              <Sparkles className="h-4 w-4" /> Save AI Learning Profile
            </Button>
          </TabsContent>

          {/* TRACKING TAB */}
          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Tracking & Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><BarChart3 className="h-3.5 w-3.5 text-primary" /> Google Analytics ID</Label>
                    <Input placeholder="G-XXXXXXXXXX" value={trackingForm.google_analytics_id} onChange={e => setTrackingForm(p => ({ ...p, google_analytics_id: e.target.value }))} />
                    <div className="flex items-center gap-1.5">
                      {trackingForm.google_analytics_id ? (
                        validateGA(trackingForm.google_analytics_id) ? (
                          <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" /> Connected</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3 w-3" /> Invalid format</span>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">Not connected</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Target className="h-3.5 w-3.5 text-primary" /> Meta Pixel ID</Label>
                    <Input placeholder="1234567890123456" value={trackingForm.meta_pixel_id} onChange={e => setTrackingForm(p => ({ ...p, meta_pixel_id: e.target.value }))} />
                    <div className="flex items-center gap-1.5">
                      {trackingForm.meta_pixel_id ? (
                        validatePixel(trackingForm.meta_pixel_id) ? (
                          <span className="flex items-center gap-1 text-xs text-success"><CheckCircle2 className="h-3 w-3" /> Connected</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3 w-3" /> Invalid format</span>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground">Not connected</span>
                      )}
                    </div>
                  </div>
                </div>
                <Button onClick={handleSaveTracking} disabled={savingTracking} variant="outline" className="gap-2">
                  {savingTracking && <Loader2 className="h-4 w-4 animate-spin" />} Save Tracking Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label>New Password</Label><Input type="password" value={passwordForm.password} onChange={e => setPasswordForm(p => ({ ...p, password: e.target.value }))} /></div>
                  <div><Label>Confirm Password</Label><Input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} /></div>
                </div>
                <Button onClick={handlePasswordChange} disabled={changingPassword} variant="outline" className="gap-2">
                  {changingPassword && <Loader2 className="h-4 w-4 animate-spin" />} Update Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Download className="h-4 w-4" /> Your Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Download a copy of your profile, AI learning preferences, integration list, and AI consent history (GDPR data export).
                </p>
                <Button onClick={handleExportData} disabled={exporting} variant="outline" className="gap-2">
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Export My Data (JSON)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
