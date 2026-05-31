import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

interface Props {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  emailLocked?: boolean;
}

const StepCredentials = ({ email, setEmail, password, setPassword, emailLocked }: Props) => (
  <div className="grid gap-4">
    <div className="grid gap-1.5">
      <Label htmlFor="signup-email">Email</Label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="signup-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="pl-10"
          disabled={emailLocked}
        />
      </div>
      {emailLocked && (
        <p className="text-xs text-muted-foreground">Email is pre-filled from your invitation</p>
      )}
    </div>
    <div className="grid gap-1.5">
      <Label htmlFor="signup-password">Password</Label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="signup-password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min 6 characters"
          minLength={6}
          className="pl-10"
        />
      </div>
    </div>
  </div>
);

export default StepCredentials;
