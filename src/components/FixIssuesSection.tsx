import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, BadgeCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import LeadCaptureModal from "./LeadCaptureModal";
import { type AuditReport } from "@/lib/types";

interface FixIssuesSectionProps {
  report: AuditReport;
}

const issueLabels: Record<string, string> = {
  "Trust Signals": "Missing trust badges",
  "Call-to-Action Visibility": "Weak call-to-action",
  "Description Structure": "Poor product description",
  "Loading Speed": "Slow loading pages",
  "Mobile Responsiveness": "Poor mobile layout",
  "Customer Reviews": "No customer reviews",
  "Add-to-Cart Placement": "Add-to-cart below fold",
  "Trust Badges": "Missing trust badges",
  "Urgency/Scarcity Elements": "No urgency elements",
  "Return Policy Visibility": "Return policy hard to find",
};

const FixIssuesSection = ({ report }: FixIssuesSectionProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState("");

  // Collect issues that need improvement or are critical
  const issues = Object.values(report.categories).flatMap((cat) =>
    cat.items
      .filter((item) => item.status === "critical" || item.status === "needs-improvement")
      .map((item) => ({
        name: item.name,
        label: issueLabels[item.name] || item.name,
        score: item.score,
        status: item.status,
      }))
  );

  if (issues.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-10 rounded-xl border border-primary/20 bg-primary/[0.03] p-6 sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
          <BadgeCheck className="h-3.5 w-3.5" />
          Work With Me
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2">Fix These Issues For You</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-lg">
        We identified {issues.length} areas that need attention. Get professional help fixing them to boost your conversion rate.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {issues.map((issue) => (
          <div
            key={issue.name}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full ${
                  issue.status === "critical" ? "bg-critical" : "bg-warning"
                }`}
              />
              <div>
                <p className="text-sm font-medium text-foreground">{issue.label}</p>
                <p className="text-xs text-muted-foreground">Score: {issue.score}/100</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => {
                setSelectedIssue(issue.label);
                setModalOpen(true);
              }}
            >
              Request Help
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Wrench className="h-3 w-3" />
        Professional Shopify optimization services available.
      </p>

      <LeadCaptureModal open={modalOpen} onOpenChange={setModalOpen} issueType={selectedIssue} />
    </motion.section>
  );
};

export default FixIssuesSection;
