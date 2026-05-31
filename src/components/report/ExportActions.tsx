import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Props {
  storeId: string;
  storeName: string;
}

const ExportActions = ({ storeId, storeName }: Props) => {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Use browser print as PDF
      window.print();
      toast({ title: "PDF export initiated" });
    } finally {
      setExporting(false);
    }
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/agency/performance/${storeId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Report link copied to clipboard" });
  };

  const handleClientView = () => {
    navigate(`/agency/report/${storeId}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting} className="gap-2">
        {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        Export PDF
      </Button>
      <Button variant="outline" size="sm" onClick={handleShareLink} className="gap-2">
        <Share2 className="h-3.5 w-3.5" /> Share Link
      </Button>
      <Button variant="outline" size="sm" onClick={handleClientView} className="gap-2">
        <ExternalLink className="h-3.5 w-3.5" /> Client View
      </Button>
    </div>
  );
};

export default ExportActions;
