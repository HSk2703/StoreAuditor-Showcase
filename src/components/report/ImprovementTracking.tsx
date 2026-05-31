import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface CategoryDiff {
  name: string;
  score: number;
  prev: number;
}

interface Props {
  categoryData: CategoryDiff[];
}

const ImprovementTracking = ({ categoryData }: Props) => {
  if (categoryData.length === 0 || categoryData.every((c) => c.prev === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Improvement Tracking</CardTitle>
          <CardDescription>Compare performance between audits</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Need at least 2 audits to show improvements.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Improvement Tracking</CardTitle>
        <CardDescription>Changes between the previous and current audit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categoryData.map((cat) => {
            const diff = cat.score - cat.prev;
            const isUp = diff > 0;
            const isDown = diff < 0;
            const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
            const color = isUp ? "text-success" : isDown ? "text-critical" : "text-muted-foreground";
            const bg = isUp ? "bg-success/10 border-success/20" : isDown ? "bg-critical/10 border-critical/20" : "bg-muted border-border";

            return (
              <div key={cat.name} className={`rounded-lg border p-4 ${bg}`}>
                <p className="text-xs text-muted-foreground mb-1">{cat.name}</p>
                <div className={`flex items-center gap-1.5 text-lg font-bold ${color}`}>
                  <Icon className="h-4 w-4" />
                  {diff > 0 ? "+" : ""}{diff}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{cat.prev} → {cat.score}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImprovementTracking;
