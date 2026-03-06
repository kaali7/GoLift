import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseFeedbackProps {
  onComplete: (feedback: { feedback_type: "too_easy" | "too_hard" | "good" | "form_issue"; feedback?: string }) => void;
}

export function ExerciseFeedback({ onComplete }: ExerciseFeedbackProps) {
  const [feedbackType, setFeedbackType] = useState<"too_easy" | "too_hard" | "good" | "form_issue" | null>(null);
  const [comment, setComment] = useState("");

  const options: { label: string; value: "too_easy" | "too_hard" | "good" | "form_issue"; icon: any; color: string }[] = [
    { label: "Too Easy", value: "too_easy", icon: Smile, color: "text-green-500" },
    { label: "Good", value: "good", icon: Meh, color: "text-yellow-500" },
    { label: "Too Hard", value: "too_hard", icon: Frown, color: "text-red-500" },
  ];

  return (
    <div className="flex flex-col h-full bg-background animate-in zoom-in-95 duration-500 p-6">
      <div className="flex-1 flex flex-col justify-center space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black font-heading">How was it?</h1>
          <p className="text-muted-foreground">Be honest—this helps our AI adapt your plan.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {options.map((opt) => (
            <Card
              key={opt.value}
              onClick={() => setFeedbackType(opt.value)}
              className={cn(
                "p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all border-2",
                feedbackType === opt.value 
                  ? "border-primary bg-primary/5 shadow-md scale-105" 
                  : "border-border hover:border-primary/30"
              )}
            >
              <opt.icon className={cn("w-10 h-10", feedbackType === opt.value ? opt.color : "text-muted-foreground")} />
              <span className={cn("font-bold text-sm", feedbackType === opt.value ? "text-primary" : "text-muted-foreground")}>
                {opt.label}
              </span>
            </Card>
          ))}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Optional Notes</label>
          <span className="text-[10px] text-muted-foreground block -mt-1 ml-1">(This helps our AI adapt your plan)</span>
          <Textarea 
            placeholder="Feelings, pain points, or just details about your form..."
            className="min-h-[120px] rounded-2xl bg-surface border-border focus:ring-primary/20 resize-none"
            value={comment}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComment(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-6">
        <Button 
          onClick={() => feedbackType && onComplete({ feedback_type: feedbackType, feedback: comment })}
          disabled={!feedbackType}
          className="w-full h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20 gap-2"
        >
          <Send className="w-5 h-5" />
          Continue
        </Button>
      </div>
    </div>
  );
}
