import type { SessionExercise } from "@/lib/session-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ChevronLeft, Dumbbell, Sparkles, Footprints, Info } from "lucide-react";

interface SessionOverviewProps {
  exercises: SessionExercise[];
  onStart: () => void;
  onBack: () => void;
}

export function SessionOverview({ exercises, onStart, onBack }: SessionOverviewProps) {
  const stages = ["warmup", "main", "relax"];
  
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "warmup": return <Footprints className="w-5 h-5" />;
      case "main": return <Dumbbell className="w-5 h-5" />;
      case "relax": return <Sparkles className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getStageLabel = (stage: string) => {
    if (stage === "relax") return "Cooldown";
    return stage.charAt(0).toUpperCase() + stage.slice(1);
  };

  return (
    <div className="flex flex-col h-full bg-background scrollbar-hide pb-24">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-4 py-4 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-black font-heading tracking-tight">Today's Workout</h1>
      </header>

      <div className="px-4 space-y-6 flex-1 pt-2">
        {stages.map((stage) => {
          const stageExercises = exercises
            .filter((ex) => ex.stage_of_exercises.toLowerCase() === stage)
            .sort((a, b) => a.sequence_order - b.sequence_order);

          if (stageExercises.length === 0) return null;

          return (
            <section key={stage} className="space-y-3">
              <div className="flex items-center gap-2 pl-1">
                <span className="text-primary">{getStageIcon(stage)}</span>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {getStageLabel(stage)}
                </h2>
                <Badge variant="secondary" className="ml-auto bg-muted/50 text-[10px] h-5">
                  {stageExercises.length} {stageExercises.length === 1 ? 'Exercise' : 'Exercises'}
                </Badge>
              </div>

              <div className="grid gap-3">
                {stageExercises.map((ex) => (
                  <Card key={ex.id} className="border-none shadow-soft overflow-hidden group hover:shadow-lg transition-all bg-card/50">
                    <CardContent className="p-0 flex items-center">
                      <div className="w-16 h-16 bg-muted flex items-center justify-center shrink-0">
                         <Dumbbell className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="p-3 flex-1 min-w-0">
                        <h3 className="font-bold font-heading text-base truncate leading-tight">{ex.exercise_name}</h3>
                        <p className="text-xs text-muted-foreground font-body truncate">
                          {ex.sets} sets × {ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ""}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="p-6 bg-linear-to-t from-background via-background to-transparent pt-12">
        <Button 
          onClick={onStart} 
          className="w-full h-14 rounded-full text-lg font-bold shadow-xl shadow-primary/30 gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Play className="w-5 h-5 fill-current" />
          Start Workout
        </Button>
      </div>
    </div>
  );
}
