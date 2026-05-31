import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingCards from "@/components/PricingCards";
import TopUpPackages from "@/components/TopUpPackages";
import AiTransparencyNotice from "@/components/AiTransparencyNotice";
import { usePageMeta } from "@/lib/usePageMeta";

const Pricing = () => {
  usePageMeta({
    title: "Pricing — AI-Assisted Shopify Growth Plans | Store Auditor",
    description: "Transparent pricing for AI-assisted Shopify optimization. Every plan includes human-approved automations, full audit history, and reversible AI actions.",
    canonical: "/pricing",
    keywords: ["Shopify pricing", "AI CRO pricing", "ecommerce automation pricing", "AI-assisted Shopify"],
  });
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 sm:py-24">
          <div className="container max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
                AI-Powered Shopify Optimization Plans
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Choose the right eCommerce growth automation plan for your Shopify store. No hidden fees — just AI-assisted conversion rate optimization under your control
              </p>
            </div>
            <PricingCards />

            <div className="max-w-2xl mx-auto mt-10">
              <AiTransparencyNotice variant="compact" />
            </div>

            <div className="mt-16">
              <TopUpPackages />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
