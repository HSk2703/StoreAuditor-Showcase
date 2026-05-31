import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const titles: Record<string, string> = {
  "/about": "About Store Auditor",
  "/contact": "Contact Us",
  "/privacy": "Privacy Policy",
  "/terms": "Terms of Service",
  "/competitor-analysis": "Competitor Analysis",
};

const PlaceholderPage = () => {
  const { pathname } = useLocation();
  const title = titles[pathname] || "Page";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">{title}</h1>
          <p className="text-muted-foreground">This page is coming soon.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlaceholderPage;
