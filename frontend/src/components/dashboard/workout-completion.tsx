import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Clock, Target, ArrowRight, PartyPopper } from "lucide-react";

interface WorkoutCompletionProps {
  onDone: () => void;
  metrics: {
    exercisesCompleted: number;
    timeSpent: number; // in minutes
  };
}

export function WorkoutCompletion({ onDone, metrics }: WorkoutCompletionProps) {
  return (
    <div className="flex flex-col h-full bg-background animate-in zoom-in-95 fade-in duration-700 p-6">
      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/40">
            <Trophy className="w-16 h-16 text-white" />
          </div>
          <div className="absolute -top-2 -right-2">
            <PartyPopper className="w-8 h-8 text-yellow-500 animate-bounce" />
          </div>
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black font-heading leading-tight italic uppercase tracking-tighter">
            Workout <br /> <span className="text-primary">Complete!</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-[240px] mx-auto">
            You're one step closer to your fitness goals. Great consistency today!
          </p>
        </div>

        {/* Success Metrics */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <Card className="bg-surface/50 border-none shadow-sm overflow-hidden group">
            <CardContent className="p-5 flex flex-col items-center text-center gap-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-black font-heading line-height-none">{metrics.timeSpent}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Minutes</p>
            </CardContent>
          </Card>

          <Card className="bg-surface/50 border-none shadow-sm overflow-hidden group">
            <CardContent className="p-5 flex flex-col items-center text-center gap-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-black font-heading line-height-none">{metrics.exercisesCompleted}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exercises</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="pt-6">
        <Button 
          onClick={onDone} 
          className="w-full h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/20 gap-2 hover:translate-x-1 transition-transform"
        >
          Back to Dashboard
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
