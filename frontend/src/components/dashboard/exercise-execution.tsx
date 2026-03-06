import { useState } from "react";
import type { SessionExercise } from "@/lib/session-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Check, Video, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseExecutionProps {
  exercise: SessionExercise;
  totalExercises: number;
  currentNumber: number;
  onComplete: () => void;
}

export function ExerciseExecution({ exercise, totalExercises, currentNumber, onComplete }: ExerciseExecutionProps) {
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  const toggleSet = (setIdx: number) => {
    if (completedSets.includes(setIdx)) {
      setCompletedSets(completedSets.filter(s => s !== setIdx));
    } else {
      setCompletedSets([...completedSets, setIdx]);
    }
  };

  const allSetsDone = completedSets.length === exercise.sets;

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="px-6 py-4 border-b border-border/10">
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="font-heading border-primary/20 text-primary px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-widest">
             {currentNumber} / {totalExercises}
           </Badge>
           <h1 className="text-xl font-black font-heading tracking-tight uppercase italic">{exercise.exercise_name}</h1>
        </div>
      </header>

      <div className="px-4 sm:px-6 space-y-6 sm:space-y-8 flex-1">
        <div className="space-y-3">
          {/* Media Placeholder */}
          <div className="aspect-video w-full max-h-[140px] bg-muted rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group border-2 border-border/30">
             <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent shadow-inner" />
             <Video className="w-8 h-8 text-muted-foreground/30 group-hover:scale-110 transition-transform duration-500" />
             <span className="text-[9px] font-bold text-muted-foreground/50 mt-1 uppercase tracking-[0.2em]">Demonstration</span>
          </div>

          {/* Detail Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-8 rounded-lg gap-2 font-bold text-[10px] uppercase tracking-widest text-muted-foreground hover:bg-muted/30"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showDetails ? "Hide" : "Details"}
          </Button>

          {showDetails && (
            <div className="p-4 bg-muted/20 rounded-2xl animate-in slide-in-from-top-2 duration-300">
               <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Focus on controlled movements and full range of motion. Keep your core engaged throughout the set.
               </p>
            </div>
          )}
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2">
           <div className="bg-card rounded-xl p-2.5 text-center border shadow-sm">
             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Sets</p>
             <p className="text-xl font-black font-heading text-primary">{exercise.sets}</p>
           </div>
           <div className="bg-card rounded-xl p-2.5 text-center border shadow-sm">
             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Reps</p>
             <p className="text-xl font-black font-heading text-primary">{exercise.reps}</p>
           </div>
           <div className="bg-card rounded-xl p-2.5 text-center border shadow-sm">
             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Weight</p>
             <p className="text-xl font-black font-heading text-primary">{exercise.weight || "-"}<span className="text-xs font-bold ml-0.5">kg</span></p>
           </div>
        </div>

        {/* Set Tracker */}
        <section className="space-y-3 pb-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground px-1">Track Progress</h2>
            <Badge variant="secondary" className="rounded-full px-2 py-0.5 bg-primary/5 text-primary border-none font-bold text-[10px]">
              {completedSets.length} / {exercise.sets}
            </Badge>
          </div>
          <div className="grid gap-3">
             {Array.from({ length: exercise.sets }).map((_, i) => (
                <Button
                  key={i}
                  variant="outline"
                  onClick={() => toggleSet(i)}
                  className={cn(
                    "w-full h-12 rounded-xl font-black font-heading text-lg transition-all border-2 flex items-center justify-between px-4 group",
                    completedSets.includes(i) 
                      ? "bg-primary border-primary text-white shadow-premium scale-[0.98]" 
                      : "bg-surface border-border/50 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <span className="text-xs uppercase tracking-widest">Set {i + 1}</span>
                  {completedSets.includes(i) ? <Check className="w-5 h-5 stroke-[3.5px]" /> : <ArrowRight className="w-3 h-3 opacity-50 group-hover:translate-x-1 transition-transform" />}
                </Button>
             ))}
          </div>
        </section>
      </div>

      <div className="p-4 sm:p-6 bg-linear-to-t from-background via-background to-transparent pt-12">
        <Button 
          onClick={onComplete} 
          disabled={!allSetsDone}
          className={cn(
            "w-full h-14 rounded-full text-lg font-bold transition-all gap-2",
            allSetsDone ? "bg-primary shadow-xl shadow-primary/30" : "bg-muted text-muted-foreground grayscale cursor-not-allowed"
          )}
        >
          {allSetsDone ? "Finish Exercise" : "Complete All Sets to Continue"}
        </Button>
      </div>
    </div>
  );
}
