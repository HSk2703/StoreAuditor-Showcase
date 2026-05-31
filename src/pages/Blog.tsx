import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock, Loader2, Search, Sparkles, Tag } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageBreadcrumb from "@/components/PageBreadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  fetchAllPosts,
  fetchInternalLinkPosts,
  fetchPostBySlug,
  type BlogBlock,
  type BlogPost as BlogPostType,
} from "@/lib/blog-service";

const setMeta = (title: string, description: string, keywords?: string[]) => {
  document.title = title;
  const setTag = (selector: string, content: string, attr = "content") => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      const [, name] = selector.match(/\[(?:name|property)="([^"]+)"\]/) ?? [];
      if (name) {
        if (selector.startsWith("meta[property")) el.setAttribute("property", name);
        else el.setAttribute("name", name);
      }
      document.head.appendChild(el);
    }
    el.setAttribute(attr, content);
  };
  setTag('meta[name="description"]', description);
  setTag('meta[property="og:title"]', title);
  setTag('meta[property="og:description"]', description);
  setTag('meta[name="twitter:title"]', title);
  setTag('meta[name="twitter:description"]', description);
  if (keywords && keywords.length) {
    setTag('meta[name="keywords"]', keywords.join(", "));
  }
  // Per-route canonical
  const path = typeof window !== "undefined" ? window.location.pathname : "/blog";
  const canonicalHref = `https://storeauditor.io${path}`;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", canonicalHref);
  setTag('meta[property="og:url"]', canonicalHref);
};

const renderBlock = (block: BlogBlock, idx: number) => {
  switch (block.type) {
    case "p":
      return (
        <p key={idx} className="text-base leading-relaxed text-foreground/90 my-5">
          {block.text}
        </p>
      );
    case "h2":
      return (
        <h2 key={idx} id={block.id} className="text-2xl sm:text-3xl font-bold text-foreground mt-12 mb-4 tracking-tight">
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={idx} id={block.id} className="text-xl font-semibold text-foreground mt-8 mb-3">
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul key={idx} className="space-y-2 my-5 pl-5 list-disc text-foreground/90 marker:text-primary">
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed">{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={idx} className="space-y-2 my-5 pl-5 list-decimal text-foreground/90 marker:text-primary marker:font-semibold">
          {block.items.map((it, i) => (
            <li key={i} className="leading-relaxed pl-1">{it}</li>
          ))}
        </ol>
      );
    case "quote":
      return (
        <blockquote key={idx} className="my-6 border-l-4 border-primary pl-5 py-2 italic text-foreground/80">
          "{block.text}"
          {block.cite && <cite className="block not-italic text-xs text-muted-foreground mt-2">— {block.cite}</cite>}
        </blockquote>
      );
    case "callout":
      return (
        <div key={idx} className="my-7 rounded-2xl border border-primary/30 bg-primary/[0.04] p-5">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">{block.title}</p>
              <p className="text-sm text-foreground/85 leading-relaxed">{block.text}</p>
            </div>
          </div>
        </div>
      );
    case "links":
      return (
        <div key={idx} className="my-7 rounded-2xl border border-border bg-card/40 p-5">
          {block.title && <p className="text-sm font-semibold text-foreground mb-3">{block.title}</p>}
          <ul className="space-y-2">
            {block.items.map((it, i) => (
              <li key={i}>
                <Link to={it.href} className="text-sm text-primary hover:underline inline-flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3" /> {it.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    default:
      return null;
  }
};

const LoadingState = () => (
  <div className="container mx-auto px-4 py-20 text-center">
    <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-3" />
    <p className="text-sm text-muted-foreground">Loading articles…</p>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="container mx-auto px-4 py-20 max-w-md text-center">
    <Card className="p-6 border-destructive/30 bg-destructive/[0.04]">
      <p className="text-sm font-semibold text-foreground mb-2">Couldn't load articles</p>
      <p className="text-xs text-muted-foreground mb-4">{message}</p>
      <Button size="sm" onClick={onRetry}>Retry</Button>
    </Card>
  </div>
);

const BlogIndex = () => {
  const [posts, setPosts] = useState<BlogPostType[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");

  useEffect(() => {
    setMeta(
      "Shopify Growth Blog — AI Insights, CRO Strategies & Ecommerce Tactics | Store Auditor",
      "Long-form, data-driven articles on AI-powered Shopify optimization, conversion rate optimization, ecommerce automation, and the future of online retail.",
      ["Shopify blog", "ecommerce blog", "CRO blog", "AI ecommerce", "Shopify growth"]
    );
  }, []);

  const load = () => {
    setError(null);
    setPosts(null);
    fetchAllPosts()
      .then((data) => setPosts(data))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"));
  };

  useEffect(() => { load(); }, []);

  const allPosts = posts ?? [];
  const categories = useMemo(
    () => Array.from(new Set(allPosts.map((p) => p.category))).sort(),
    [allPosts],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPosts.filter((p) => {
      if (activeCat !== "All" && p.category !== activeCat) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [allPosts, query, activeCat]);

  const isFiltering = query.trim() !== "" || activeCat !== "All";
  const featured = allPosts[0];
  const rest = isFiltering ? filtered : allPosts.slice(1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.05] blur-[100px]" />
          </div>
          <div className="container relative mx-auto px-4 py-20 max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-5">
              <BookOpen className="h-3.5 w-3.5" />
              Store Auditor Blog
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-[1.1]">
              The Shopify Growth{" "}
              <span className="bg-gradient-to-r from-primary via-[hsl(250,70%,65%)] to-primary bg-clip-text text-transparent">
                Intelligence Hub
              </span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
              Deep, data-driven articles on AI-powered ecommerce optimization, conversion strategy, and how modern Shopify brands grow.
            </p>
          </div>
        </section>

        {posts === null && !error && <LoadingState />}
        {error && <ErrorState message={error} onRetry={load} />}

        {posts !== null && !error && (
          <>
            {/* Search + Filters */}
            <section className="container mx-auto px-4 pt-10 max-w-5xl">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search articles by topic, keyword, or title…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 h-11 bg-card border-border"
                    aria-label="Search blog articles"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["All", ...categories].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setActiveCat(c)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        activeCat === c
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured (only when not filtering) */}
            {!isFiltering && featured && (
              <section className="container mx-auto px-4 py-12 max-w-5xl">
                <Link to={`/blog/${featured.slug}`} className="group">
                  <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.04] to-transparent p-6 sm:p-10 hover:border-primary/40 transition-all">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                      <Badge variant="outline">{featured.category}</Badge>
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(featured.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {featured.readingMinutes} min read
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-5">{featured.excerpt}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Read article <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Card>
                </Link>
              </section>
            )}

            {/* Grid */}
            <section className="container mx-auto px-4 pb-20 max-w-5xl">
              {posts.length === 0 ? (
                <Card className="p-10 text-center border-dashed">
                  <p className="text-sm font-semibold text-foreground mb-2">No articles published yet</p>
                  <p className="text-xs text-muted-foreground">Check back soon — fresh insights are on the way.</p>
                </Card>
              ) : rest.length === 0 ? (
                <Card className="p-10 text-center border-dashed">
                  <p className="text-sm font-semibold text-foreground mb-2">No articles match your search</p>
                  <p className="text-xs text-muted-foreground mb-5">Try a different keyword or clear the filters.</p>
                  <Button size="sm" variant="outline" onClick={() => { setQuery(""); setActiveCat("All"); }}>
                    Clear filters
                  </Button>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((p, i) => (
                    <motion.div
                      key={p.slug}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: Math.min(i * 0.04, 0.3) }}
                    >
                      <Link to={`/blog/${p.slug}`} className="group block h-full">
                        <Card className="h-full p-5 hover:border-primary/40 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.25)] transition-all">
                          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {p.readingMinutes}m
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                            {p.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{p.excerpt}</p>
                          <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
                            Read more <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostType | null | undefined>(undefined); // undefined = loading
  const [related, setRelated] = useState<BlogPostType[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setPost(undefined);
    setError(null);
    fetchPostBySlug(slug)
      .then(async (p) => {
        setPost(p);
        if (p) {
          setMeta(`${p.title} | Store Auditor Blog`, p.metaDescription, p.keywords);
          window.scrollTo({ top: 0, behavior: "instant" });
          try {
            const r = await fetchInternalLinkPosts(p.slug, p.related, 3);
            setRelated(r);
          } catch { /* ignore — related is optional */ }
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Unknown error"));
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Couldn't load article</h1>
          <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
          <Button onClick={() => navigate("/blog")}>Back to blog</Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (post === undefined) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1"><LoadingState /></main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Article not found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been moved.</p>
          <Button onClick={() => navigate("/blog")}>Back to blog</Button>
        </main>
        <Footer />
      </div>
    );
  }

  // JSON-LD Article schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    keywords: post.keywords.join(", "),
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Organization", name: "Store Auditor" },
    publisher: { "@type": "Organization", name: "Store Auditor" },
    mainEntityOfPage: `https://storeauditor.io/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        <article className="container mx-auto px-4 py-14 max-w-3xl">
          {/* JSON-LD */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

          <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
            <Link to="/blog" className="gap-1.5"><ArrowLeft className="h-3.5 w-3.5" /> All articles</Link>
          </Button>
          <PageBreadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5 text-xs text-muted-foreground">
              <Badge variant="outline">{post.category}</Badge>
              <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {post.readingMinutes} min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-[1.1] tracking-tight mb-5">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
          </div>

          {/* Body */}
          <div className="prose prose-invert max-w-none">
            {post.body.map((block, i) => renderBlock(block, i))}
          </div>

          {/* Keywords */}
          <div className="mt-12 pt-6 border-t border-border/50">
            <div className="flex items-start gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Tag className="h-3 w-3" /> Topics:</span>
              {post.keywords.map((k) => (
                <Badge key={k} variant="outline" className="text-[10px]">{k}</Badge>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Card className="mt-10 p-6 border-primary/30 bg-primary/[0.04] text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">Ready to apply this to your store?</h3>
            <p className="text-sm text-muted-foreground mb-4">Run a free AI audit and see exactly where your conversion is leaking.</p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/store-audit">Start free audit <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </Card>

          {/* Related — internal links for SEO */}
          {related.length > 0 && (
            <div className="mt-14">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Continue reading</h3>
                <Link to="/blog" className="text-xs font-medium text-primary inline-flex items-center gap-1 hover:underline">
                  All articles <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {related.map((r) => (
                  <Link key={r.slug} to={`/blog/${r.slug}`} className="group">
                    <Card className="p-4 h-full hover:border-primary/40 hover:shadow-[0_8px_24px_-10px_hsl(var(--primary)/0.3)] transition-all flex flex-col">
                      <div className="flex items-center gap-2 mb-2 text-[10px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {r.readingMinutes}m</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors mb-2">
                        {r.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-auto">{r.excerpt}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
};

const Blog = () => {
  const { slug } = useParams<{ slug: string }>();
  return slug ? <BlogPost /> : <BlogIndex />;
};

export default Blog;
