import { motion } from "framer-motion";
import { type AuditCategory } from "@/lib/types";
import StatusBadge from "./StatusBadge";
import AIRecommendation from "./AIRecommendation";

interface CategoryCardProps {
  categoryKey: string;
  category: AuditCategory;
  index: number;
}

const getScoreColor = (score: number) => {
  if (score >= 75) return "bg-success";
  if (score >= 50) return "bg-warning";
  return "bg-critical";
};

const CategoryCard = ({ categoryKey, category, index }: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">{category.label}</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-foreground">{category.score}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className={`h-full rounded-full ${getScoreColor(category.score)}`}
          initial={{ width: 0 }}
          animate={{ width: `${category.score}%` }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="space-y-3">
        {category.items.map((item) => (
          <div key={item.name} className="rounded-md bg-surface p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-foreground">{item.name}</span>
              <StatusBadge status={item.status} />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.recommendation}</p>
          </div>
        ))}
      </div>

      <AIRecommendation categoryKey={categoryKey} category={category} />
    </motion.div>
  );
};

export default CategoryCard;
