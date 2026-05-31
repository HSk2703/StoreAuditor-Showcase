import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  purpose: string;
  setPurpose: (v: string) => void;
  fullName: string;
  email: string;
  selectedPlan: string;
}

const StepIndividualReview = ({ purpose, setPurpose, fullName, email, selectedPlan }: Props) => (
  <div className="grid gap-4">
    <div className="grid gap-1.5">
      <Label>Purpose of using Store Auditor</Label>
      <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Improve my store's conversion rate" rows={3} />
    </div>
    <div className="rounded-lg border border-border bg-muted/50 p-4">
      <h3 className="text-sm font-semibold text-foreground mb-2">Account Summary</h3>
      <div className="grid gap-1 text-sm text-muted-foreground">
        <p><span className="text-foreground font-medium">Name:</span> {fullName}</p>
        <p><span className="text-foreground font-medium">Email:</span> {email}</p>
        <p><span className="text-foreground font-medium">Plan:</span> {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}</p>
      </div>
    </div>
  </div>
);

export default StepIndividualReview;
