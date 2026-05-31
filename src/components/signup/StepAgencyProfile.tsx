import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  agencyName: string; setAgencyName: (v: string) => void;
  agencyEmail: string; setAgencyEmail: (v: string) => void;
  agencyPhone: string; setAgencyPhone: (v: string) => void;
  agencyWebsite: string; setAgencyWebsite: (v: string) => void;
  agencyCountry: string; setAgencyCountry: (v: string) => void;
  agencyCity: string; setAgencyCity: (v: string) => void;
  agencyAddress: string; setAgencyAddress: (v: string) => void;
}

const StepAgencyProfile = (props: Props) => (
  <div className="grid gap-4">
    <div className="grid gap-1.5">
      <Label>Agency Name <span className="text-destructive">*</span></Label>
      <Input value={props.agencyName} onChange={(e) => props.setAgencyName(e.target.value)} placeholder="Acme Digital Agency" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="grid gap-1.5">
        <Label>Agency Email <span className="text-destructive">*</span></Label>
        <Input type="email" value={props.agencyEmail} onChange={(e) => props.setAgencyEmail(e.target.value)} placeholder="hello@agency.com" />
      </div>
      <div className="grid gap-1.5">
        <Label>Phone</Label>
        <Input value={props.agencyPhone} onChange={(e) => props.setAgencyPhone(e.target.value)} placeholder="+1 234 567 890" />
      </div>
    </div>
    <div className="grid gap-1.5">
      <Label>Website</Label>
      <Input value={props.agencyWebsite} onChange={(e) => props.setAgencyWebsite(e.target.value)} placeholder="https://agency.com" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="grid gap-1.5">
        <Label>Country</Label>
        <Input value={props.agencyCountry} onChange={(e) => props.setAgencyCountry(e.target.value)} placeholder="United States" />
      </div>
      <div className="grid gap-1.5">
        <Label>City</Label>
        <Input value={props.agencyCity} onChange={(e) => props.setAgencyCity(e.target.value)} placeholder="New York" />
      </div>
    </div>
    <div className="grid gap-1.5">
      <Label>Address</Label>
      <Input value={props.agencyAddress} onChange={(e) => props.setAgencyAddress(e.target.value)} placeholder="123 Main St" />
    </div>
  </div>
);

export default StepAgencyProfile;
