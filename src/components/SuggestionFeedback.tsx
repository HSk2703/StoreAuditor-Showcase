import { useState, useEffect, useRef, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trackDecision, type ActionType } from "@/lib/decision-tracking";
import { cn } from "@/lib/utils";

interface SuggestionFeedbackProps {
  featureName: string;
  suggestionId: string;
  content?: string;
  className?: string;
  showEdit?: boolean;
  onApply?: () => void;
}

const IGNORE_THRESHOLD_MS = 15000;

export default function SuggestionFeedback({
  featureName,
  suggestionId,
  content,
  className,
  showEdit = false,
  onApply,
}: SuggestionFeedbackProps) {
  const [action, setAction] = useState<ActionType | null>(null);
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(content ?? "");
  const viewedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Track "viewed" on mount
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    trackDecision({ feature_name: featureName, suggestion_id: suggestionId, action_type: "viewed" });

    // Track "ignored" if no interaction within threshold
    timerRef.current = setTimeout(() => {
      if (!action) {
        trackDecision({ feature_name: featureName, suggestion_id: suggestionId, action_type: "ignored" });
      }
    }, IGNORE_THRESHOLD_MS);

    return () => clearTimeout(timerRef.current);
  }, [featureName, suggestionId]); // eslint-disable-line

  const handleAction = useCallback(
    (type: ActionType, extra?: Partial<Parameters<typeof trackDecision>[0]>) => {
      clearTimeout(timerRef.current);
      setAction(type);
      trackDecision({ feature_name: featureName, suggestion_id: suggestionId, action_type: type, ...extra });
    },
    [featureName, suggestionId],
  );

  const handleApply = () => {
    handleAction("accepted");
    onApply?.();
  };

  const handleSaveEdit = () => {
    handleAction("edited", { original_content: content, edited_content: editedText });
    setEditing(false);
  };

  if (action && !editing) {
    const labels: Record<string, string> = {
      accepted: "Applied ✓",
      rejected: "Feedback noted",
      edited: "Saved your version",
    };
    return (
      <span className={cn("text-xs text-muted-foreground italic", className)}>
        {labels[action] ?? "Thanks for your feedback"}
      </span>
    );
  }

  if (editing) {
    return (
      <div className={cn("space-y-2", className)}>
        <Textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          rows={3}
          className="text-sm"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="default" onClick={handleSaveEdit} className="gap-1.5 h-7 text-xs">
            <Check className="h-3 w-3" /> Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-7 text-xs">
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {onApply && (
        <Button size="sm" variant="outline" onClick={handleApply} className="gap-1.5 h-7 text-xs border-primary/30 text-primary hover:bg-primary/5">
          <Check className="h-3 w-3" /> Apply
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={() => handleAction("accepted")} className="gap-1 h-7 text-xs text-muted-foreground hover:text-success">
        <ThumbsUp className="h-3 w-3" /> Helpful
      </Button>
      <Button size="sm" variant="ghost" onClick={() => handleAction("rejected")} className="gap-1 h-7 text-xs text-muted-foreground hover:text-destructive">
        <ThumbsDown className="h-3 w-3" /> Not Useful
      </Button>
      {showEdit && content && (
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)} className="gap-1 h-7 text-xs text-muted-foreground">
          <Pencil className="h-3 w-3" /> Edit & Use
        </Button>
      )}
    </div>
  );
}
