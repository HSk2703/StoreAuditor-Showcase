import { Cookie } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { openCookiePreferences } from "@/components/CookieConsent";

const CookiesPolicy = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Header />
    <main className="flex-1 container mx-auto px-4 pt-24 pb-16 max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Cookie className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Cookie Policy</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">Last updated: April 20, 2026</p>

      <div className="space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">What cookies are</h2>
          <p>
            Cookies are small text files placed on your device when you visit a website. They help sites remember
            information about your visit — your preferences, your session, and how you use the platform — so the
            experience is faster, more secure, and more personalized.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">How Store Auditor uses cookies</h2>
          <p>We use three categories of cookies and similar technologies, organized by purpose:</p>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-border/60 bg-card/50 p-4">
              <p className="text-sm font-semibold text-foreground mb-1">1. Strictly necessary (always on)</p>
              <p className="text-sm">
                Required to deliver the service you've requested — authenticating you, keeping you signed in,
                remembering your theme preference, securing forms against abuse, and routing your data within
                Lovable Cloud. The site cannot function without these. They cannot be disabled.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/50 p-4">
              <p className="text-sm font-semibold text-foreground mb-1">2. Analytics (off by default in EU)</p>
              <p className="text-sm">
                Help us understand how the platform is used so we can improve it. We use Microsoft Clarity for
                anonymized session insights and Google Analytics for aggregate traffic patterns. Both are configured
                to anonymize IP addresses where supported. Loaded only after you opt in.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-card/50 p-4">
              <p className="text-sm font-semibold text-foreground mb-1">3. Marketing (off by default)</p>
              <p className="text-sm">
                Used to measure the performance of advertising campaigns and re-engage visitors with relevant
                messaging — for example the Meta Pixel. Loaded only after you opt in.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Your choices</h2>
          <p>
            On your first visit you'll see a cookie banner letting you accept all cookies, reject non-essential
            cookies, or customize your preferences by category. You can change your choices at any time using the
            button below or the "Manage cookies" link in the footer.
          </p>
          <Button onClick={openCookiePreferences} className="mt-4">Manage cookie preferences</Button>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Browser controls</h2>
          <p>
            Most browsers let you block or delete cookies through their settings. Disabling strictly necessary
            cookies will prevent core features from working — you may not be able to sign in, save preferences, or
            persist your session.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Third-party services</h2>
          <p>
            When you connect integrations (Shopify, Canva, Google Analytics, Meta), those providers may set their
            own cookies governed by their respective policies. We never share your personal data with third parties
            for advertising without your explicit consent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Updates to this policy</h2>
          <p>
            We may update this policy as our platform evolves. Material changes will be flagged on this page and,
            where required, by re-prompting your consent.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
          <p>
            Questions about how we use cookies? Email{" "}
            <a href="mailto:privacy@storeauditor.io" className="text-primary hover:underline">privacy@storeauditor.io</a>{" "}
            or use our <a href="/contact" className="text-primary hover:underline">contact page</a>.
          </p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default CookiesPolicy;
