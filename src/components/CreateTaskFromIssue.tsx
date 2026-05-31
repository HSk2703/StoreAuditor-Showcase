import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ClipboardPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { useStoreConnection } from "@/hooks/useStoreConnection";
import ShopifyConnectionGate from "@/components/ShopifyConnectionGate";

interface CreateTaskFromIssueProps {
  issue: { title: string; description: string; priority: string; category?: string };
  auditId: string;
  storeUrl: string;
  onCreated?: () => void;
}

const CreateTaskFromIssue = ({ issue, auditId, storeUrl, onCreated }: CreateTaskFromIssueProps) => {
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<{ id: string; store_name: string; store_url: string }[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [creating, setCreating] = useState(false);
  const [showConnectionGate, setShowConnectionGate] = useState(false);
  const { user } = useAuth();
  const { userType } = useSubscription();
  const { hasConnectedStore } = useStoreConnection();

  // Only show for agency users
  if (!user || userType !== "agency") return null;

  const handleOpen = async () => {
    if (!hasConnectedStore) {
      setShowConnectionGate(true);
      return;
    }
    const { data } = await supabase.from("managed_stores").select("id, store_name, store_url");
    const storeList = (data || []) as { id: string; store_name: string; store_url: string }[];
    setStores(storeList);
    const match = storeList.find((s) => storeUrl.includes(s.store_url.replace(/^https?:\/\//, "").replace(/\/$/, "")));
    if (match) setSelectedStore(match.id);
    setOpen(true);
  };

  const handleCreate = async () => {
    if (!user || !selectedStore) return;
    setCreating(true);
    const { error } = await supabase.from("team_tasks").insert({
      user_id: user.id,
      managed_store_id: selectedStore,
      audit_id: auditId,
      title: issue.title,
      description: issue.description,
      priority: issue.priority,
      assigned_to: assignedTo.trim() || null,
      source_issue: issue,
    });
    if (error) {
      toast({ title: "Failed to create task", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Task created", description: "View it in Team Tasks." });
      setOpen(false);
      onCreated?.();
    }
    setCreating(false);
  };

  return (
    <>
      <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleOpen}>
        <ClipboardPlus className="h-3.5 w-3.5" />
        Create Task
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md border-primary/20 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Create Task from Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm font-medium text-foreground">{issue.title}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{issue.description}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Store</label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.store_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Assign To</label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger><SelectValue placeholder="Choose assignment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kairo">Assign to Kairo (AI)</SelectItem>
                  <SelectItem value="team">Assign to Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !selectedStore} className="gap-1.5 shadow-[0_0_15px_-4px_hsl(var(--primary)/0.3)]">
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ShopifyConnectionGate open={showConnectionGate} onClose={() => setShowConnectionGate(false)} />
    </>
  );
};

export default CreateTaskFromIssue;
