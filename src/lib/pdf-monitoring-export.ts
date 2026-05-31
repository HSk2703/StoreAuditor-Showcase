import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface StoreRow {
  id: string;
  store_name: string;
  store_url: string;
  last_audit_score: number | null;
  last_audit_date: string | null;
}

interface HistoryRow {
  id: string;
  managed_store_id: string;
  conversion_score: number | null;
  previous_score: number | null;
  score_change: number | null;
  ai_insights: string | null;
  created_at: string;
}

interface AlertRow {
  id: string;
  managed_store_id: string;
  message: string;
  severity: string;
  is_read: boolean;
  created_at: string;
}

export interface BrandingOptions {
  company_name?: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  footer_text?: string;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

const DEFAULT_PRIMARY: [number, number, number] = [59, 130, 246];
const SUCCESS: [number, number, number] = [34, 197, 94];
const WARNING: [number, number, number] = [245, 158, 11];
const CRITICAL: [number, number, number] = [239, 68, 68];

const getScoreColor = (score: number | null): [number, number, number] => {
  if (score === null) return [156, 163, 175] as [number, number, number];
  if (score >= 80) return SUCCESS;
  if (score >= 60) return WARNING;
  return CRITICAL;
};

export async function exportMonitoringPDF(
  stores: StoreRow[],
  history: HistoryRow[],
  alerts: AlertRow[],
  branding?: BrandingOptions,
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  let y = 15;

  const PRIMARY = branding?.primary_color ? hexToRgb(branding.primary_color) : DEFAULT_PRIMARY;
  const SECONDARY = branding?.secondary_color ? hexToRgb(branding.secondary_color) : [30, 41, 59] as [number, number, number];
  const companyName = branding?.company_name || "Store Auditor";
  const footerText = branding?.footer_text || "Store Auditor — Monitoring Report";

  // Header bar
  doc.setFillColor(PRIMARY[0], PRIMARY[1], PRIMARY[2]);
  doc.rect(0, 0, pageW, 28, "F");

  // Logo in header
  let logoX = 14;
  if (branding?.logo_url) {
    try {
      const img = await loadImage(branding.logo_url);
      const logoH = 14;
      const logoW = (img.width / img.height) * logoH;
      doc.addImage(img.dataUrl, "PNG", 14, 7, logoW, logoH);
      logoX = 14 + logoW + 4;
    } catch {
      // If logo fails to load, skip it
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(companyName, logoX, 16);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Monitoring Report", logoX, 22);
  doc.setFontSize(9);
  doc.text(`Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pageW - 14, 18, { align: "right" });

  y = 36;

  // Summary cards
  const latestByStore = new Map<string, HistoryRow>();
  for (const h of history) {
    if (!latestByStore.has(h.managed_store_id)) latestByStore.set(h.managed_store_id, h);
  }

  const avgScore = stores.filter((s) => s.last_audit_score !== null).length > 0
    ? Math.round(stores.reduce((a, s) => a + (s.last_audit_score || 0), 0) / stores.filter((s) => s.last_audit_score !== null).length)
    : null;

  const improved = [...latestByStore.values()].filter((h) => (h.score_change ?? 0) > 0).length;
  const dropped = [...latestByStore.values()].filter((h) => (h.score_change ?? 0) < 0).length;

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const cardW = (pageW - 28 - 12) / 4;
  const cards = [
    { label: "Monitored Stores", value: String(stores.length), color: PRIMARY },
    { label: "Average Score", value: avgScore !== null ? String(avgScore) : "—", color: getScoreColor(avgScore) },
    { label: "Improved", value: String(improved), color: SUCCESS },
    { label: "Dropped", value: String(dropped), color: CRITICAL },
  ];

  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 4);
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, cardW, 22, 2, 2, "FD");
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    doc.text(card.label, x + cardW / 2, y + 8, { align: "center" });
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(card.value, x + cardW / 2, y + 18, { align: "center" });
    doc.setFont("helvetica", "normal");
  });

  y += 30;

  // Performance Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Store Performance", 14, y);
  y += 5;

  const tableBody = stores.map((store) => {
    const latest = latestByStore.get(store.id);
    const change = latest?.score_change ?? null;
    const status = change === null || change === 0 ? "Unchanged" : change > 0 ? "Improved" : "Dropped";
    return [
      store.store_name,
      String(latest?.conversion_score ?? store.last_audit_score ?? "—"),
      String(latest?.previous_score ?? "—"),
      change !== null ? (change > 0 ? `+${change}` : String(change)) : "—",
      latest ? new Date(latest.created_at).toLocaleDateString() : store.last_audit_date ? new Date(store.last_audit_date).toLocaleDateString() : "Never",
      status,
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [["Store", "Score", "Previous", "Change", "Last Checked", "Status"]],
    body: tableBody,
    theme: "grid",
    headStyles: { fillColor: [PRIMARY[0], PRIMARY[1], PRIMARY[2]], textColor: 255, fontSize: 8, fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      1: { halign: "center", fontStyle: "bold" },
      2: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "center" },
      5: { halign: "center" },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 5) {
        const val = data.cell.raw as string;
        if (val === "Improved") data.cell.styles.textColor = SUCCESS as any;
        else if (val === "Dropped") data.cell.styles.textColor = CRITICAL as any;
        else data.cell.styles.textColor = [156, 163, 175] as any;
      }
      if (data.section === "body" && data.column.index === 1) {
        const score = parseInt(data.cell.raw as string);
        if (!isNaN(score)) data.cell.styles.textColor = getScoreColor(score);
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Alerts section
  const unreadAlerts = alerts.filter((a) => !a.is_read);
  if (unreadAlerts.length > 0) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Store Health Alerts", 14, y);
    y += 6;

    unreadAlerts.slice(0, 10).forEach((alert) => {
      if (y > 275) { doc.addPage(); y = 15; }
      const store = stores.find((s) => s.id === alert.managed_store_id);
      const color = alert.severity === "critical" ? CRITICAL : WARNING;
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(17, y + 1, 1.5, "F");
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(store?.store_name || "Unknown", 22, y + 2);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      const lines = doc.splitTextToSize(alert.message, pageW - 40);
      doc.text(lines, 22, y + 6);
      y += 6 + lines.length * 3.5;
    });

    y += 4;
  }

  // AI Insights
  const insights = history.filter((h) => h.ai_insights).slice(0, 5);
  if (insights.length > 0) {
    if (y > 250) { doc.addPage(); y = 15; }
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("AI Insights", 14, y);
    y += 6;

    insights.forEach((h) => {
      if (y > 275) { doc.addPage(); y = 15; }
      const store = stores.find((s) => s.id === h.managed_store_id);
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text(`${store?.store_name || "Store"} · ${new Date(h.created_at).toLocaleDateString()}`, 14, y + 2);
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(8);
      const lines = doc.splitTextToSize(h.ai_insights || "", pageW - 28);
      doc.text(lines, 14, y + 6);
      y += 8 + lines.length * 3.5;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(156, 163, 175);
    doc.text(footerText, 14, doc.internal.pageSize.getHeight() - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageW - 14, doc.internal.pageSize.getHeight() - 8, { align: "right" });
  }

  const filename = branding?.company_name
    ? `${branding.company_name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}-monitoring-${new Date().toISOString().slice(0, 10)}.pdf`
    : `monitoring-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

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
