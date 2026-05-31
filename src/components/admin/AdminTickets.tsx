import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TicketCheck, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

const AdminTickets = () => {
  // Placeholder — ready for real ticket system integration
  const placeholderTickets = [
    { id: 1, subject: "Can't access my dashboard", status: "open", priority: "high", date: "2026-03-18" },
    { id: 2, subject: "Audit stuck on processing", status: "in_progress", priority: "medium", date: "2026-03-17" },
    { id: 3, subject: "Billing question", status: "resolved", priority: "low", date: "2026-03-15" },
  ];

  const statusIcon = (s: string) => {
    switch (s) {
      case "open": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-primary" />;
      default: return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Tickets & Support</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage support tickets and issue tracking.</p>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {[
          { label: "Open", value: 1, icon: AlertTriangle, color: "text-amber-500" },
          { label: "In Progress", value: 1, icon: Clock, color: "text-primary" },
          { label: "Resolved", value: 1, icon: CheckCircle2, color: "text-emerald-500" },
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-5 w-5 ${c.color}`} />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{c.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {placeholderTickets.map((t) => (
          <div key={t.id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
            {statusIcon(t.status)}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">{t.subject}</p>
              <p className="text-xs text-muted-foreground">{t.date}</p>
            </div>
            <Badge variant="outline" className="capitalize">{t.priority}</Badge>
            <Badge variant={t.status === "resolved" ? "default" : "secondary"} className="capitalize">{t.status.replace("_", " ")}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminTickets;
