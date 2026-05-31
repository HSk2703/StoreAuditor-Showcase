/**
 * Blog content service — DB-backed (L7).
 *
 * Articles live in the public.blog_posts table with public read on
 * `is_published = true`. Adding a new article no longer requires a redeploy.
 * The `BlogPost`/`BlogBlock` types are still re-exported from blog-data.ts so
 * downstream components don't need to change.
 */

import { supabase } from "@/integrations/supabase/client";
import type { BlogBlock, BlogPost } from "@/lib/blog-data";

export type { BlogBlock, BlogPost } from "@/lib/blog-data";

// Database row shape (snake_case) → BlogPost (camelCase)
interface BlogRow {
  slug: string;
  title: string;
  meta_description: string;
  keywords: string[] | null;
  category: string;
  excerpt: string;
  body: BlogBlock[] | null;
  related: string[] | null;
  reading_minutes: number | null;
  published_at: string;
}

function rowToPost(r: BlogRow): BlogPost {
  return {
    slug: r.slug,
    title: r.title,
    metaDescription: r.meta_description,
    keywords: r.keywords ?? [],
    date: r.published_at?.slice(0, 10) ?? "",
    readingMinutes: r.reading_minutes ?? 5,
    category: r.category,
    excerpt: r.excerpt,
    body: r.body ?? [],
    related: r.related ?? [],
  };
}

export async function fetchAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug,title,meta_description,keywords,category,excerpt,body,related,reading_minutes,published_at",
    )
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []).map((r) => rowToPost(r as unknown as BlogRow));
}

export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "slug,title,meta_description,keywords,category,excerpt,body,related,reading_minutes,published_at",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToPost(data as unknown as BlogRow) : null;
}

export async function fetchInternalLinkPosts(
  currentSlug: string,
  related: string[],
  count: number,
): Promise<BlogPost[]> {
  const all = await fetchAllPosts();
  const out: BlogPost[] = [];
  const seen = new Set<string>([currentSlug]);
  for (const slug of related) {
    if (out.length >= count) break;
    const found = all.find((p) => p.slug === slug);
    if (found && !seen.has(found.slug)) {
      out.push(found);
      seen.add(found.slug);
    }
  }
  if (out.length < count) {
    for (const p of all) {
      if (out.length >= count) break;
      if (!seen.has(p.slug)) {
        out.push(p);
        seen.add(p.slug);
      }
    }
  }
  return out;
}
