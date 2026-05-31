import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Trash2, X, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthProvider";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationHistoryProps {
  visible: boolean;
  onClose: () => void;
  onLoadConversation: (id: string, messages: { role: "user" | "assistant"; content: string }[]) => void;
  currentConversationId: string | null;
}

export default function ConversationHistory({ visible, onClose, onLoadConversation, currentConversationId }: ConversationHistoryProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !user) return;
    setLoading(true);
    supabase
      .from("copilot_conversations" as any)
      .select("id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (data) setConversations(data as any[]);
        setLoading(false);
      });
  }, [visible, user]);

  const loadConversation = async (conv: Conversation) => {
    const { data } = await supabase
      .from("copilot_messages" as any)
      .select("role, content")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true });
    if (data && data.length > 0) {
      onLoadConversation(conv.id, data as any[]);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    await supabase.from("copilot_messages" as any).delete().eq("conversation_id", id);
    await supabase.from("copilot_conversations" as any).delete().eq("id", id);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="absolute inset-y-0 left-0 w-[240px] bg-background/95 backdrop-blur-xl border-r border-border/30 z-20 flex flex-col"
        >
          <div className="flex items-center justify-between px-3 py-3 border-b border-border/30">
            <span className="text-xs font-semibold text-foreground">History</span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            {loading ? (
              <div className="space-y-2 px-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 rounded-lg bg-muted/30 animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-[11px] text-muted-foreground">No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => loadConversation(conv)}
                  className={`w-full text-left rounded-lg px-2.5 py-2 group transition-all ${
                    conv.id === currentConversationId
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted/40 border border-transparent"
                  }`}
                >
                  <p className="text-[11px] font-medium text-foreground truncate">{conv.title || "Co-Pilot Chat"}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[9px] text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
