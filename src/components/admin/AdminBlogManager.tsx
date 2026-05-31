import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Save, Trash2, RefreshCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { logAdminAction } from "@/lib/admin-audit";

interface Post {
  id?: string;
  slug: string;
  title: string;
  meta_description: string | null;
  keywords: string[] | null;
  category: string | null;
  excerpt: string | null;
  body: unknown; // JSONB array of blocks
  reading_minutes: number | null;
  is_published: boolean;
  published_at: string | null;
}

// Body is stored as JSONB array of {type,text|...} blocks. The editor uses a
// simple convention: each blank-line separated paragraph becomes a paragraph
// block. Lines starting with "## " become h2 headings.
function bodyToText(body: unknown): string {
  if (!Array.isArray(body)) return "";
  return body.map((b) => {
    const block = b as { type?: string; text?: string };
    if (block.type === "h2") return `## ${block.text ?? ""}`;
    return block.text ?? "";
  }).join("\n\n");
}

function textToBody(text: string): unknown[] {
  return text.split(/\n\s*\n/).map((para) => {
    const trimmed = para.trim();
    if (trimmed.startsWith("## ")) return { type: "h2", text: trimmed.slice(3).trim() };
    return { type: "paragraph", text: trimmed };
  }).filter((b) => (b as { text: string }).text.length > 0);
}

const empty: Post = {
  slug: "",
  title: "",
  meta_description: "",
  keywords: [],
  category: "",
  excerpt: "",
  body: [],
  reading_minutes: 5,
  is_published: false,
  published_at: null,
};

const AdminBlogManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) setError(error.message);
    setPosts((data ?? []) as Post[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.slug.trim() || !editing.title.trim()) {
      toast({ title: "Slug and title required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const bodyValue = typeof editing.body === "string" ? textToBody(editing.body) : (editing.body ?? []);
    const payload = {
      ...editing,
      body: bodyValue,
      keywords: Array.isArray(editing.keywords) ? editing.keywords : String(editing.keywords ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      published_at: editing.is_published ? (editing.published_at || new Date().toISOString()) : null,
    };
    const dbPayload = payload as never;
    const { data: saved, error } = editing.id
      ? await supabase.from("blog_posts").update(dbPayload).eq("id", editing.id).select("id, slug").maybeSingle()
      : await supabase.from("blog_posts").insert(dbPayload).select("id, slug").maybeSingle();
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    void logAdminAction(
      editing.id ? "blog.update" : "blog.create",
      "blog_post",
      saved?.id ?? editing.id ?? null,
      { slug: saved?.slug ?? editing.slug, is_published: editing.is_published },
    );
    toast({ title: "Saved" });
    setEditing(null);
    void load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    void logAdminAction("blog.delete", "blog_post", id);
    void load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading posts…
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-3">{error}</p>
        <Button onClick={load} variant="outline" size="sm"><RefreshCcw className="h-4 w-4 mr-2" />Retry</Button>
      </div>
    );
  }

  if (editing) {
    return (
      <div className="space-y-4 max-w-3xl">
        <h2 className="text-xl font-semibold">{editing.id ? "Edit Post" : "New Post"}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
          <div><Label>Category</Label><Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></div>
        </div>
        <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
        <div><Label>Meta description</Label><Textarea rows={2} value={editing.meta_description ?? ""} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} /></div>
        <div><Label>Excerpt</Label><Textarea rows={3} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></div>
        <div><Label>Body (paragraphs separated by blank lines; "## " prefix for headings)</Label><Textarea rows={14} value={typeof editing.body === "string" ? editing.body : bodyToText(editing.body)} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Keywords (comma-separated)</Label><Input value={(editing.keywords ?? []).join(", ")} onChange={(e) => setEditing({ ...editing, keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></div>
          <div><Label>Reading minutes</Label><Input type="number" value={editing.reading_minutes ?? 5} onChange={(e) => setEditing({ ...editing, reading_minutes: Number(e.target.value) })} /></div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={editing.is_published} onCheckedChange={(v) => setEditing({ ...editing, is_published: v })} />
          <Label>Published</Label>
        </div>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}Save</Button>
          <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Blog Posts ({posts.length})</h1>
        <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-2" />New post</Button>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-3">No posts yet</p>
          <Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-2" />Create your first post</Button>
        </div>
      ) : (
        <div className="border rounded-lg divide-y">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground truncate">/{p.slug} · {p.category ?? "—"} · {p.is_published ? "Published" : "Draft"}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditing(p)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => p.id && remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBlogManager;
