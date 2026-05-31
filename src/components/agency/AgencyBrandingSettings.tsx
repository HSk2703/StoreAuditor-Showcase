import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, Save, Building2, Globe, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface BrandingData {
  company_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  footer_text: string;
  contact_email: string;
  website_url: string;
}

interface Props {
  userId: string;
  onBrandingChange?: (branding: BrandingData) => void;
}

const ReportPreview = ({ branding }: { branding: BrandingData }) => {
  const name = branding.company_name || "Your Agency";
  const footer = branding.footer_text || `Confidential — Prepared by ${name}`;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
      <p className="text-[10px] font-medium text-muted-foreground px-3 pt-2 pb-1 uppercase tracking-wider">Live Preview</p>
      {/* Report header */}
      <div
        className="mx-2 rounded-t-md px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: branding.primary_color }}
      >
        {branding.logo_url ? (
          <img src={branding.logo_url} alt="Logo" className="h-8 w-auto max-w-[80px] object-contain rounded bg-white/90 p-0.5" />
        ) : (
          <div className="h-8 w-8 rounded bg-white/20 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white/70" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-white text-sm font-semibold truncate">{name}</p>
          <p className="text-white/70 text-[10px]">Shopify Store Performance Report</p>
        </div>
      </div>
      {/* Fake body */}
      <div className="mx-2 border-x border-border px-4 py-3 space-y-2">
        <div className="h-2 w-3/4 rounded bg-muted" />
        <div className="h-2 w-1/2 rounded bg-muted" />
        <div className="h-2 w-2/3 rounded bg-muted" />
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded bg-muted" />
          ))}
        </div>
      </div>
      {/* Footer */}
      <div
        className="mx-2 rounded-b-md px-4 py-2 mb-2"
        style={{ backgroundColor: branding.secondary_color }}
      >
        <p className="text-white/80 text-[9px] truncate">{footer}</p>
        <div className="flex items-center gap-3 mt-0.5">
          {branding.contact_email && (
            <span className="text-white/60 text-[9px] flex items-center gap-0.5">
              <Mail className="h-2.5 w-2.5" /> {branding.contact_email}
            </span>
          )}
          {branding.website_url && (
            <span className="text-white/60 text-[9px] flex items-center gap-0.5">
              <Globe className="h-2.5 w-2.5" /> {branding.website_url.replace(/^https?:\/\//, "")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const AgencyBrandingSettings = ({ userId, onBrandingChange }: Props) => {
  const [branding, setBranding] = useState<BrandingData>({
    company_name: "",
    logo_url: "",
    primary_color: "#3B82F6",
    secondary_color: "#1E293B",
    footer_text: "",
    contact_email: "",
    website_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("agency_branding")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (data) {
        setBranding({
          company_name: data.company_name || "",
          logo_url: data.logo_url || "",
          primary_color: data.primary_color || "#3B82F6",
          secondary_color: data.secondary_color || "#1E293B",
          footer_text: data.footer_text || "",
          contact_email: (data as any).contact_email || "",
          website_url: (data as any).website_url || "",
        });
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/logo.${ext}`;

    const { error } = await supabase.storage.from("agency-logos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("agency-logos").getPublicUrl(path);
    const logoUrl = urlData.publicUrl + `?t=${Date.now()}`;
    setBranding((b) => ({ ...b, logo_url: logoUrl }));
    setUploading(false);
    toast({ title: "Logo uploaded" });
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: existing } = await supabase
      .from("agency_branding")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const payload: any = {
      user_id: userId,
      company_name: branding.company_name || null,
      logo_url: branding.logo_url || null,
      primary_color: branding.primary_color,
      secondary_color: branding.secondary_color,
      footer_text: branding.footer_text || null,
      contact_email: branding.contact_email || null,
      website_url: branding.website_url || null,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase.from("agency_branding").update(payload).eq("user_id", userId);
    } else {
      await supabase.from("agency_branding").insert(payload);
    }

    onBrandingChange?.(branding);
    setSaving(false);
    toast({ title: "Branding saved" });
  };

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-5">
      {/* Live Preview */}
      <ReportPreview branding={branding} />

      <Separator />

      {/* Logo */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Company Logo</label>
        <div className="flex items-center gap-4">
          {branding.logo_url ? (
            <img src={branding.logo_url} alt="Logo" className="h-12 w-auto max-w-[160px] rounded border border-border object-contain bg-card p-1" />
          ) : (
            <div className="h-12 w-24 rounded border border-dashed border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
              No logo
            </div>
          )}
          <label className="cursor-pointer">
            <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoUpload} />
            <Button variant="outline" size="sm" className="gap-2 pointer-events-none" asChild>
              <span>
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                Upload Logo
              </span>
            </Button>
          </label>
        </div>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG or WebP. Max 2MB.</p>
      </div>

      {/* Company Name */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Company Name</label>
        <Input
          placeholder="Your Agency Name"
          value={branding.company_name}
          onChange={(e) => setBranding((b) => ({ ...b, company_name: e.target.value }))}
        />
      </div>

      {/* Contact Email */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Contact Email</label>
        <Input
          type="email"
          placeholder="hello@youragency.com"
          value={branding.contact_email}
          onChange={(e) => setBranding((b) => ({ ...b, contact_email: e.target.value }))}
        />
      </div>

      {/* Website URL */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Website URL</label>
        <Input
          placeholder="https://youragency.com"
          value={branding.website_url}
          onChange={(e) => setBranding((b) => ({ ...b, website_url: e.target.value }))}
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Primary Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={branding.primary_color}
              onChange={(e) => setBranding((b) => ({ ...b, primary_color: e.target.value }))}
              className="h-9 w-9 rounded border border-border cursor-pointer"
            />
            <Input
              value={branding.primary_color}
              onChange={(e) => setBranding((b) => ({ ...b, primary_color: e.target.value }))}
              className="font-mono text-xs"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Secondary Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={branding.secondary_color}
              onChange={(e) => setBranding((b) => ({ ...b, secondary_color: e.target.value }))}
              className="h-9 w-9 rounded border border-border cursor-pointer"
            />
            <Input
              value={branding.secondary_color}
              onChange={(e) => setBranding((b) => ({ ...b, secondary_color: e.target.value }))}
              className="font-mono text-xs"
            />
          </div>
        </div>
      </div>

      {/* Footer text */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Report Footer Text</label>
        <Input
          placeholder="Confidential — Prepared by Your Agency"
          value={branding.footer_text}
          onChange={(e) => setBranding((b) => ({ ...b, footer_text: e.target.value }))}
        />
      </div>

      <Button onClick={handleSave} disabled={saving} className="gap-2 w-full">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Branding
      </Button>
    </div>
  );
};

export default AgencyBrandingSettings;
