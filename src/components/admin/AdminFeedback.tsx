import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Lightbulb, MessageCircle } from "lucide-react";

const AdminFeedback = () => {
  // Placeholder — ready for real feedback system
  const placeholderFeedback = [
    { id: 1, type: "feedback", message: "The audit report is very helpful!", rating: 5, date: "2026-03-18" },
    { id: 2, type: "feature_request", message: "Add Woo Commerce support", rating: null, date: "2026-03-17" },
    { id: 3, type: "feedback", message: "Dashboard could load faster", rating: 3, date: "2026-03-15" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Feedback System</h1>
      <p className="text-sm text-muted-foreground mb-6">User feedback and feature requests.</p>

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {[
          { label: "Total Feedback", value: 2, icon: MessageCircle },
          { label: "Feature Requests", value: 1, icon: Lightbulb },
          { label: "Avg. Rating", value: "4.0", icon: Star },
        ].map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{c.value}</p></CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {placeholderFeedback.map((f) => (
          <div key={f.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant={f.type === "feature_request" ? "secondary" : "outline"} className="capitalize">{f.type.replace("_", " ")}</Badge>
              <span className="text-xs text-muted-foreground">{f.date}</span>
            </div>
            <p className="text-sm text-foreground">{f.message}</p>
            {f.rating && (
              <div className="flex gap-0.5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < f.rating! ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeedback;
