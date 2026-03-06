import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Button } from "@/components/ui/button";
import { Play, Dumbbell, Sparkles, LayoutTemplate, PenTool, ChevronLeft, Calendar, CheckCircle2, ArrowRight, Moon } from "lucide-react";
import { CustomWorkoutBuilder } from "./custom-workout-builder";
import { PlanDetails } from "./plan-details";
import { WorkoutSessionFlow } from "./workout-session-flow";
import { cn } from "@/lib/utils";

// --- Types ---

interface Exercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  stage_of_exercises: string;
  sets: number;
  reps: string;
  weight: number;
  sequence_order: number;
}

interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  status: string;
  user_workout_id: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  difficulty_level: string;
  workout_type: string;
  duration_weeks: number;
}

// --- Sub-Components ---

function ActiveWorkoutView({ plan, exercises }: { plan: WorkoutPlan; exercises: Exercise[] }) {
  const navigate = useNavigate();
  const stages = ["warmup", "main", "relax"];
  // Check if today is recovery day or rest day
  const isRestDay = exercises.length === 0;
  const isRecoveryDay = exercises.some(ex => ex.stage_of_exercises === 'recovery');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-4 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-card border border-border/50 shadow-premium relative overflow-hidden group text-center">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="flex flex-col items-center justify-center gap-4 relative">
          <div className="space-y-2 flex flex-col items-center">
             <div className="flex items-center gap-2 mb-1 justify-center">
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full text-[10px] uppercase font-bold tracking-[0.2em]">
                  {isRestDay ? "Active Plan" : "Active Routine"}
                </Badge>
                {isRecoveryDay && <Badge className="bg-green-100 text-green-700 border-green-200 rounded-full text-[10px] uppercase font-bold tracking-[0.2em]">Recovery Day</Badge>}
                {isRestDay && <Badge className="bg-blue-100 text-blue-700 border-blue-200 rounded-full text-[10px] uppercase font-bold tracking-[0.2em]">Rest Day</Badge>}
             </div>
             <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading italic uppercase tracking-tighter leading-none">{plan.name}</h1>
             <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-2 max-w-lg mx-auto">
               {isRestDay 
                 ? "Rest is just as important as the work. Recharge and prepare for your next session."
                 : (plan.description || "Your personalized training plan optimized by AI.")
               }
             </p>
          </div>
        </div>
      </header>

      {isRestDay ? (
        <div className="p-12 text-center space-y-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-800/20 animate-in zoom-in-95 duration-700 max-w-2xl mx-auto">
           <div className="w-20 h-20 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center mx-auto text-blue-600">
              <Sparkles className="w-10 h-10" />
           </div>
           <div className="space-y-2">
              <h2 className="text-2xl font-black font-heading italic uppercase">Time to Recovery</h2>
              <p className="text-muted-foreground max-w-xs mx-auto text-sm font-medium">
                No exercises scheduled for today. Take this time to focus on mobility, hydration, and sleep.
              </p>
           </div>
           <div className="pt-4">
              <Button variant="outline" className="rounded-full shadow-soft" onClick={() => navigate('/insights')}>
                Check Your Progress
              </Button>
           </div>
        </div>
      ) : isRecoveryDay ? (
           <section className="space-y-4">
               <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-green-600 pl-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Recovery Activities
               </h2>
               <div className="grid gap-4">
                  {exercises.filter(ex => ex.stage_of_exercises === 'recovery').map((ex) => (
                    <Card 
                       key={ex.id} 
                       className="border-none shadow-soft hover:shadow-lg transition-all group overflow-hidden bg-green-50/50 border-green-100 cursor-pointer"
                       onClick={() => navigate(`/exercise/${ex.exercise_id}`)}
                    >
                      <CardContent className="p-0 flex items-center">
                        <div className="w-24 h-24 bg-green-100/50 flex items-center justify-center shrink-0">
                           <Sparkles className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="p-4 flex-1 space-y-1">
                          <h3 className="font-bold font-heading text-lg leading-none text-green-900">{ex.exercise_name}</h3>
                          <p className="text-sm text-green-700 font-body">
                             Duration: {ex.reps}
                          </p>
                        </div>
                        <div className="pr-6 opacity-0 group-hover:opacity-100 transition-opacity">
                           <ArrowRight className="w-6 h-6 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
               </div>
           </section>
      ) : (
          <div className="space-y-8">
            {stages.map((stage) => {
              const stageExercises = exercises
                .filter((ex) => ex.stage_of_exercises === stage)
                .sort((a, b) => a.sequence_order - b.sequence_order);

              if (stageExercises.length === 0) return null;

              const stageConfig: { color: string; bg: string; border: string; label: string } = ({
                warmup: { color: "text-green-600", bg: "bg-green-500/10", border: "border-green-500/20", label: "Warmup Phase" },
                main: { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20", label: "Main Training" },
                relax: { color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Cooldown" }
              } as Record<string, { color: string; bg: string; border: string; label: string }>)[stage] || { color: "text-muted-foreground", bg: "bg-muted/10", border: "border-muted/20", label: stage };

              return (
                <section key={stage} className="space-y-5">
                  <div className="flex items-center gap-4 px-2">
                     <h2 className={`text-xs font-black uppercase tracking-[0.3em] ${stageConfig.color}`}>
                       {stageConfig.label}
                     </h2>
                     <div className={`h-px flex-1 ${stageConfig.bg}`} />
                  </div>
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 xl:grid-cols-3 overflow-hidden">
                    {stageExercises.map((ex) => (
                      <Card 
                        key={ex.id} 
                        className={`border-2 border-transparent shadow-soft hover:shadow-premium transition-all group overflow-hidden bg-card/50 cursor-pointer hover:border-primary/20`}
                        onClick={() => navigate(`/exercise/${ex.exercise_id}`)}
                      >
                        <CardContent className="p-0 flex items-center">
                          <div className={`w-20 h-20 ${stageConfig.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                             <Dumbbell className={`w-7 h-7 ${stageConfig.color}`} />
                          </div>
                          <div className="p-4 flex-1 space-y-1">
                            <h3 className="font-bold font-heading text-lg leading-tight uppercase italic">{ex.exercise_name}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                              <span className={stageConfig.color}>{ex.sets} Sets</span>
                              <span className="opacity-30">•</span>
                              <span>{ex.reps} Reps</span>
                              {ex.weight ? <><span className="opacity-30">•</span><span>{ex.weight}kg</span></> : ""}
                            </p>
                          </div>
                          <div className="pr-6 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                             <ArrowRight className={`w-5 h-5 ${stageConfig.color}`} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
      )}

      {/* Fixed Bottom Start Button Area */}
      {!isRestDay && (
        <div className="fixed bottom-16 left-0 right-0 z-30 px-6 pb-2 pointer-events-none">
          <div className="container mx-auto max-w-lg pointer-events-auto">
             <Button 
               size="lg" 
               className="w-full h-14 md:h-16 rounded-2xl md:rounded-[2rem] shadow-premium font-black text-lg md:text-xl uppercase italic tracking-wider gap-3 group hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-white"
               onClick={() => {
                  window.dispatchEvent(new CustomEvent('start-workout-session', { detail: { autoStart: true } }));
               }}
             >
               <Play className="w-6 h-6 fill-current group-hover:translate-x-1 transition-transform" />
               Start Session
             </Button>
          </div>
        </div>
      )}
      {/* Spacer for the fixed button */}
      <div className="h-24" />
    </div>
  );
}

function CreationHub({ onSelectMode }: { onSelectMode: (mode: 'template' | 'ml' | 'user') => void }) {
    const [, setSearchParams] = useSearchParams();
    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 py-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setSearchParams({})}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="text-left flex-1">
                    <h1 className="text-3xl font-black font-heading tracking-tight uppercase italic">Setup Your Training</h1>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Choose your path</p>
                </div>
            </div>

            <div className="grid gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3">
                {/* Template Card */}
                <Card 
                    className="relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer shadow-soft hover:shadow-primary/10"
                    onClick={() => onSelectMode('template')}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                        <LayoutTemplate className="w-10 h-10 text-primary mb-2" />
                        <CardTitle>Browse Templates</CardTitle>
                        <CardDescription>Select from a library of proven workouts designed by fitness experts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                            <li>Beginner to Advanced</li>
                            <li>Strength, Hypertrophy, Cardio</li>
                            <li>Ready to go instantly</li>
                         </ul>
                    </CardContent>
                </Card>

                {/* ML Card */}
                <Card 
                    className="relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer shadow-soft hover:shadow-primary/10 border-primary/20 bg-primary/5"
                    onClick={() => onSelectMode('ml')}
                >
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                    <CardHeader>
                        <Sparkles className="w-10 h-10 text-primary mb-2" />
                        <CardTitle>AI Generator</CardTitle>
                        <CardDescription>Let our AI build a personalized plan based on your experience and goals.</CardDescription>
                    </CardHeader>
                     <CardContent>
                         <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                            <li>Personalized volume & intensity</li>
                            <li>Adapts to your profile</li>
                            <li>Smart progression</li>
                         </ul>
                    </CardContent>
                </Card>

                {/* User Card */}
                <Card 
                    className="relative overflow-hidden group hover:border-primary/50 transition-all cursor-pointer shadow-soft hover:shadow-primary/10"
                    onClick={() => onSelectMode('user')}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader>
                        <PenTool className="w-10 h-10 text-primary mb-2" />
                        <CardTitle>Build Custom</CardTitle>
                        <CardDescription>Design your own weekly schedule from scratch with full granular control.</CardDescription>
                    </CardHeader>
                     <CardContent>
                         <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                            <li>Custom exercises</li>
                            <li>Flexible split ratios</li>
                            <li>Total control</li>
                         </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

interface TemplateExercise {
  id: string;
  exercise_id: string;
  day_number: number;
  exercise_name: string;
  stage_of_exercises: string;
  sets: number;
  reps: string;
  weight: number | null;
  workout_type: string;
}

interface TemplateDetails extends Template {
  template_exercises: TemplateExercise[];
}

function TemplateSelection({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateDetails | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Initial load of template list
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const res = await api.get("/v1/templates/");
                setTemplates(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchTemplates();
    }, []);

    // Fetch full details when a template is clicked
    const handleTemplateClick = async (templateId: string) => {
        setDetailsLoading(true);
        try {
            const res = await api.get(`/v1/templates/${templateId}`);
            setSelectedTemplate(res.data);
        } catch (err) {
            console.error("Failed to fetch template details", err);
        } finally {
            setDetailsLoading(false);
        }
    }

    const handleConfirmSelection = async () => {
        if (!selectedTemplate) return;
        setSubmitting(true);
        try {
            await api.post(`/v1/workout/temp?template_id=${selectedTemplate.id}`);
            onComplete();
        } catch (err) {
             console.error("Failed to create plan from template", err);
        } finally {
            setSubmitting(false);
        }
    }

    // --- RENDERERS ---

    // 1. Loading State
    if (loading || detailsLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <p className="text-muted-foreground font-medium">Loading...</p>
            </div>
        );
    }

    // 3. Day Detail View
    if (selectedTemplate && selectedDay !== null) {
        const dayExercises = selectedTemplate.template_exercises.filter(ex => ex.day_number === selectedDay);


        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                 <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedDay(null)}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold font-heading">Day {selectedDay}</h2>
                        <p className="text-sm text-muted-foreground">Exercise Breakdown</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {dayExercises.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/20 rounded-3xl border-2 border-dashed border-muted text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                <Moon className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold font-heading italic uppercase">Rest Day</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    No exercises scheduled for this day. Rest and recover to come back stronger.
                                </p>
                            </div>
                        </div>
                    ) : (
                        (() => {
                            const stages = ["warmup", "main", "relax", "recovery"];
                            const matchedIds = new Set<string>();

                            const sections = stages.map(stage => {
                                const stageData = dayExercises.filter((ex, idx) => {
                                    const match = (ex.stage_of_exercises || "").toLowerCase() === stage;
                                    if (match) matchedIds.add(ex.id || ex.exercise_id + idx);
                                    return match;
                                });
                                if (stageData.length === 0) return null;

                                return (
                                    <section key={stage} className="space-y-3">
                                        <h3 className={cn(
                                            "text-xs font-black uppercase tracking-[0.2em] pl-1",
                                            stage === "recovery" ? "text-green-600" : "text-muted-foreground"
                                        )}>
                                            {stage === "recovery" ? "Recovery Phase" : (stage === "relax" ? "Cooldown Phase" : stage)}
                                        </h3>
                                        <div className="grid gap-3">
                                            {stageData.map((ex, idx) => (
                                                <Card
                                                  key={idx}
                                                  className={cn(
                                                      "border-none shadow-sm cursor-pointer hover:bg-primary/5 transition-colors",
                                                      stage === "recovery" ? "bg-green-50/50 border-green-100/50" : "bg-card/50"
                                                  )}
                                                  onClick={() => navigate(`/exercise/${ex.exercise_id}`)}
                                                >
                                                    <CardContent className="p-4 flex items-center justify-between">
                                                        <div>
                                                            <p className={cn("font-bold font-heading", stage === "recovery" ? "text-green-900" : "")}>{ex.exercise_name}</p>
                                                            <p className={cn("text-xs", stage === "recovery" ? "text-green-700" : "text-muted-foreground")}>
                                                                {stage === "recovery" ? `Duration: ${ex.reps}` : `${ex.sets} sets × ${ex.reps} ${ex.weight ? `@ ${ex.weight}kg` : ""}`}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </section>
                                );
                            });

                            const otherExs = dayExercises.filter(ex => !matchedIds.has(ex.id || ex.exercise_id));
                            if (otherExs.length > 0) {
                                sections.push(
                                    <section key="other" className="space-y-3">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">General</h3>
                                        <div className="grid gap-3">
                                            {otherExs.map((ex, idx) => (
                                                <Card
                                                  key={idx}
                                                  className="bg-card/50 border-none shadow-sm cursor-pointer hover:bg-primary/5 transition-colors"
                                                  onClick={() => navigate(`/exercise/${ex.exercise_id}`)}
                                                >
                                                    <CardContent className="p-4 flex items-center justify-between">
                                                        <div>
                                                            <p className="font-bold font-heading">{ex.exercise_name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {ex.sets} sets × {ex.reps} {ex.weight ? `@ ${ex.weight}kg` : ""}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </section>
                                );
                            }

                            return sections;
                        })()
                    )}
                </div>
            </div>
        )
    }

    // 2. Weekly Overview (Template Preview)
    if (selectedTemplate) {
        // Group days
        // Assuming days are 1-based index up to duration_weeks * 7? Or just a weekly cycle?
        // Based on user prompt: "Display days of the week (Monday-Sunday)". 
        // We probably just have day_number 1-7 for a template cycle.
        const days = Array.from(new Set(selectedTemplate.template_exercises.map(ex => ex.day_number))).sort((a,b) => a-b);
        
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                 <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold font-heading">{selectedTemplate.name}</h2>
                        <p className="text-sm text-muted-foreground">Weekly Schedule Preview</p>
                    </div>
                </div>

                <div className="grid gap-4 grid-cols-1">
                   {days.map(dayNum => {
                        const dayExs = selectedTemplate.template_exercises.filter(e => e.day_number === dayNum);
                        const isRecovery = dayExs.some(e => e.stage_of_exercises?.toLowerCase() === 'recovery');
                        const isRest = dayExs.length === 0;

                        return (
                            <Card 
                                key={dayNum}
                                className={cn(
                                    "cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden",
                                    isRest ? "bg-muted/30 opacity-70" : isRecovery ? "bg-green-50/50 border-green-100" : "bg-card"
                                )}
                                onClick={() => setSelectedDay(dayNum)}
                            >
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm font-black font-heading uppercase tracking-tighter flex justify-between items-center">
                                        Day {dayNum}
                                        {isRecovery && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 text-[8px] px-1.5 h-4 uppercase font-black tracking-widest leading-none border-none">
                                                Recovery
                                            </Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                        {isRest ? "Rest Day" : `${dayExs.length} Exercises`}
                                    </p>
                                    <div className="mt-2 flex justify-end">
                                        <ArrowRight className="w-3 h-3 text-muted-foreground transition-transform group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className="pt-6 border-t border-border mt-8">
                    <Button size="lg" className="w-full text-lg shadow-xl shadow-primary/20 rounded-[1.5rem] h-14 font-black uppercase tracking-widest italic" onClick={handleConfirmSelection} disabled={submitting}>
                         {submitting ? "Setting up Plan..." : "Activate This Plan"}
                    </Button>
                </div>
            </div>
        )
    }

    // 1. Template List (Initial View)
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-2xl font-bold font-heading">Select a Template</h2>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map(t => (
                    <Card 
                        key={t.id} 
                        className="flex flex-col group hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => handleTemplateClick(t.id)}
                    >
                        <CardHeader>
                             <div className="flex justify-between items-start">
                                <Badge variant="secondary" className="group-hover:bg-primary/10 group-hover:text-primary transition-colors">{t.difficulty_level}</Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {t.duration_weeks}w
                                </span>
                             </div>
                            <CardTitle className="mt-2">{t.name}</CardTitle>
                            <CardDescription className="line-clamp-2">{t.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto pt-0 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View Schedule →
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function CompletedWorkoutView() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
                <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white shadow-xl">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
            </div>
            <div className="space-y-3">
                <h1 className="text-4xl font-black font-heading tracking-tight italic uppercase italic">Workout Done!</h1>
                <p className="text-muted-foreground max-w-xs mx-auto font-medium">
                    You've already crushed your workout for today. Great job on the consistency!
                </p>
            </div>
            <Card className="bg-surface/50 border-none max-w-xs w-full">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold">Next Session</p>
                        <p className="text-sm text-muted-foreground">Available tomorrow</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function NoActivePlanView() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Dumbbell className="w-10 h-10" />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-black font-heading tracking-tight">No Active Plan</h1>
                <p className="text-muted-foreground max-w-xs mx-auto">
                    You don't have an active training plan at the moment.
                </p>
            </div>
            <Button 
                size="lg" 
                className="rounded-full px-8 shadow-xl shadow-primary/20 font-bold"
                onClick={() => navigate("/profile")}
            >
                Browse & Activate Plans
            </Button>
        </div>
    );
}

function MLFlow({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) {
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await api.post("/v1/workout/generate");
            onComplete();
        } catch (err) {
            console.error("Failed to generate plan", err);
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-8 py-4 px-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="text-left">
                    <h2 className="text-2xl font-black font-heading uppercase italic">AI Workout Generator</h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Personalized Automation</p>
                </div>
            </div>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto block mb-2">
                <Sparkles className="w-8 h-8" />
            </div>
           
             <Card className="text-left bg-surface/50">
                <CardContent className="p-6 space-y-4">
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Personalized Split (Push/Pull/Legs etc.)</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Optimized Volume & Intensity</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium">Auto-Progressive Overload</span>
                     </div>
                </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
                 <Button variant="outline" onClick={onBack} disabled={generating}>Cancel</Button>
                 <Button onClick={handleGenerate} disabled={generating} className="min-w-[140px]">
                    {generating ? "Generating..." : "Generate My Plan"}
                 </Button>
            </div>
        </div>
    )
}




function InactivePlanList({ plans, onActivate, onManage }: { plans: WorkoutPlan[], onActivate: (id: string) => void, onManage: () => void }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 py-10 text-center">
             <div className="space-y-2">
                 <h1 className="text-3xl font-black font-heading tracking-tight">Your Fitness Plans</h1>
                 <p className="text-muted-foreground max-w-md mx-auto">
                     You have created plans but none are currently active. Activate one to start your workout for today!
                 </p>
             </div>

             <div className="grid gap-4 max-w-2xl mx-auto">
                 {plans.map(plan => (
                     <div key={plan.id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all text-left">
                         <div>
                             <h3 className="font-bold font-heading text-lg">{plan.name}</h3>
                             <p className="text-sm text-muted-foreground">Created {new Date().toLocaleDateString()}</p>
                         </div>
                         <Button onClick={() => onActivate(plan.id)}>
                             Activate Plan <ArrowRight className="w-4 h-4 ml-2" />
                         </Button>
                     </div>
                 ))}
             </div>

             <div className="pt-8 border-t max-w-lg mx-auto">
                 <p className="text-sm text-muted-foreground mb-4">Want to start fresh?</p>
                 <Button variant="outline" onClick={onManage}>Create New Plan</Button>
             </div>
        </div>
    )
}



// --- Main Component ---
export function TrainingTab() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
   const [plan, setPlan] = useState<WorkoutPlan | null>(null);
   const [allPlans] = useState<WorkoutPlan[]>([]);
   const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  
   // Views: 'loading' | 'active' | 'completed' | 'inactive_list' | 'hub' | 'template' | 'ml' | 'user' | 'details' | 'session' | 'none'
   const [view, setView] = useState<'loading' | 'active' | 'completed' | 'inactive_list' | 'hub' | 'template' | 'ml' | 'user' | 'details' | 'session' | 'none'>('loading');
   const [autoStartSession, setAutoStartSession] = useState(false);

  const fetchData = useCallback(async () => {
      setLoading(true);
      const mode = searchParams.get('mode');

      if (mode === 'create') {
          setView('hub');
          setLoading(false);
          return;
      }

      if (mode === 'user') {
          setView('user');
          setLoading(false);
          return;
      }

      const planId = searchParams.get('planId');
      if (planId) {
          setView('details');
          setLoading(false);
          return;
      }

      try {
        const planRes = await api.get("/v1/workout/active");
        if (planRes.data && planRes.data.id) {
             setPlan(planRes.data);
             try {
                const sessionRes = await api.get("/v1/session/active");
                if (sessionRes.data && !Array.isArray(sessionRes.data) && sessionRes.data.status === 'completed') {
                    setView('completed');
                    setExercises([]);
                } else {
                    setExercises(sessionRes.data);
                    setView('active');
                }
             } catch {
                 setExercises([]);
                 setView('active');
             }
        } else {
             setPlan(null);
             setView('none');
        }
      } catch {
         setView('none');
      } finally {
        setLoading(false);
      }
  }, [searchParams]);

  const handleActivatePlan = async (id: string) => {
      setLoading(true);
      try {
          await api.post(`/v1/workout/${id}/activate`);
          // Clear params to return to active view default
          setSearchParams({});
          await fetchData();
      } catch (err) {
          console.error("Failed to activate plan", err);
          setLoading(false);
      }
  };

   const clearParamsAndRefresh = () => {
       setSearchParams({});
       // Small timeout to allow processing
       setTimeout(() => fetchData(), 50);
   }

   const completeAndGoToProfile = () => {
       setSearchParams({});
       navigate("/profile");
   }

  useEffect(() => {
    fetchData();

    const handleStartSession = (e: Event) => {
      const customEvent = e as CustomEvent;
      setAutoStartSession(!!customEvent.detail?.autoStart);
      setView('session');
    };
    window.addEventListener('start-workout-session', handleStartSession);
    return () => window.removeEventListener('start-workout-session', handleStartSession);
  }, [searchParams, fetchData]); // Added fetchData to dependencies

  if (loading) {
     return (
        <div className="p-6 space-y-6">
            <Skeleton className="h-40 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
     )
  }

  // Render Logic
  return (
    <div className="p-0">
        {view === 'active' && plan && <ActiveWorkoutView plan={plan} exercises={exercises} />}
        {view === 'completed' && <CompletedWorkoutView />}
        {view === 'none' && <NoActivePlanView />}
        {view === 'session' && (
            <WorkoutSessionFlow 
                onBack={() => {
                    setView('active' );
                    setAutoStartSession(false);
                }} 
                initialExercises={exercises} 
                autoStart={autoStartSession}
            />
        )}
        {view === 'inactive_list' && <InactivePlanList plans={allPlans} onActivate={handleActivatePlan} onManage={() => { setSearchParams({mode: 'create'}) }} />}
        {view === 'hub' && <CreationHub onSelectMode={(mode) => setView(mode)} />}
        {view === 'template' && <TemplateSelection onBack={() => { clearParamsAndRefresh(); }} onComplete={clearParamsAndRefresh} />}
        {view === 'ml' && <MLFlow onBack={() => { clearParamsAndRefresh(); }} onComplete={clearParamsAndRefresh} />}
        {view === 'user' && <CustomWorkoutBuilder editId={searchParams.get('editId') || undefined} onBack={completeAndGoToProfile} onComplete={completeAndGoToProfile} />}
        {view === 'details' && <PlanDetails planId={searchParams.get('planId') || undefined} onBack={() => navigate("/profile")} />}
    </div>
  );
}
