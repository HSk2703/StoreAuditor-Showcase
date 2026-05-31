export type AuditStatus = "good" | "needs-improvement" | "critical";

export interface AuditItem {
  name: string;
  score: number;
  status: AuditStatus;
  recommendation: string;
}

export interface AuditCategory {
  score: number;
  label: string;
  items: AuditItem[];
}

export interface AuditReport {
  id: string;
  storeUrl: string;
  createdAt: string;
  overallScore: number;
  categories: {
    homepage: AuditCategory;
    productPages: AuditCategory;
    mobileExperience: AuditCategory;
    trustElements: AuditCategory;
    seo: AuditCategory;
  };
}

export interface PreviousAudit {
  id: string;
  storeUrl: string;
  score: number;
  date: string;
}
