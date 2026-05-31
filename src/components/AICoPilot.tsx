import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Maximize2, Minimize2, Plus, Lightbulb, AlertCircle, TrendingUp, History, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { toast } from "@/hooks/use-toast";
import AIMascot, { type MascotState } from "@/components/copilot/AIMascot";
import OrbitActions from "@/components/copilot/OrbitActions";
import ResponseCard from "@/components/copilot/ResponseCard";
import ThinkingAnimation from "@/components/copilot/ThinkingAnimation";
import ConversationHistory from "@/components/copilot/ConversationHistory";
import ActionCard from "@/components/copilot/ActionCard";
import { playActivationChime, playResponsePing } from "@/components/copilot/sounds";
import { AI_NAME, KAIRO_PERSONALITY, type KairoAction } from "@/lib/kairo-identity";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  severity: string;
  insight_type: string;
  is_read: boolean;
}

const COPILOT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/copilot-chat`;

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: `${KAIRO_PERSONALITY.getGreeting()}\n\nI have access to your store audits, UX analysis, revenue data, and connected integrations.\n\n**Try the orbit actions** around my icon, or ask me anything.`,
};

// Mock actions for demo — in production, the AI would generate these
const DEMO_ACTIONS: KairoAction[] = [
  {
    id: "1",
    type: "content_update",
    title: "Optimize Hero CTA Text",
    description: "Your current CTA has low engagement. Suggested: 'Shop Now — Free Shipping Today'",
    impact: "high",
    preview: "Before: 'Browse Our Collection'\nAfter: 'Shop Now — Free Shipping Today'",
    status: "suggested",
    category: "Homepage",
    estimatedUplift: "3.2%",
  },
  {
    id: "2",
    type: "layout_change",
    title: "Add Trust Badges Above Fold",
    description: "Stores with visible trust signals see 12% higher conversion rates",
    impact: "high",
    preview: "Add: Payment icons, SSL badge, and satisfaction guarantee near the hero section",
    status: "suggested",
    category: "Trust",
    estimatedUplift: "5.1%",
  },
  {
    id: "3",
    type: "content_update",
    title: "Rewrite Product Descriptions",
    description: "Your top 3 products have generic descriptions. AI-optimized copy improves conversions",
    impact: "medium",
    preview: "Before: 'High quality product made with care'\nAfter: 'Handcrafted with premium materials — loved by 2,000+ customers'",
    status: "suggested",
    category: "Products",
    estimatedUplift: "2.8%",
  },
];

export default function AICoPilot() {
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [showInsights, setShowInsights] = useState(false);
  const [showOrbit, setShowOrbit] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [actions, setActions] = useState<KairoAction[]>(DEMO_ACTIONS);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mascotState: MascotState = isLoading
    ? (messages[messages.length - 1]?.role === "user" ? "thinking" : "responding")
    : insights.filter(i => !i.is_read).length > 0
    ? "alerting"
    : open
    ? "listening"
    : "idle";

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("copilot_insights" as any)
      .select("*")
      .eq("user_id", user.id)
      .eq("is_dismissed", false)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setInsights(data as any[]);
      });
  }, [user, open]);

  const ensureConversation = useCallback(async () => {
    if (conversationId || !user) return conversationId;
    const { data } = await supabase
      .from("copilot_conversations" as any)
      .insert({ user_id: user.id, title: `${AI_NAME} Chat` })
      .select("id")
      .single();
    const id = (data as any)?.id ?? null;
    setConversationId(id);
    return id;
  }, [conversationId, user]);

  const streamChat = useCallback(async (allMessages: Message[], convId: string | null) => {
    const resp = await fetch(COPILOT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
        conversation_id: convId,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      if (resp.status === 429) {
        toast({ title: "Rate Limited", description: "Too many requests. Please wait a moment.", variant: "destructive" });
      } else if (resp.status === 402) {
        toast({ title: "Credits Exhausted", description: "Add AI credits to continue using the Co-Pilot.", variant: "destructive" });
      }
      throw new Error(err.error || "Request failed");
    }
    if (!resp.body) throw new Error("No response stream");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && last !== WELCOME_MESSAGE) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    let streamDone = false;
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) upsert(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    playResponsePing();

    if (convId && assistantSoFar) {
      await supabase.from("copilot_messages" as any).insert({
        conversation_id: convId,
        role: "assistant",
        content: assistantSoFar,
      });
    }
  }, []);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    setInput("");
    setShowInsights(false);
    setShowOrbit(false);
    setShowHistory(false);
    setShowActions(false);
    const userMsg: Message = { role: "user", content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setIsLoading(true);
    try {
      const convId = await ensureConversation();
      await streamChat(updated.filter((m) => m !== WELCOME_MESSAGE), convId);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: `I'm having trouble connecting right now. Please try again in a moment.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setConversationId(null);
    setShowInsights(false);
    setShowHistory(false);
    setShowActions(false);
  };

  const handleLoadConversation = (id: string, msgs: { role: "user" | "assistant"; content: string }[]) => {
    setConversationId(id);
    setMessages([WELCOME_MESSAGE, ...msgs]);
    setShowHistory(false);
  };

  const handleOpen = () => {
    setOpen(true);
    playActivationChime();
  };

  const dismissInsight = async (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("copilot_insights" as any).update({ is_dismissed: true }).eq("id", id);
  };

  const askAboutInsight = (insight: Insight) => {
    setShowInsights(false);
    handleSend(`Tell me more about this: "${insight.title}" — ${insight.description}`);
  };

  const handleApproveAction = (action: KairoAction) => {
    setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, status: "completed" as const } : a));
  };

  const handleDismissAction = (action: KairoAction) => {
    setActions((prev) => prev.filter((a) => a.id !== action.id));
  };

  const handleUndoAction = (action: KairoAction) => {
    setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, status: "suggested" as const } : a));
    toast({ title: "Action Rolled Back", description: `"${action.title}" has been undone` });
  };

  const unreadInsights = insights.filter((i) => !i.is_read);
  const pendingActions = actions.filter((a) => a.status === "suggested");

  const severityIcon = (severity: string) => {
    if (severity === "warning" || severity === "critical") return <AlertCircle className="h-3.5 w-3.5 text-amber-400" />;
    if (severity === "success") return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
    return <Lightbulb className="h-3.5 w-3.5 text-primary" />;
  };

  const panelClass = expanded
    ? "fixed inset-4 z-50 flex flex-col rounded-2xl"
    : "fixed bottom-4 right-4 z-50 flex flex-col w-[440px] max-w-[calc(100vw-2rem)] h-[620px] max-h-[calc(100vh-2rem)] rounded-2xl sm:bottom-6 sm:right-6";

  return (
    <>
      {/* Floating AI Core */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
            onMouseEnter={() => setShowOrbit(true)}
            onMouseLeave={() => setShowOrbit(false)}
          >
            <div className="relative">
              <OrbitActions visible={showOrbit} onAction={(p) => { handleOpen(); setTimeout(() => handleSend(p), 300); }} />
              <AIMascot
                state={mascotState}
                size="md"
                unreadCount={unreadInsights.length + pendingActions.length}
                onClick={handleOpen}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Co-Pilot Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`${panelClass} border border-border/30 bg-background/90 backdrop-blur-2xl shadow-2xl shadow-black/25 overflow-hidden`}
          >
            <ConversationHistory
              visible={showHistory}
              onClose={() => setShowHistory(false)}
              onLoadConversation={handleLoadConversation}
              currentConversationId={conversationId}
            />

            {/* Header */}
            <div className="flex items-center justify-between gap-2 border-b border-border/30 px-4 py-3 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
              <div className="flex items-center gap-3">
                <AIMascot state={mascotState} size="sm" />
                <div>
                  <span className="font-semibold text-sm text-foreground tracking-tight">{AI_NAME}</span>
                  <p className="text-[10px] text-muted-foreground">
                    {isLoading ? "Analyzing..." : "AI Growth Strategist"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-1.5 rounded-lg transition-colors ${showHistory ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                  title="Conversation history"
                >
                  <History className="h-4 w-4" />
                </button>
                {/* Actions button */}
                <button
                  onClick={() => setShowActions(!showActions)}
                  className={`relative p-1.5 rounded-lg transition-colors ${showActions ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                  title="Pending actions"
                >
                  <Zap className="h-4 w-4" />
                  {pendingActions.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center">
                      {pendingActions.length}
                    </span>
                  )}
                </button>
                {insights.length > 0 && (
                  <button
                    onClick={() => setShowInsights(!showInsights)}
                    className={`relative p-1.5 rounded-lg transition-colors ${showInsights ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
                  >
                    <Lightbulb className="h-4 w-4" />
                    {unreadInsights.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground flex items-center justify-center">
                        {unreadInsights.length}
                      </span>
                    )}
                  </button>
                )}
                <button onClick={handleNewChat} className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1.5 hover:bg-muted/50" title="New conversation">
                  <Plus className="h-4 w-4" />
                </button>
                <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1.5 hover:bg-muted/50 hidden sm:flex">
                  {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button onClick={() => { setOpen(false); setExpanded(false); setShowHistory(false); setShowActions(false); }} className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-1.5 hover:bg-muted/50">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Proactive Insights */}
            <AnimatePresence>
              {showInsights && insights.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-border/30 overflow-hidden"
                >
                  <div className="px-3 py-2 space-y-1.5 max-h-[200px] overflow-y-auto">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Proactive Insights</p>
                    {insights.map((insight) => (
                      <motion.div
                        key={insight.id}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-start gap-2 rounded-xl bg-muted/30 backdrop-blur-sm border border-border/20 p-2.5 group"
                      >
                        {severityIcon(insight.severity)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{insight.title}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-2">{insight.description}</p>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          <button onClick={() => askAboutInsight(insight)} className="text-primary hover:bg-primary/10 rounded p-1 transition-colors" title="Ask about this">
                            <Send className="h-3 w-3" />
                          </button>
                          <button onClick={() => dismissInsight(insight.id)} className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1 transition-colors" title="Dismiss">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions Panel */}
            <AnimatePresence>
              {showActions && actions.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-border/30 overflow-hidden"
                >
                  <div className="px-3 py-2 space-y-2 max-h-[300px] overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{AI_NAME} Actions</p>
                      <span className="text-[10px] text-primary font-medium">{pendingActions.length} pending</span>
                    </div>
                    {actions.map((action) => (
                      <ActionCard
                        key={action.id}
                        action={action}
                        onApprove={handleApproveAction}
                        onDismiss={handleDismissAction}
                        onUndo={handleUndoAction}
                        userPlan="free"
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.map((msg, i) => (
                <ResponseCard
                  key={i}
                  content={msg.content}
                  role={msg.role}
                  index={i}
                  isStreaming={isLoading && i === messages.length - 1 && msg.role === "assistant"}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <ThinkingAnimation />
              )}
            </div>

            {/* Quick actions for welcome state */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "🎯 Top priorities", prompt: "What are my top 3 priorities to improve conversions?" },
                    { label: "⚡ Quick wins", prompt: "Give me 3 quick wins I can implement today" },
                    { label: "📊 Score breakdown", prompt: "Break down my latest audit scores and what each means" },
                    { label: "🔧 Optimize my store", prompt: "Improve my homepage — prepare actions I can apply" },
                    { label: "📱 Mobile fixes", prompt: "What specific mobile UX issues should I fix?" },
                  ].map((q) => (
                    <motion.button
                      key={q.label}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSend(q.prompt)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-border/30 bg-muted/30 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      {q.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="border-t border-border/30 p-3 flex gap-2 bg-background/50 backdrop-blur-sm">
              <Input
                placeholder={`Ask ${AI_NAME} anything...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={isLoading}
                className="h-10 text-sm rounded-xl bg-muted/30 border-border/30 backdrop-blur-sm focus:bg-muted/50 transition-colors"
              />
              <Button size="icon" className="h-10 w-10 shrink-0 rounded-xl" onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="px-3 pb-2 text-[10px] text-muted-foreground leading-snug bg-background/50 backdrop-blur-sm">
              {AI_NAME}'s recommendations, simulations, and generated outputs are AI-assisted and should be reviewed before implementation.{" "}
              <a href="/ai-transparency" className="underline hover:text-foreground">Learn more</a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
