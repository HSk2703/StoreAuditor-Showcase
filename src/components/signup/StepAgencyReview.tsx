import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check } from "lucide-react";

const serviceOptions = [
  "Store Setup", "CRO Optimization", "SEO", "Paid Ads",
  "Email Marketing", "Custom Development", "Theme Design", "Analytics & Reporting",
];

interface Props {
  employeesCount: string; setEmployeesCount: (v: string) => void;
  yearsInBusiness: string; setYearsInBusiness: (v: string) => void;
  services: string[]; toggleService: (s: string) => void;
  agencyName: string; agencyEmail: string;
}

const StepAgencyReview = (props: Props) => (
  <div className="grid gap-4">
    <div className="grid grid-cols-2 gap-3">
      <div className="grid gap-1.5">
        <Label>Employees</Label>
        <Select value={props.employeesCount} onValueChange={props.setEmployeesCount}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1-5">1–5</SelectItem>
            <SelectItem value="6-20">6–20</SelectItem>
            <SelectItem value="21-50">21–50</SelectItem>
            <SelectItem value="50+">50+</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>Years in Business</Label>
        <Select value={props.yearsInBusiness} onValueChange={props.setYearsInBusiness}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="<1">Less than 1</SelectItem>
            <SelectItem value="1-3">1–3</SelectItem>
            <SelectItem value="3-5">3–5</SelectItem>
            <SelectItem value="5+">5+</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
    <div className="grid gap-1.5">
      <Label>Services Offered</Label>
      <div className="flex flex-wrap gap-2">
        {serviceOptions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => props.toggleService(s)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              props.services.includes(s)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {props.services.includes(s) && <Check className="inline h-3 w-3 mr-1" />}
            {s}
          </button>
        ))}
      </div>
    </div>
    <div className="rounded-lg border border-border bg-muted/50 p-4">
      <h3 className="text-sm font-semibold text-foreground mb-2">Agency Summary</h3>
      <div className="grid gap-1 text-sm text-muted-foreground">
        <p><span className="text-foreground font-medium">Agency:</span> {props.agencyName}</p>
        <p><span className="text-foreground font-medium">Email:</span> {props.agencyEmail}</p>
        <p><span className="text-foreground font-medium">Plan:</span> Agency ($99/mo)</p>
      </div>
    </div>
  </div>
);

export default StepAgencyReview;
