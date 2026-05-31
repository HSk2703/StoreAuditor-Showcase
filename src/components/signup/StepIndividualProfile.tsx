import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  fullName: string; setFullName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  country: string; setCountry: (v: string) => void;
  city: string; setCity: (v: string) => void;
  profession: string; setProfession: (v: string) => void;
  experienceLevel: string; setExperienceLevel: (v: string) => void;
  storesManaged: string; setStoresManaged: (v: string) => void;
}

const StepIndividualProfile = (props: Props) => (
  <div className="grid gap-4">
    <div className="grid gap-1.5">
      <Label>Full Name <span className="text-destructive">*</span></Label>
      <Input value={props.fullName} onChange={(e) => props.setFullName(e.target.value)} placeholder="John Doe" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="grid gap-1.5">
        <Label>Phone</Label>
        <Input value={props.phone} onChange={(e) => props.setPhone(e.target.value)} placeholder="+1 234 567 890" />
      </div>
      <div className="grid gap-1.5">
        <Label>Profession</Label>
        <Input value={props.profession} onChange={(e) => props.setProfession(e.target.value)} placeholder="e.g. Store Owner" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="grid gap-1.5">
        <Label>Country</Label>
        <Input value={props.country} onChange={(e) => props.setCountry(e.target.value)} placeholder="United States" />
      </div>
      <div className="grid gap-1.5">
        <Label>City</Label>
        <Input value={props.city} onChange={(e) => props.setCity(e.target.value)} placeholder="New York" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="grid gap-1.5">
        <Label>Experience Level</Label>
        <Select value={props.experienceLevel} onValueChange={props.setExperienceLevel}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label>Stores Managed</Label>
        <Input type="number" min={0} value={props.storesManaged} onChange={(e) => props.setStoresManaged(e.target.value)} />
      </div>
    </div>
  </div>
);

export default StepIndividualProfile;
