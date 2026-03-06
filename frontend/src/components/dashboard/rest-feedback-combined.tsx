import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, CheckCircle, Wind, SkipForward, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestFeedbackCombinedProps {
  duration: number;
  onComplete: (feedback: { feedback_type: "too_easy" | "too_hard" | "good" | "form_issue"; feedback?: string }) => void;
}

export function RestFeedbackCombined({ duration, onComplete }: RestFeedbackCombinedProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [feedbackType, setFeedbackType] = useState<"too_easy" | "too_hard" | "good" | "form_issue" | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Don't auto-complete if feedback isn't selected, or maybe just wait?
      // User must select feedback to proceed usually.
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const percentage = (timeLeft / duration) * 100;

  const options: { label: string; value: "too_easy" | "too_hard" | "good" | "form_issue"; icon: React.ElementType; color: string; bg: string }[] = [
    { label: "Hard", value: "too_hard", icon: Flame, color: "text-red-500", bg: "bg-red-50" },
    { label: "Good", value: "good", icon: CheckCircle, color: "text-primary", bg: "bg-primary/5" },
    { label: "Easy", value: "too_easy", icon: Wind, color: "text-green-500", bg: "bg-green-50" },
  ];

  const handleFinish = () => {
    if (feedbackType) {
      onComplete({ feedback_type: feedbackType });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in zoom-in-95 duration-700 px-4 py-2 overflow-y-auto overflow-x-hidden">
      <div className="flex-1 space-y-4 sm:space-y-6 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black font-heading tracking-tight uppercase italic text-primary">Rest & Rate</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Recovery in progress</p>
        </div>

        {/* Timer Visualization - Responsive Scaling */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="text-muted/10 dark:text-muted/5"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 * (1 - percentage / 100)}
                    className="text-primary transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-black font-heading tabular-nums">{timeLeft}s</span>
            </div>
        </div>

        <div className="flex gap-3 w-full max-w-[240px]">
            <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9 text-[10px] font-bold uppercase tracking-widest gap-1.5" onClick={() => setTimeLeft(duration)}>
                <RotateCcw className="w-3 h-3" /> Reset
            </Button>
            <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9 text-[10px] font-bold uppercase tracking-widest gap-1.5" onClick={() => setTimeLeft(0)}>
                <SkipForward className="w-3 h-3" /> Skip
            </Button>
        </div>

        {/* Feedback Section */}
        <div className="w-full space-y-4 pt-3 border-t border-border/30">
            <div className="text-center space-y-0.5">
               <h2 className="text-base font-black font-heading uppercase italic">How was the set?</h2>
               <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">AI uses this to adjust intensity</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {options.map((opt) => (
                <Card
                  key={opt.value}
                  onClick={() => setFeedbackType(opt.value)}
                  className={cn(
                    "p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all border-2 rounded-2xl shadow-sm",
                    feedbackType === opt.value 
                      ? `border-primary ${opt.bg} shadow-premium scale-105` 
                      : "border-border/40 bg-card hover:border-primary/30"
                  )}
                >
                  <opt.icon className={cn("w-6 h-6", feedbackType === opt.value ? opt.color : "text-muted-foreground/40")} />
                  <span className={cn("font-bold text-[9px] uppercase tracking-widest", feedbackType === opt.value ? "text-primary" : "text-muted-foreground/60")}>
                    {opt.label}
                  </span>
                </Card>
             ))}
            </div>

            {/* Removed optional notes for compact mobile view */}
        </div>
      </div>

      <div className="pt-6">
        <Button 
          onClick={handleFinish}
          disabled={!feedbackType}
          className={cn(
            "w-full h-14 rounded-full text-lg font-black uppercase italic tracking-wider transition-all gap-2",
            feedbackType ? "bg-primary shadow-premium" : "grayscale opacity-50"
          )}
        >
          {timeLeft > 0 && !feedbackType ? `Next Exercise (${timeLeft}s)` : "Next Exercise"}
        </Button>
      </div>
    </div>
  );
}
