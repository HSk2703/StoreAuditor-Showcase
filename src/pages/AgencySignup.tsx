import { useState } from "react";
import { useAuth } from "@/contexts/AuthProvider";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Globe,
  MapPin,
  Briefcase,
  Users,
  Plus,
  Trash2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SERVICES_OPTIONS = [
  "Shopify Development",
  "CRO",
  "SEO",
  "Shopify Design",
  "Shopify Marketing",
  "Performance Optimization",
  "Other",
];

const TIMEZONES = [
  "UTC-12:00", "UTC-11:00", "UTC-10:00", "UTC-09:00", "UTC-08:00", "UTC-07:00",
  "UTC-06:00", "UTC-05:00", "UTC-04:00", "UTC-03:00", "UTC-02:00", "UTC-01:00",
  "UTC+00:00", "UTC+01:00", "UTC+02:00", "UTC+03:00", "UTC+04:00", "UTC+05:00",
  "UTC+05:30", "UTC+06:00", "UTC+07:00", "UTC+08:00", "UTC+09:00", "UTC+10:00",
  "UTC+11:00", "UTC+12:00",
];

const EMPLOYEE_RANGES = ["1-5", "6-15", "16-50", "51-100", "100+"];
const YEARS_RANGES = ["< 1 year", "1-3 years", "3-5 years", "5-10 years", "10+ years"];

interface PersonnelEntry {
  name: string;
  role_title: string;
  email: string;
  linkedin: string;
}

const emptyPerson = (): PersonnelEntry => ({ name: "", role_title: "", email: "", linkedin: "" });

const PLAN_FEATURES = [
  "Unlimited client stores",
  "White-label branding",
  "Weekly automated reports",
  "Store monitoring & alerts",
  "Team task management",
  "Performance analytics",
  "Client portal access",
  "Priority support",
];

const AgencySignup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [planConfirmed, setPlanConfirmed] = useState(false);

  // Agency info
  const [agencyName, setAgencyName] = useState("");
  const [website, setWebsite] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  // Location
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("");

  // Business
  const [employeesCount, setEmployeesCount] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [services, setServices] = useState<string[]>([]);

  // Personnel
  const [personnel, setPersonnel] = useState<PersonnelEntry[]>([]);

  const totalSteps = 5;

  const toggleService = (svc: string) => {
    setServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const addPerson = () => setPersonnel((p) => [...p, emptyPerson()]);
  const removePerson = (i: number) => setPersonnel((p) => p.filter((_, idx) => idx !== i));
  const updatePerson = (i: number, field: keyof PersonnelEntry, value: string) => {
    setPersonnel((p) => p.map((per, idx) => (idx === i ? { ...per, [field]: value } : per)));
  };

  const canNext = () => {
    if (step === 1) return planConfirmed;
    if (step === 2) return agencyName.trim() && agencyEmail.trim();
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!user) throw new Error("You must be logged in.");

      // Check if user already has an agency
      const { data: existing } = await supabase
        .from("agencies")
        .select("id")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (existing) throw new Error("You already have an agency registered.");

      // Create agency with active subscription (payment confirmed in step 1)
      const { data: agency, error: agencyError } = await supabase
        .from("agencies")
        .insert({
          owner_user_id: user.id,
          agency_name: agencyName.trim(),
          website: website.trim() || null,
          email: agencyEmail.trim(),
          phone: phone.trim() || null,
          description: description.trim() || null,
          country: country.trim() || null,
          city: city.trim() || null,
          address: address.trim() || null,
          timezone: timezone || null,
          employees_count: employeesCount || null,
          years_in_business: yearsInBusiness || null,
          services,
          subscription_plan: "agency",
          subscription_active: true,
        })
        .select("id")
        .single();

      if (agencyError) throw agencyError;

      // Add personnel
      const validPersonnel = personnel.filter((p) => p.name.trim());
      if (validPersonnel.length > 0 && agency) {
        const { error: pError } = await supabase.from("agency_personnel").insert(
          validPersonnel.map((p) => ({
            agency_id: agency.id,
            name: p.name.trim(),
            role_title: p.role_title.trim() || null,
            email: p.email.trim() || null,
            linkedin: p.linkedin.trim() || null,
          }))
        );
        if (pError) console.error("Personnel insert error:", pError);
      }

      toast({
        title: "Agency registered!",
        description: "Your Agency Plan is active. Welcome to the Agency Dashboard.",
      });
      navigate("/agency");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = ["Plan", "Agency", "Location", "Business", "Team"];

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              i + 1 < step
                ? "bg-primary text-primary-foreground"
                : i + 1 === step
                ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1 < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`h-0.5 w-6 sm:w-10 ${i + 1 < step ? "bg-primary" : "bg-muted"}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container max-w-2xl py-10">
        <div className="text-center mb-6">
          <Building2 className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground">Agency Registration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Subscribe to the Agency Plan and set up your agency profile
          </p>
        </div>

        <StepIndicator />

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <AnimatePresence mode="wait">
            {/* Step 1: Plan Confirmation */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Agency Plan Subscription
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  A paid Agency Plan is required to create an agency account.
                </p>

                <div className="rounded-lg border-2 border-primary bg-primary/5 p-5 mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Agency Plan</h3>
                      <p className="text-sm text-muted-foreground">Everything you need for agency operations</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">$199</span>
                      <span className="text-sm text-muted-foreground">/mo</span>
                    </div>
                  </div>

                  <ul className="grid grid-cols-2 gap-2 mb-5">
                    {PLAN_FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-start gap-3 rounded-md border border-border bg-background p-3">
                    <Checkbox
                      id="confirm-plan"
                      checked={planConfirmed}
                      onCheckedChange={(v) => setPlanConfirmed(v === true)}
                    />
                    <label htmlFor="confirm-plan" className="text-sm text-foreground cursor-pointer leading-snug">
                      I confirm my subscription to the <strong>Agency Plan at $199/month</strong>. I understand this is required to access the Agency Dashboard and all agency features.
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Cancel anytime. 14-day money-back guarantee.</span>
                </div>
              </motion.div>
            )}

            {/* Step 2: Agency Info */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Agency Information
                </h2>
                <p className="text-sm text-muted-foreground mb-5">Tell us about your agency.</p>
                <div className="space-y-4">
                  <div>
                    <Label>Agency Name *</Label>
                    <Input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="Your Agency Name" />
                  </div>
                  <div>
                    <Label>Agency Email *</Label>
                    <Input type="email" value={agencyEmail} onChange={(e) => setAgencyEmail(e.target.value)} placeholder="hello@agency.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Website</Label>
                      <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://agency.com" />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell us about your agency..." rows={3} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Location Details
                </h2>
                <p className="text-sm text-muted-foreground mb-5">Where is your agency based?</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Country</Label>
                      <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="New York" />
                    </div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street" />
                  </div>
                  <div>
                    <Label>Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Business Details */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" /> Business Details
                </h2>
                <p className="text-sm text-muted-foreground mb-5">Help us understand your business.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Employees</Label>
                      <Select value={employeesCount} onValueChange={setEmployeesCount}>
                        <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                        <SelectContent>
                          {EMPLOYEE_RANGES.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Years in Business</Label>
                      <Select value={yearsInBusiness} onValueChange={setYearsInBusiness}>
                        <SelectTrigger><SelectValue placeholder="Select range" /></SelectTrigger>
                        <SelectContent>
                          {YEARS_RANGES.map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Main Services</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {SERVICES_OPTIONS.map((svc) => (
                        <label key={svc} className="flex items-center gap-2 text-sm cursor-pointer rounded-md border border-border p-2.5 hover:bg-muted/50 transition-colors">
                          <Checkbox
                            checked={services.includes(svc)}
                            onCheckedChange={() => toggleService(svc)}
                          />
                          {svc}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Personnel */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" /> Team Members (Optional)
                </h2>
                <p className="text-sm text-muted-foreground mb-5">Add key personnel to your agency profile.</p>
                <div className="space-y-4">
                  {personnel.map((p, i) => (
                    <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">Member {i + 1}</span>
                        <Button variant="ghost" size="icon" onClick={() => removePerson(i)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Name *</Label>
                          <Input value={p.name} onChange={(e) => updatePerson(i, "name", e.target.value)} placeholder="John Doe" />
                        </div>
                        <div>
                          <Label>Role / Title</Label>
                          <Input value={p.role_title} onChange={(e) => updatePerson(i, "role_title", e.target.value)} placeholder="CTO" />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input type="email" value={p.email} onChange={(e) => updatePerson(i, "email", e.target.value)} placeholder="john@agency.com" />
                        </div>
                        <div>
                          <Label>LinkedIn</Label>
                          <Input value={p.linkedin} onChange={(e) => updatePerson(i, "linkedin", e.target.value)} placeholder="linkedin.com/in/..." />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addPerson} className="w-full gap-2">
                    <Plus className="h-4 w-4" /> Add Team Member
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            ) : (
              <div />
            )}
            {step < totalSteps ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="gap-2">
                {step === 1 ? "Subscribe & Continue" : "Next"} <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading || !canNext()} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Create Agency
              </Button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AgencySignup;
