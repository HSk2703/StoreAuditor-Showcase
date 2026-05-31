import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Calendar, Plus, GripVertical, Clock, Facebook, Instagram, Youtube, Globe,
  Trash2, Edit, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Send, Zap
} from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platform: string;
  date: string;
  time: string;
  status: "scheduled" | "posted" | "draft";
  recurring: boolean;
  type: "post" | "story" | "reel" | "ad";
}

const platformMeta: Record<string, { icon: React.ElementType; color: string }> = {
  facebook: { icon: Facebook, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  instagram: { icon: Instagram, color: "bg-pink-500/15 text-pink-600 dark:text-pink-400" },
  tiktok: { icon: Youtube, color: "bg-red-500/15 text-red-600 dark:text-red-400" },
  google: { icon: Globe, color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
};

const emptyForm = (): Omit<ScheduledPost, "id"> => ({
  title: "", content: "", platform: "instagram", date: format(new Date(), "yyyy-MM-dd"),
  time: "10:00", status: "scheduled", recurring: false, type: "post",
});

// Helper to get a stable anonymous user id for unauthenticated usage
const getAnonUserId = () => {
  let id = localStorage.getItem("social_anon_uid");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("social_anon_uid", id); }
  return id;
};

const SocialContentCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);
  const [form, setForm] = useState<Omit<ScheduledPost, "id">>(emptyForm());
  const dragItem = useRef<string | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || getAnonUserId();
  };

  const fetchPosts = useCallback(async () => {
    try {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from("social_media_posts")
        .select("*")
        .eq("user_id", userId)
        .order("scheduled_date", { ascending: true });
      if (error) throw error;
      setPosts((data || []).map((r: any) => ({
        id: r.id, title: r.title, content: r.content || "",
        platform: r.platform, date: r.scheduled_date, time: r.scheduled_time,
        status: r.status as ScheduledPost["status"],
        recurring: r.recurring, type: r.post_type as ScheduledPost["type"],
      })));
    } catch (e) {
      console.error("Failed to load posts", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openNew = (dateStr?: string) => {
    const f = emptyForm();
    if (dateStr) f.date = dateStr;
    setForm(f);
    setEditingPost(null);
    setDialogOpen(true);
  };

  const openEdit = (post: ScheduledPost) => {
    setForm({ title: post.title, content: post.content, platform: post.platform, date: post.date, time: post.time, status: post.status, recurring: post.recurring, type: post.type });
    setEditingPost(post);
    setDialogOpen(true);
  };

  const savePost = async () => {
    if (!form.title.trim()) { toast.error("Enter a title"); return; }
    const userId = await getUserId();
    const row = {
      user_id: userId,
      title: form.title,
      content: form.content,
      platform: form.platform,
      scheduled_date: form.date,
      scheduled_time: form.time,
      status: form.status,
      recurring: form.recurring,
      post_type: form.type,
      updated_at: new Date().toISOString(),
    };

    if (editingPost) {
      const { error } = await supabase.from("social_media_posts").update(row).eq("id", editingPost.id);
      if (error) { toast.error("Failed to update"); return; }
      toast.success("Post updated");
    } else {
      const { error } = await supabase.from("social_media_posts").insert(row);
      if (error) { toast.error("Failed to create"); return; }
      toast.success("Post scheduled");
    }
    setDialogOpen(false);
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from("social_media_posts").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    setPosts(prev => prev.filter(p => p.id !== id));
    toast.success("Post removed");
  };

  const handleDragStart = useCallback((postId: string) => { dragItem.current = postId; }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    if (!dragItem.current) return;
    const id = dragItem.current;
    dragItem.current = null;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, date: dateStr } : p));
    const { error } = await supabase.from("social_media_posts").update({ scheduled_date: dateStr, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error("Failed to move post"); fetchPosts(); return; }
    toast.success(`Moved to ${format(new Date(dateStr + "T00:00"), "MMM d")}`);
  }, [fetchPosts]);

  const postsForDate = (dateStr: string) => posts.filter(p => p.date === dateStr);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Content Calendar
            <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 bg-primary/10 text-primary ml-2">
              <Zap className="h-2.5 w-2.5" /> Auto-Publish Active
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground">Drag & drop to reschedule posts across dates</p>
        </div>
        <Button onClick={() => openNew()} className="gap-2">
          <Plus className="h-4 w-4" /> Schedule Post
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-base font-semibold text-foreground">{format(currentMonth, "MMMM yyyy")}</h3>
        <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="px-2 py-2 text-xs font-semibold text-muted-foreground text-center uppercase tracking-wider border-r border-border last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-[minmax(90px,1fr)]">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="border-r border-b border-border bg-muted/20" />
            ))}
            {days.map(day => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayPosts = postsForDate(dateStr);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={dateStr}
                  className={`border-r border-b border-border p-1.5 transition-colors min-h-[90px] ${isToday ? "bg-primary/5" : "hover:bg-accent/30"}`}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, dateStr)}
                  onClick={() => openNew(dateStr)}
                >
                  <div className={`text-xs font-medium mb-1 ${isToday ? "text-primary font-bold" : "text-muted-foreground"}`}>
                    {format(day, "d")}
                  </div>
                  <div className="space-y-1" onClick={e => e.stopPropagation()}>
                    <AnimatePresence>
                      {dayPosts.slice(0, 3).map(post => {
                        const pm = platformMeta[post.platform] || platformMeta.google;
                        const PIcon = pm.icon;
                        return (
                          <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            draggable
                            onDragStart={() => handleDragStart(post.id)}
                            className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] cursor-grab active:cursor-grabbing ${pm.color} group relative`}
                            onClick={() => openEdit(post)}
                          >
                            <GripVertical className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100 shrink-0" />
                            <PIcon className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate font-medium">{post.title}</span>
                            {post.status === "posted" && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {dayPosts.length > 3 && (
                      <div className="text-[9px] text-muted-foreground text-center">+{dayPosts.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {posts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Upcoming Scheduled Posts ({posts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {[...posts].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map(post => {
                const pm = platformMeta[post.platform] || platformMeta.google;
                const PIcon = pm.icon;
                return (
                  <div key={post.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 ${pm.color}`}>
                        <PIcon className="h-3 w-3" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{post.title}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(post.date + "T00:00"), "MMM d")} · {post.time} · {post.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize gap-1 ${
                          post.status === "posted"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : post.status === "draft"
                            ? "border-muted-foreground/30"
                            : "border-primary/30 bg-primary/10 text-primary"
                        }`}
                      >
                        {post.status === "posted" && <CheckCircle2 className="h-2.5 w-2.5" />}
                        {post.status === "scheduled" && <Clock className="h-2.5 w-2.5" />}
                        {post.status}
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(post)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deletePost(post.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Edit Post" : "Schedule New Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Post title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="Post content / caption" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.platform} onValueChange={v => setForm({ ...form, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as ScheduledPost["type"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="ad">Ad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.checked })} className="rounded" />
              Recurring (weekly)
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={savePost}>{editingPost ? "Update" : "Schedule"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialContentCalendar;
