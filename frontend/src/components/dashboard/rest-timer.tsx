import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Timer, SkipForward, RotateCcw } from "lucide-react";

interface RestTimerProps {
  duration: number;
  onComplete: () => void;
  onSkip: () => void;
}

export function RestTimer({ duration, onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const percentage = (timeLeft / duration) * 100;

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-700 p-6">
      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black font-heading text-primary">Recovery Phase</h1>
          <p className="text-muted-foreground">Take a breath. Prepare for the next set.</p>
        </div>

        {/* Circular Timer Visualization */}
        <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-muted/20"
                />
                <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={2 * Math.PI * 120 * (1 - percentage / 100)}
                    className="text-primary transition-all duration-1000 ease-linear"
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-6xl font-black font-heading tabular-nums">{timeLeft}</span>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Seconds</span>
            </div>
        </div>

        <div className="flex gap-4 w-full max-w-xs">
            <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-2xl gap-2 border-border hover:bg-muted"
                onClick={() => setTimeLeft(duration)}
            >
                <RotateCcw className="w-4 h-4" />
                Reset
            </Button>
            <Button 
                variant="outline" 
                className="flex-1 h-12 rounded-2xl gap-2 border-border hover:bg-muted"
                onClick={onSkip}
            >
                <SkipForward className="w-4 h-4" />
                Skip
            </Button>
        </div>
      </div>

      <div className="pt-6 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
            <Timer className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">Automatic transition in {timeLeft}s</span>
        </div>
      </div>
    </div>
  );
}
