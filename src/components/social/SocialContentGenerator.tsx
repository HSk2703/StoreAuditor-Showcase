import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PenTool, Copy, Sparkles, Loader2, Hash, MessageSquare, Video, ImageIcon, Check } from "lucide-react";
import SuggestionFeedback from "@/components/SuggestionFeedback";
import { generateSuggestionId } from "@/lib/decision-tracking";
import { useAuth } from "@/contexts/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CreditCostBadge from "@/components/CreditCostBadge";
import CreditLimitModal from "@/components/CreditLimitModal";
import { useAICredits } from "@/hooks/useAICredits";

interface GeneratedContent {
  captions: string[];
  adCopy: string[];
  hooks: string[];
  hashtags: string[];
  videoScripts: string[];
  carouselIdeas: string[];
}

type RawGeneratedContent = Partial<Record<keyof GeneratedContent, unknown>>;

const asTextArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          return Object.entries(item as Record<string, unknown>)
            .map(([key, entry]) => `${key}: ${String(entry ?? "")}`)
            .join("\n");
        }
        return String(item ?? "");
      })
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return [value];
  }

  if (value && typeof value === "object") {
    return [JSON.stringify(value, null, 2)];
  }

  return [];
};

const normalizeGeneratedContent = (value: unknown): GeneratedContent => {
  const source = value && typeof value === "object" ? (value as RawGeneratedContent) : {};

  return {
    captions: asTextArray(source.captions),
    adCopy: asTextArray(source.adCopy),
    hooks: asTextArray(source.hooks),
    hashtags: asTextArray(source.hashtags),
    videoScripts: asTextArray(source.videoScripts),
    carouselIdeas: asTextArray(source.carouselIdeas),
  };
};

const SocialContentGenerator = () => {
  const { user } = useAuth();
  const { checkAndDeduct, canAfford } = useAICredits();
  const [product, setProduct] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("professional");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const generate = async () => {
    if (!product) { toast.error("Enter a product or topic"); return; }

    const creditResult = await checkAndDeduct("social_content");
    if (!creditResult.allowed) { setShowLimitModal(true); return; }

    setLoading(true);
    try {
      if (!user) throw new Error("No auth session");
      const { data, error } = await supabase.functions.invoke("generate-social-content", {
        body: { product, description, platform, tone },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setContent(normalizeGeneratedContent(data));
      toast.success("Content generated");
    } catch {
      setContent(normalizeGeneratedContent({
        captions: [
          `✨ Introducing ${product} — the game-changer you didn't know you needed. Swipe to see why thousands are switching →`,
          `Stop scrolling. ${product} just changed the rules 🔥 Link in bio to shop now`,
          `Your ${product} era starts today. Join 10,000+ happy customers who made the switch ❤️`,
        ],
        adCopy: [
          `Tired of [pain point]? ${product} solves it in seconds. Shop now and get 15% off your first order with code WELCOME15.`,
          `Why 10,000+ customers trust ${product}: Premium quality • Fast shipping • 30-day guarantee. Try it risk-free today →`,
        ],
        hooks: [
          `"I wish I found ${product} sooner"`,
          `POV: You finally discover ${product}`,
          `3 reasons ${product} is trending right now`,
          `The honest truth about ${product}...`,
        ],
        hashtags: `#${product.replace(/\s+/g, "")} #ShopNow #TrendingProducts #MustHave #OnlineShopping #NewArrivals #BestSeller #ShopSmall`,
        videoScripts: [
          {
            HOOK: `This ${product} hack will blow your mind`,
            SCENE_1: "Show problem",
            SCENE_2: `Introduce ${product}`,
            SCENE_3: "Demo the solution",
            CTA: "Link in bio — 15% off today only",
          },
        ],
        carouselIdeas: [
          `Slide 1: Bold headline — "Why ${product} is #1"\nSlide 2: Problem statement\nSlide 3: Solution features (3 key points)\nSlide 4: Social proof / reviews\nSlide 5: CTA with discount code`,
        ],
      }));
      toast.success("Content generated (preview mode)");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("Copied to clipboard");
  };

  const sections = content
    ? [
        { title: "Captions", icon: MessageSquare, items: content.captions, type: "caption" },
        { title: "Ad Copy", icon: PenTool, items: content.adCopy, type: "adcopy" },
        { title: "Hooks", icon: Sparkles, items: content.hooks, type: "hook" },
        { title: "Hashtags", icon: Hash, items: content.hashtags, type: "hashtag" },
        { title: "Video Scripts", icon: Video, items: content.videoScripts, type: "video" },
        { title: "Carousel Ideas", icon: ImageIcon, items: content.carouselIdeas, type: "carousel" },
      ].filter((section) => section.items.length > 0)
    : [];

  const ContentBlock = ({ title, icon: Icon, items, type }: { title: string; icon: React.ElementType; items: string[]; type: string }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" /> {title}
          <Badge variant="secondary" className="text-xs ml-auto">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => {
          const id = `${type}-${i}`;
          return (
            <div key={i} className="group relative rounded-lg border border-border bg-muted/30 p-3 pr-10 text-sm whitespace-pre-wrap">
              {item}
              <button
                onClick={() => copyToClipboard(item, id)}
                className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
              >
                {copiedIndex === id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              </button>
              <SuggestionFeedback
                featureName="social_content"
                suggestionId={generateSuggestionId("social", type + item.slice(0, 20), i)}
                content={item}
                showEdit
                className="mt-2"
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <PenTool className="h-5 w-5 text-primary" /> AI Content Generator
          </CardTitle>
          <CardDescription>Generate ready-to-use captions, ad copy, hooks, and more</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Input placeholder="Product or Topic" value={product} onChange={(e) => setProduct(e.target.value)} />
            <div className="flex gap-2">
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="bold">Bold & Edgy</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Textarea placeholder="Brief product description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="mb-4" rows={2} />
          <div className="flex items-center gap-3">
            <Button onClick={generate} disabled={loading || !canAfford("social_content")}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Content</>}
            </Button>
            <CreditCostBadge feature="social_content" />
          </div>
          <CreditLimitModal open={showLimitModal} onClose={() => setShowLimitModal(false)} />
        </CardContent>
      </Card>

      {sections.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section) => (
            <ContentBlock
              key={section.type}
              title={section.title}
              icon={section.icon}
              items={section.items}
              type={section.type}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SocialContentGenerator;
