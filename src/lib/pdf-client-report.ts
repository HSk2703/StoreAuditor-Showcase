import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ClientReportBranding {
  company_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  footer_text?: string;
  contact_email?: string;
  website_url?: string;
}

interface AuditData {
  store_name: string;
  store_url: string;
  client_name?: string;
  overall_score: number;
  homepage_score: number | null;
  product_page_score: number | null;
  trust_score: number | null;
  mobile_score: number | null;
  seo_score: number | null;
  issues: any[];
  recommendations: any[];
  summary: string;
  created_at: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

const SUCCESS: [number, number, number] = [34, 197, 94];
const WARNING: [number, number, number] = [245, 158, 11];
const CRITICAL: [number, number, number] = [239, 68, 68];
const DEFAULT_PRIMARY: [number, number, number] = [59, 130, 246];

const getScoreColor = (score: number | null): [number, number, number] => {
  if (score === null) return [156, 163, 175];
  if (score >= 80) return SUCCESS;
  if (score >= 60) return WARNING;
  return CRITICAL;
};

function loadImage(url: string): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL("image/png"), width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function exportClientReportPDF(audit: AuditData, branding?: ClientReportBranding) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  let y = 15;

  const PRIMARY = branding?.primary_color ? hexToRgb(branding.primary_color) : DEFAULT_PRIMARY;
  const companyName = branding?.company_name || "";
  const footerText = branding?.footer_text || (companyName ? `Prepared by ${companyName}` : "Shopify Store Performance Report");

  // ── Header Bar ──
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(0, 0, pageW, 32, "F");

  let textX = 14;
  if (branding?.logo_url) {
    try {
      const img = await loadImage(branding.logo_url);
      const logoH = 16;
      const logoW = (img.width / img.height) * logoH;
      doc.addImage(img.dataUrl, "PNG", 14, 8, logoW, logoH);
      textX = 14 + logoW + 5;
    } catch { /* skip logo */ }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(companyName || "Store Auditor", textX, 17);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Shopify Store Performance Report", textX, 24);
  doc.setFontSize(8);
  doc.text(new Date(audit.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), pageW - 14, 20, { align: "right" });

  y = 40;

  // ── Client & Store Info ──
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(audit.store_name, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(audit.store_url, 14, y + 5);
  if (audit.client_name) {
    doc.text(`Prepared for: ${audit.client_name}`, 14, y + 10);
    y += 16;
  } else {
    y += 11;
  }

  // ── Overall Score Card ──
  y += 4;
  const scoreColor = getScoreColor(audit.overall_score);
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageW - 28, 28, 3, 3, "FD");
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text("OVERALL CONVERSION SCORE", pageW / 2, y + 8, { align: "center" });
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(`${audit.overall_score}`, pageW / 2 - 5, y + 23, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("/ 100", pageW / 2 + 12, y + 23);
  y += 36;

  // ── Category Scores Table ──
  const categories = [
    ["Homepage", audit.homepage_score],
    ["Product Pages", audit.product_page_score],
    ["Trust Signals", audit.trust_score],
    ["Mobile Experience", audit.mobile_score],
    ["SEO", audit.seo_score],
  ] as [string, number | null][];

  autoTable(doc, {
    startY: y,
    head: [["Category", "Score", "Rating"]],
    body: categories.map(([name, score]) => [
      name,
      score !== null ? String(score) : "—",
      score === null ? "N/A" : score >= 80 ? "Good" : score >= 60 ? "Needs Work" : "Critical",
    ]),
    theme: "grid",
    headStyles: { fillColor: [PRIMARY[0], PRIMARY[1], PRIMARY[2]], textColor: 255, fontSize: 9, fontStyle: "bold" },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 1: { halign: "center", fontStyle: "bold" }, 2: { halign: "center" } },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 1) {
        const score = parseInt(data.cell.raw as string);
        if (!isNaN(score)) data.cell.styles.textColor = getScoreColor(score);
      }
      if (data.section === "body" && data.column.index === 2) {
        const val = data.cell.raw as string;
        if (val === "Good") data.cell.styles.textColor = SUCCESS as any;
        else if (val === "Needs Work") data.cell.styles.textColor = WARNING as any;
        else if (val === "Critical") data.cell.styles.textColor = CRITICAL as any;
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Summary ──
  if (audit.summary) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Summary", 14, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(audit.summary, pageW - 28);
    doc.text(lines, 14, y);
    y += lines.length * 4 + 6;
  }

  // ── Issues ──
  if (audit.issues.length > 0) {
    if (y > 240) { doc.addPage(); y = 15; }
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Key Issues (${audit.issues.length})`, 14, y);
    y += 6;

    audit.issues.forEach((issue: any) => {
      if (y > 270) { doc.addPage(); y = 15; }
      const color = issue.priority === "high" ? CRITICAL : issue.priority === "medium" ? WARNING : SUCCESS;
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(17, y + 1.5, 1.5, "F");
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(issue.title || "Issue", 22, y + 2.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      if (issue.description) {
        const lines = doc.splitTextToSize(issue.description, pageW - 36);
        doc.text(lines, 22, y + 7);
        y += 8 + lines.length * 3.5;
      } else {
        y += 6;
      }
    });
    y += 4;
  }

  // ── Recommendations ──
  if (audit.recommendations.length > 0) {
    if (y > 240) { doc.addPage(); y = 15; }
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Recommendations (${audit.recommendations.length})`, 14, y);
    y += 6;

    audit.recommendations.forEach((rec: any, idx: number) => {
      if (y > 270) { doc.addPage(); y = 15; }
      doc.setTextColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}.`, 14, y + 2.5);
      doc.setTextColor(30, 41, 59);
      doc.text(rec.title || "Recommendation", 20, y + 2.5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      if (rec.description) {
        const lines = doc.splitTextToSize(rec.description, pageW - 34);
        doc.text(lines, 20, y + 7);
        y += 8 + lines.length * 3.5;
      } else {
        y += 6;
      }
    });
  }

  // ── Footer on all pages ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageH - 10;

    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, footerY - 4, pageW - 14, footerY - 4);

    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(footerText, 14, footerY);

    // Contact info on right
    const contactParts: string[] = [];
    if (branding?.contact_email) contactParts.push(branding.contact_email);
    if (branding?.website_url) contactParts.push(branding.website_url);
    if (contactParts.length > 0) {
      doc.text(contactParts.join(" • "), pageW - 14, footerY, { align: "right" });
    } else {
      doc.text(`Page ${i} of ${totalPages}`, pageW - 14, footerY, { align: "right" });
    }
  }

  const filename = companyName
    ? `${companyName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-${audit.store_name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-report.pdf`
    : `${audit.store_name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-report.pdf`;
  doc.save(filename);
}
