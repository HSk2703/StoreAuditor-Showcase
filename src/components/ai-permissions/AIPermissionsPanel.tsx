import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Eye, Pencil, Layout, Megaphone, Mail, Monitor, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthProvider";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";
import {
  AI_PERMISSIONS, EXECUTION_MODES,
  type AIPermissionState, type ExecutionMode,
  loadPermissions, savePermissions,
} from "@/lib/ai-permissions";
import { AI_NAME } from "@/lib/kairo-identity";
import { PLAN_HIERARCHY } from "@/lib/kairo-identity";

const ICONS: Record<string, any> = {
  view_store_data: Eye,
  suggest_improvements: Zap,
  edit_content: Pencil,
  modify_ui: Layout,
  create_campaigns: Megaphone,
  manage_ads: Monitor,
  email_marketing: Mail,
};

export default function AIPermissionsPanel() {
  const { isAdmin } = useAuth();
  const { plan } = useSubscription();
  const [state, setState] = useState<AIPermissionState>(loadPermissions);

  useEffect(() => { savePermissions(state); }, [state]);

  const togglePermission = (key: string) => {
    const perm = AI_PERMISSIONS.find((p) => p.key === key);
    if (!perm) return;
    if (!isAdmin && PLAN_HIERARCHY.indexOf(plan) < PLAN_HIERARCHY.indexOf(perm.minPlan)) {
      toast({ title: "Upgrade Required", description: `Upgrade to ${perm.minPlan} to enable this permission`, variant: "destructive" });
      return;
    }
    setState((prev) => {
      const updated = { ...prev, permissions: { ...prev.permissions, [key]: !prev.permissions[key] } };
      return updated;
    });
    toast({ title: state.permissions[key] ? "Permission Disabled" : "Permission Enabled" });
  };

  const setMode = (mode: ExecutionMode) => {
    setState((prev) => ({ ...prev, executionMode: mode }));
    toast({ title: `Switched to ${EXECUTION_MODES[mode].label}` });
  };

  const dataPerms = AI_PERMISSIONS.filter((p) => p.category === "data");
  const actionPerms = AI_PERMISSIONS.filter((p) => p.category === "action");

  return (
    <div className="space-y-6">
      {/* Data Access */}
      <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" /> Data Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {dataPerms.map((perm) => {
            const Icon = ICONS[perm.key] || Shield;
            const locked = !isAdmin && PLAN_HIERARCHY.indexOf(plan) < PLAN_HIERARCHY.indexOf(perm.minPlan);
            return (
              <div key={perm.key} className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-muted/20 border border-border/20">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{perm.label}</p>
                    <p className="text-xs text-muted-foreground">{perm.description}</p>
                  </div>
                </div>
                {locked ? (
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <Switch checked={state.permissions[perm.key] ?? false} onCheckedChange={() => togglePermission(perm.key)} />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Permissions */}
      <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Action Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {actionPerms.map((perm) => {
            const Icon = ICONS[perm.key] || Shield;
            const locked = !isAdmin && PLAN_HIERARCHY.indexOf(plan) < PLAN_HIERARCHY.indexOf(perm.minPlan);
            return (
              <div key={perm.key} className="flex items-center justify-between gap-3 py-2 px-3 rounded-xl bg-muted/20 border border-border/20">
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      {perm.label}
                      {perm.riskLevel === "high" && <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-500/30 text-amber-500">High Risk</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground">{perm.description}</p>
                  </div>
                </div>
                {locked ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground capitalize">{perm.minPlan}+</span>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                ) : (
                  <Switch checked={state.permissions[perm.key] ?? false} onCheckedChange={() => togglePermission(perm.key)} />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Execution Mode */}
      <Card className="border-border/30 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> AI Execution Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={state.executionMode} onValueChange={(v) => setMode(v as ExecutionMode)} className="space-y-3">
            {(Object.entries(EXECUTION_MODES) as [ExecutionMode, typeof EXECUTION_MODES[ExecutionMode]][]).map(([key, mode]) => (
              <Label
                key={key}
                htmlFor={`mode-${key}`}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  state.executionMode === key
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/20 bg-muted/20 hover:border-border/40"
                }`}
              >
                <RadioGroupItem value={key} id={`mode-${key}`} className="mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{mode.label}</span>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0">{mode.badge}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{mode.description}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
