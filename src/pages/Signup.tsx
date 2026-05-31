import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import SignupTypeToggle from "@/components/signup/SignupTypeToggle";
import StepCredentials from "@/components/signup/StepCredentials";
import StepIndividualProfile from "@/components/signup/StepIndividualProfile";
import StepAgencyProfile from "@/components/signup/StepAgencyProfile";
import StepIndividualReview from "@/components/signup/StepIndividualReview";
import StepAgencyReview from "@/components/signup/StepAgencyReview";

type SignupType = "individual" | "agency";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("type") === "agency" ? "agency" : "individual";
  const selectedPlan = searchParams.get("plan") || "free";
  const inviteToken = searchParams.get("invite") || null;
  const [inviteData, setInviteData] = useState<{ email: string; role: string } | null>(null);
  const [inviteExpired, setInviteExpired] = useState(false);

  // Fetch invite data if token present
  useEffect(() => {
    if (!inviteToken) return;
    const fetchInvite = async () => {
      const { data, error } = await supabase
        .rpc("get_invite_by_token" as any, { p_token: inviteToken });
      const rows = data as Array<{ email: string; role: string; status: string; expires_at: string }> | null;
      const invite = rows?.[0];
      if (!invite) return;
      if (invite.status !== "pending" || new Date(invite.expires_at) < new Date()) {
        setInviteExpired(true);
        return;
      }
      setInviteData({ email: invite.email, role: invite.role });
      setEmail(invite.email);
    };
    fetchInvite();
  }, [inviteToken]);

  const [signupType, setSignupType] = useState<SignupType>(initialType);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Auth fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Individual fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [profession, setProfession] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("beginner");
  const [purpose, setPurpose] = useState("");
  const [storesManaged, setStoresManaged] = useState("1");

  // Agency fields
  const [agencyName, setAgencyName] = useState("");
  const [agencyWebsite, setAgencyWebsite] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyPhone, setAgencyPhone] = useState("");
  const [agencyCountry, setAgencyCountry] = useState("");
  const [agencyCity, setAgencyCity] = useState("");
  const [agencyAddress, setAgencyAddress] = useState("");
  const [employeesCount, setEmployeesCount] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [yearsInBusiness, setYearsInBusiness] = useState("");

  const toggleService = (s: string) => {
    setServices((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const totalSteps = 3;

  const canNext = () => {
    if (step === 1) return email.trim() && password.length >= 6;
    if (step === 2) {
      if (signupType === "individual") return fullName.trim();
      return agencyName.trim() && agencyEmail.trim();
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin + "/auth/callback" },
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Registration failed");

      const userId = authData.user.id;
      let profileSyncOk = true;

      if (signupType === "individual") {
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: userId,
          full_name: fullName,
          email,
          phone: phone || null,
          country: country || null,
          city: city || null,
          profession: profession || null,
          experience_level: experienceLevel,
          purpose: purpose || null,
          stores_managed: parseInt(storesManaged) || 0,
          subscription_plan: selectedPlan === "agency" ? "free" : selectedPlan,
          subscription_status: selectedPlan === "free" ? "active" : "initiated",
        });
        if (profileError) {
          console.warn("Profile insert failed (RLS):", profileError.message);
          profileSyncOk = false;
        }

        if (selectedPlan !== "free") {
          await supabase.from("subscription_applications").insert({
            user_id: userId,
            user_type: "individual",
            plan_selected: selectedPlan,
            status: "initiated",
          }).then(({ error }) => {
            if (error) console.warn("Subscription application insert failed:", error.message);
          });
        }
      } else {
        const { error: agencyError } = await supabase.from("agencies").insert({
          owner_user_id: userId,
          agency_name: agencyName,
          email: agencyEmail,
          website: agencyWebsite || null,
          phone: agencyPhone || null,
          country: agencyCountry || null,
          city: agencyCity || null,
          address: agencyAddress || null,
          employees_count: employeesCount || null,
          services: services.length > 0 ? services : null,
          years_in_business: yearsInBusiness || null,
          subscription_plan: "agency",
          subscription_status: "initiated",
          subscription_active: false,
        });
        if (agencyError) {
          console.warn("Agency insert failed (RLS):", agencyError.message);
          profileSyncOk = false;
        }

        await supabase.from("subscription_applications").insert({
          user_id: userId,
          user_type: "agency",
          plan_selected: "agency",
          status: "initiated",
        }).then(({ error }) => {
          if (error) console.warn("Subscription application insert failed:", error.message);
        });
      }

      // Legacy invite-via-signup flow: assign role only.
      // Agency invites should be accepted via /invite (AcceptAgencyInvite),
      // which uses the secure hash-based RPC and links agency_personnel.
      if (inviteToken && inviteData) {
        await supabase.from("user_roles").insert({
          user_id: userId,
          role: inviteData.role as any,
        }).then(({ error }) => {
          if (error) console.warn("Role assignment from invite failed:", error.message);
        });
      }

      toast({
        title: "Account created!",
        description: inviteData
          ? `Welcome! You've been assigned the ${inviteData.role} role. Please check your email to verify your account.`
          : profileSyncOk
            ? "Please check your email to verify your account before signing in."
            : "Signup completed with limited sync. Please verify your email and continue — your profile will sync on next login.",
      });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg">
          <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            {inviteExpired && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 mb-4 text-center">
                <p className="text-sm font-medium text-destructive">⏰ This invitation has expired</p>
                <p className="text-xs text-muted-foreground mt-1">Please ask your administrator to send a new invite.</p>
              </div>
            )}
            {inviteData && !inviteExpired && (
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3 mb-4 text-center">
                <p className="text-sm font-medium text-primary">
                  🎉 You've been invited to join as <span className="capitalize font-bold">{inviteData.role.replace("_", " ")}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Complete your registration below</p>
              </div>
            )}
            <h1 className="text-xl font-bold text-foreground text-center mb-1">Create Your Account</h1>
            <p className="text-sm text-muted-foreground text-center mb-5">
              {selectedPlan !== "free" && `Selected plan: ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} · `}
              Step {step} of {totalSteps}
            </p>

            {step === 1 && !inviteData && (
              <SignupTypeToggle signupType={signupType} setSignupType={setSignupType} />
            )}

            {/* Progress bar */}
            <div className="flex gap-2 mb-6">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < step ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>

            {step === 1 && (
              <StepCredentials email={email} setEmail={setEmail} password={password} setPassword={setPassword} emailLocked={!!inviteData} />
            )}

            {step === 2 && signupType === "individual" && (
              <StepIndividualProfile
                fullName={fullName} setFullName={setFullName}
                phone={phone} setPhone={setPhone}
                country={country} setCountry={setCountry}
                city={city} setCity={setCity}
                profession={profession} setProfession={setProfession}
                experienceLevel={experienceLevel} setExperienceLevel={setExperienceLevel}
                storesManaged={storesManaged} setStoresManaged={setStoresManaged}
              />
            )}

            {step === 2 && signupType === "agency" && (
              <StepAgencyProfile
                agencyName={agencyName} setAgencyName={setAgencyName}
                agencyEmail={agencyEmail} setAgencyEmail={setAgencyEmail}
                agencyPhone={agencyPhone} setAgencyPhone={setAgencyPhone}
                agencyWebsite={agencyWebsite} setAgencyWebsite={setAgencyWebsite}
                agencyCountry={agencyCountry} setAgencyCountry={setAgencyCountry}
                agencyCity={agencyCity} setAgencyCity={setAgencyCity}
                agencyAddress={agencyAddress} setAgencyAddress={setAgencyAddress}
              />
            )}

            {step === 3 && signupType === "individual" && (
              <StepIndividualReview
                purpose={purpose} setPurpose={setPurpose}
                fullName={fullName} email={email} selectedPlan={selectedPlan}
              />
            )}

            {step === 3 && signupType === "agency" && (
              <StepAgencyReview
                employeesCount={employeesCount} setEmployeesCount={setEmployeesCount}
                yearsInBusiness={yearsInBusiness} setYearsInBusiness={setYearsInBusiness}
                services={services} toggleService={toggleService}
                agencyName={agencyName} agencyEmail={agencyEmail}
              />
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 min-h-[44px]">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
              )}
              {step < totalSteps ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="flex-1 min-h-[44px]">
                  Next <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading || !canNext()} className="flex-1 min-h-[44px]">
                  {loading ? "Creating Account…" : "Create Account"}
                </Button>
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
