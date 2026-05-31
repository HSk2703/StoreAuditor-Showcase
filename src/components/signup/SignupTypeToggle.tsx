import { User, Building2 } from "lucide-react";

type SignupType = "individual" | "agency";

interface Props {
  signupType: SignupType;
  setSignupType: (t: SignupType) => void;
}

const SignupTypeToggle = ({ signupType, setSignupType }: Props) => (
  <div className="flex rounded-lg border border-border overflow-hidden mb-6">
    <button
      type="button"
      onClick={() => setSignupType("individual")}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
        signupType === "individual"
          ? "bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      <User className="h-4 w-4" />
      Individual
    </button>
    <button
      type="button"
      onClick={() => setSignupType("agency")}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${
        signupType === "agency"
          ? "bg-primary text-primary-foreground"
          : "bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      <Building2 className="h-4 w-4" />
      Agency
    </button>
  </div>
);

export default SignupTypeToggle;
