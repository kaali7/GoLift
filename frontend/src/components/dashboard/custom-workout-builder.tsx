import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronLeft, Plus, Check, Dumbbell, X, Eye, Moon, Activity, CheckCircle2, Search } from "lucide-react";

// Internal Builder State
interface BuilderState {
  step: number;
  metadata: {
    name: string;
    description: string;
    goal: string;
    difficulty: string;
    duration_weeks: number;
  };
  weekly_split: {
    [day: number]: {
      type: "workout" | "recovery" | "rest";
      name: string; // e.g. "Push Day", "Active Recovery"
    };
  };
  exercises: {
    [day: number]: Array<{
      temp_id: string; // specialized ID for UI handling before submission
      exercise_id: string;
      name: string;
      sets: number;
      reps: string;
      weight?: number;
      rest_seconds: number;
      stage: string;
    }>;
  };
}

const INITIAL_STATE: BuilderState = {
  step: 1,
  metadata: {
    name: "",
    description: "",
    goal: "General Fitness",
    difficulty: "Intermediate",
    duration_weeks: 4
  },
  weekly_split: {
    1: { type: "workout", name: "Day 1" },
    2: { type: "workout", name: "Day 2" },
    3: { type: "workout", name: "Day 3" },
    4: { type: "recovery", name: "Recovery" },
    5: { type: "workout", name: "Day 5" },
    6: { type: "workout", name: "Day 6" },
    7: { type: "rest", name: "Rest" }, // Rest means no exercises
  },
  exercises: {}
};

export function CustomWorkoutBuilder({ editId, onBack, onComplete }: { editId?: string, onBack: () => void, onComplete: () => void }) {
  const [state, setState] = useState<BuilderState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [createdPlanId, setCreatedPlanId] = useState<string | null>(null);
  const [editedSuccess, setEditedSuccess] = useState(false);
  const [exercisesList, setExercisesList] = useState<any[]>([]);

  // Fetch exercises on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await api.get("/v1/exercise/all");
        setExercisesList(res.data);
      } catch (err) {
        console.error("Failed to fetch exercises", err);
      }
    };
    fetchExercises();
  }, []);

  // --- Step 3: Day Editor State ---
  // Now includes all days to support "Rest Day" view in Step 3
  const allDays = [1,2,3,4,5,6,7].map(day => ({ day, ...state.weekly_split[day] }));

   const [selectedDayId, setSelectedDayId] = useState<number>(1);
   const [showSelector, setShowSelector] = useState(false);
   const [selectorStage, setSelectorStage] = useState<string>("main");
   const [searchTerm, setSearchTerm] = useState("");

  // Sync selectedDayId when split changes
  useEffect(() => {
    if (!allDays.some(d => d.day === selectedDayId)) {
        setSelectedDayId(1);
    }
  }, [state.weekly_split]);

  useEffect(() => {
    if (editId) {
      const fetchPlan = async () => {
        try {
          const res = await api.get(`/v1/workout/${editId}`);
          const plan = res.data;
          
          // Map exercises to groups by day
          const dayExercises: {[day: number]: any[]} = {};
          const split: {[day: number]: any} = { ...INITIAL_STATE.weekly_split };

          if (plan.template_exercises) {
            plan.template_exercises.forEach((ex: any) => {
              const day = ex.day_number;
              if (!dayExercises[day]) dayExercises[day] = [];
              dayExercises[day].push({
                temp_id: Math.random().toString(36).substr(2, 9),
                exercise_id: ex.exercise_id,
                name: ex.exercise_name,
                sets: ex.sets,
                reps: ex.reps,
                weight: ex.weight || 0,
                rest_seconds: ex.rest_seconds || 60,
                stage: ex.stage_of_exercises?.toLowerCase() || "main"
              });

              // Update split type if not already set or if it's a workout
              if (ex.stage_of_exercises?.toLowerCase() === 'recovery') {
                split[day] = { type: "recovery", name: `Day ${day}` };
              } else if (ex.stage_of_exercises?.toLowerCase() !== 'rest') {
                split[day] = { type: "workout", name: `Day ${day}` };
              }
            });
          }

          setState({
            step: 1,
            metadata: {
              name: plan.name,
              description: plan.description || "",
              goal: "General Fitness", // TODO: Get from plan if available
              difficulty: "Intermediate", // TODO: Get from plan if available
              duration_weeks: 4
            },
            weekly_split: split,
            exercises: dayExercises
          });
        } catch (err) {
          console.error("Failed to fetch plan for edit", err);
        } finally {
          setLoading(false);
        }
      };
      fetchPlan();
    }
  }, [editId]);

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-pulse">
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-muted-foreground font-medium">Loading plan details...</p>
          </div>
      );
  }

  // --- Step Components ---

  const renderStep1_Metadata = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Plan Name</label>
          <Input 
            value={state.metadata.name} 
            onChange={(e) => {
              const val = e.target.value;
              setState(s => ({ ...s, metadata: { ...s.metadata, name: val } }));
            }}
            placeholder="e.g. Summer Shred 2024"
            className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
          />
        </div>
        <div className="space-y-2">
           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Description</label>
           <Textarea 
             value={state.metadata.description} 
             onChange={(e) => {
               const val = e.target.value;
               setState(s => ({ ...s, metadata: { ...s.metadata, description: val } }));
             }}
             placeholder="Briefly describe the goal..."
             className="rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-base font-medium min-h-[100px] py-4"
           />
        </div>
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Duration (Weeks)</label>
                <Input 
                    type="number"
                    min={1}
                    max={12}
                    className="h-14 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold"
                    value={state.metadata.duration_weeks} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setState(s => ({ ...s, metadata: { ...s.metadata, duration_weeks: val } }));
                    }}
                />
            </div>
            <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground pl-1">Difficulty</label>
                 <select 
                    className="w-full h-14 px-4 rounded-2xl border-none bg-muted/50 focus:bg-muted transition-colors text-lg font-bold appearance-none cursor-pointer"
                    value={state.metadata.difficulty}
                    onChange={(e) => {
                      const val = e.target.value;
                      setState(s => ({ ...s, metadata: { ...s.metadata, difficulty: val } }));
                    }}
                 >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                 </select>
            </div>
        </div>
      </div>
    </div>
  );

  const renderStep2_Split = () => (
     <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        <p className="text-sm text-muted-foreground">Define your weekly schedule. Toggle between Workout, Recovery, and Rest.</p>
        <div className="grid gap-3">
            {[1,2,3,4,5,6,7].map(day => {
                const dayConfig = state.weekly_split[day];
                const dayLabel = day === 1 ? 'Mon' : day === 2 ? 'Tue' : day === 3 ? 'Wed' : day === 4 ? 'Thu' : day === 5 ? 'Fri' : day === 6 ? 'Sat' : 'Sun';
                return (
                    <Card key={day} className="flex items-center p-2 sm:p-3 gap-2 sm:gap-4 border-none bg-muted/20 hover:bg-muted/40 transition-colors rounded-2xl">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-sm sm:text-base text-primary shrink-0">
                            {day}
                        </div>
                        <div className="flex-1 min-w-0">
                             <p className="font-black font-heading text-sm sm:text-lg uppercase italic leading-none">{dayLabel}</p>
                             <p className="text-[10px] text-muted-foreground uppercase tracking-tighter leading-none mt-1 truncate">Activity</p>
                        </div>
                        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl shrink-0">
                             <button
                                onClick={() => setState(s => ({...s, weekly_split: {...s.weekly_split, [day]: {...dayConfig, type: "workout"}}}))}
                                className={cn(
                                    "px-2 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase italic transition-all",
                                    dayConfig.type === 'workout' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
                                )}
                             >
                                Workout
                             </button>
                             <button
                                onClick={() => setState(s => ({...s, weekly_split: {...s.weekly_split, [day]: {...dayConfig, type: "recovery"}}}))}
                                className={cn(
                                    "px-2 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase italic transition-all",
                                    dayConfig.type === 'recovery' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-muted-foreground hover:text-foreground'
                                )}
                             >
                                Recov
                             </button>
                             <button
                                onClick={() => setState(s => ({...s, weekly_split: {...s.weekly_split, [day]: {...dayConfig, type: "rest"}}}))}
                                className={cn(
                                    "px-2 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase italic transition-all",
                                    dayConfig.type === 'rest' ? 'bg-zinc-500 text-white shadow-lg shadow-zinc-500/20' : 'text-muted-foreground hover:text-foreground'
                                )}
                             >
                                Rest
                             </button>
                        </div>
                    </Card>
                )
            })}
        </div>
     </div>
  );

  const renderStep3_DayEditor = () => {
      const activeDayConf = state.weekly_split[selectedDayId];
      
      // Current Day's Exercises
      const currentExercises = state.exercises[selectedDayId] || [];

      const handleAddExercise = (exercise: any) => {
          setState(s => {
              const dayExs = s.exercises[selectedDayId] || [];
              return {
                  ...s,
                  exercises: {
                      ...s.exercises,
                      [selectedDayId]: [
                          ...dayExs,
                          {
                              temp_id: Math.random().toString(36).substr(2, 9),
                              exercise_id: exercise.id,
                              name: exercise.name,
                              sets: 3,
                              reps: "10",
                              weight: 0,
                              rest_seconds: 60,
                              stage: selectorStage
                          }
                      ]
                  }
              }
          });
          setShowSelector(false);
      };

      const handleRemoveExercise = (temp_id: string) => {
          setState(s => ({
              ...s,
              exercises: {
                  ...s.exercises,
                  [selectedDayId]: s.exercises[selectedDayId].filter(e => e.temp_id !== temp_id)
              }
          }));
      };

      const updateExercise = (temp_id: string, field: string, value: any) => {
          setState(s => ({
              ...s,
              exercises: {
                  ...s.exercises,
                  [selectedDayId]: (s.exercises[selectedDayId] || []).map(e => 
                      e.temp_id === temp_id ? { ...e, [field]: value } : e
                  )
              }
          }));
      };

      // Mock Exercises for Selector (Using real UUIDs to pass backend validation)
      // Filter out exercises that are already added to this day
      const availableExercises = exercisesList.filter(ex => 
        !currentExercises.some(ce => ce.exercise_id === ex.id)
      );

      return (
          <div className="flex flex-col lg:flex-row gap-4 min-h-[500px] animate-in fade-in slide-in-from-right-4 relative">
              {/* Sidebar: Day List - Horizontal on Mobile, Vertical on Desktop */}
              <div className="lg:w-1/4 grid grid-cols-7 lg:flex lg:flex-col lg:border-r lg:pr-2 gap-1 lg:gap-2 pb-2 lg:pb-0">
                  {allDays.map(d => (
                      <button
                        key={d.day}
                        onClick={() => setSelectedDayId(d.day)}
                        className={cn(
                            "flex items-center justify-center lg:justify-between px-1 lg:px-5 py-2 lg:py-4 rounded-xl lg:rounded-[1.5rem] transition-all duration-300 border-[1.5px] lg:border-2 whitespace-nowrap",
                            selectedDayId === d.day 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/30" 
                            : "bg-muted/30 hover:bg-muted/50 border-transparent text-muted-foreground"
                        )}
                      >
                          <div className="flex flex-col lg:flex-row items-center gap-0.5 lg:gap-2">
                              <span className="font-black font-heading text-[10px] lg:text-lg uppercase tracking-tighter leading-none">{d.day}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                {d.type === 'recovery' && <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", selectedDayId === d.day ? "bg-white" : "bg-green-500")} />}
                                {d.type === 'rest' && <div className={cn("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", selectedDayId === d.day ? "bg-white/50" : "bg-amber-400")} />}
                              </div>
                          </div>
                      </button>
                  ))}
              </div>

              {/* Main: Content Editor */}
              <div className="flex-1 overflow-y-auto pr-1 lg:pl-2 custom-scrollbar">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-black font-heading tracking-tight uppercase italic">Day {selectedDayId}</h3>
                      <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          {activeDayConf.type === 'workout' ? <Dumbbell className="w-4 h-4 text-primary" /> : activeDayConf.type === 'recovery' ? <Activity className="w-4 h-4 text-green-500" /> : <Moon className="w-4 h-4 text-amber-500" />}
                          {activeDayConf.type} Mode
                      </div>
                  </div>

                  {activeDayConf.type === 'rest' ? (
                       <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                           <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                               <Moon className="w-8 h-8" />
                           </div>
                           <div className="space-y-1">
                               <h4 className="text-xl font-bold font-heading">Rest Day</h4>
                               <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                   There is a rest day so no exercise today. Keep rest your body to recover and grow stronger.
                               </p>
                           </div>
                           <Badge variant="secondary" className="px-4 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest">Active Recovery Encouraged</Badge>
                       </div>
                  ) : activeDayConf.type === 'workout' ? (
                       // WORKOUT MODE: Warmup / Main / Relax
                       ['warmup', 'main', 'relax'].map(stage => (
                           <div key={stage} className="mb-6">
                               <div className="flex items-center justify-between mb-2">
                                   <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                       {stage === 'relax' ? "Cooldown" : stage}
                                       <span className="bg-muted px-1.5 rounded-full text-[10px]">
                                           {currentExercises.filter(e => e.stage === stage).length}
                                       </span>
                                   </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-6 text-xs"
                                      onClick={() => { setSelectorStage(stage); setShowSelector(true); }}
                                    >
                                        <Plus className="w-3 h-3 mr-1" /> Add
                                    </Button>
                               </div>
                               
                                <div className="grid gap-4">
                                   {currentExercises.filter(e => e.stage === stage).map(ex => (
                                       <div key={ex.temp_id} className="group bg-card border-none bg-muted/20 rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden transition-all hover:bg-muted/30">
                                            <div className="flex justify-between items-start">
                                                <div className="font-black font-heading text-base sm:text-xl uppercase italic leading-tight flex-1 pr-8">
                                                    {ex.name}
                                                </div>
                                                <Button 
                                                   variant="ghost" 
                                                   size="icon" 
                                                   className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0" 
                                                   onClick={() => handleRemoveExercise(ex.temp_id)}
                                                 >
                                                     <X className="w-4 h-4" />
                                                 </Button>
                                            </div>
                                            
                                            {/* Config Grid */}
                                            <div className="grid grid-cols-4 gap-2 bg-card/50 p-2 rounded-xl border border-border/50 overflow-x-auto">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Sets</span>
                                                    <Input className="h-8 px-1 text-center font-bold border-none bg-muted/50 rounded-lg focus:ring-1 focus:ring-primary/20 text-xs w-full" value={ex.sets} onChange={(e) => updateExercise(ex.temp_id, 'sets', parseInt(e.target.value) || 0)} />
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Reps</span>
                                                     <Input className="h-8 px-1 text-center font-bold border-none bg-muted/50 rounded-lg focus:ring-1 focus:ring-primary/20 text-xs w-full" value={ex.reps} onChange={(e) => updateExercise(ex.temp_id, 'reps', e.target.value)} />
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Kg</span>
                                                     <Input className="h-8 px-1 text-center font-bold border-none bg-muted/50 rounded-lg focus:ring-1 focus:ring-primary/20 text-xs w-full" value={ex.weight} onChange={(e) => updateExercise(ex.temp_id, 'weight', parseInt(e.target.value) || 0)} />
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">Rest</span>
                                                     <Input className="h-8 px-1 text-center font-bold border-none bg-muted/50 rounded-lg focus:ring-1 focus:ring-primary/20 text-xs w-full" value={ex.rest_seconds} placeholder="60" onChange={(e) => updateExercise(ex.temp_id, 'rest_seconds', parseInt(e.target.value) || 0)} />
                                                </div>
                                            </div>
                                       </div>
                                   ))}
                                   {currentExercises.filter(e => e.stage === stage).length === 0 && (
                                       <div className="border border-dashed rounded-xl p-4 text-center text-xs text-muted-foreground/50">
                                           No exercises
                                       </div>
                                   )}
                               </div>
                           </div>
                       ))
                  ) : (
                      // RECOVERY MODE: Single list
                       <div>
                           <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs font-bold uppercase tracking-wider text-green-600 flex items-center gap-2">
                                        Recovery Activities
                                    </div>
                                     <Button 
                                       variant="ghost" 
                                       size="sm" 
                                       className="h-6 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                                       onClick={() => { setSelectorStage("recovery"); setShowSelector(true); }}
                                     >
                                         <Plus className="w-3 h-3 mr-1" /> Add Activity
                                     </Button>
                                </div>
                                <div className="space-y-2">
                                    {currentExercises.filter(e => e.stage === 'recovery').map(ex => (
                                        <div key={ex.temp_id} className="group bg-green-50/50 border border-green-100 rounded-xl p-3 flex gap-4 items-center relative hover:shadow-sm transition-all">
                                             <div className="font-bold flex-1 text-green-900 font-heading uppercase text-sm">
                                                 {ex.name}
                                             </div>
                                             
                                             {/* Recovery Config Inputs */}
                                             <div className="grid grid-cols-4 gap-2 bg-white/30 p-2 rounded-xl border border-green-100/50 w-full sm:w-auto">
                                                 <div className="flex flex-col items-center">
                                                     <span className="text-[8px] text-green-700/60 font-black uppercase italic tracking-tighter">Sets</span>
                                                     <Input className="h-7 px-1 text-center bg-white/50 border-green-100 text-xs w-full" value={ex.sets} onChange={(e) => updateExercise(ex.temp_id, 'sets', parseInt(e.target.value) || 0)} />
                                                 </div>
                                                 <div className="flex flex-col items-center">
                                                     <span className="text-[8px] text-green-700/60 font-black uppercase italic tracking-tighter">Reps</span>
                                                      <Input className="h-7 px-1 text-center bg-white/50 border-green-100 text-xs w-full" value={ex.reps} onChange={(e) => updateExercise(ex.temp_id, 'reps', e.target.value)} />
                                                 </div>
                                                 <div className="flex flex-col items-center">
                                                     <span className="text-[8px] text-green-700/60 font-black uppercase italic tracking-tighter">Kg</span>
                                                      <Input className="h-7 px-1 text-center bg-white/50 border-green-100 text-xs w-full" value={ex.weight} onChange={(e) => updateExercise(ex.temp_id, 'weight', parseInt(e.target.value) || 0)} />
                                                 </div>
                                                 <div className="flex flex-col items-center">
                                                     <span className="text-[8px] text-green-700/60 font-black uppercase italic tracking-tighter">Rest</span>
                                                      <Input className="h-7 px-1 text-center bg-white/50 border-green-100 text-xs w-full" value={ex.rest_seconds} placeholder="60" onChange={(e) => updateExercise(ex.temp_id, 'rest_seconds', parseInt(e.target.value) || 0)} />
                                                 </div>
                                             </div>

                                             <Button variant="ghost" size="icon" className="h-6 w-6 text-green-700/50 hover:text-red-500 absolute -right-2 -top-2 bg-white border border-green-100 shadow-sm rounded-full" onClick={() => handleRemoveExercise(ex.temp_id)}>
                                                 <X className="w-3 h-3" />
                                             </Button>
                                        </div>
                                    ))}
                                </div>
                       </div>
                  )}
              </div>

               {/* Selector Modal (Inline Absolute) */}
              {showSelector && (
                  <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4">
                      <Card className="w-full max-w-md h-full flex flex-col shadow-2xl border-none bg-card ring-1 ring-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
                          <CardHeader className="py-4 px-6 border-b border-border/50 sticky top-0 bg-card z-10 space-y-4">
                              <div className="flex items-center justify-between">
                                  <CardTitle className="text-xl font-black font-heading uppercase italic">Select Exercise</CardTitle>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={() => { setShowSelector(false); setSearchTerm(""); }}>
                                      <X className="w-5 h-5" />
                                  </Button>
                              </div>
                              <div className="relative group">
                                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                                      <Search className="w-4 h-4" />
                                  </div>
                                  <Input 
                                    className="pl-10 h-11 bg-muted/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 font-medium text-sm" 
                                    placeholder="Search exercises..." 
                                    value={searchTerm}
                                    autoFocus
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                  />
                                  {searchTerm && (
                                      <button 
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        onClick={() => setSearchTerm("")}
                                      >
                                          <X className="w-3.5 h-3.5" />
                                      </button>
                                  )}
                              </div>
                         </CardHeader>
                           <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
                               {availableExercises
                                .filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(ex => (
                                   <div key={ex.id} className="group p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-all border border-transparent hover:border-primary/20">
                                       <div className="flex justify-between items-center">
                                           <div className="min-w-0 pr-4">
                                               <div className="font-black font-heading uppercase italic text-sm sm:text-base leading-tight truncate">{ex.name}</div>
                                               <div className="text-[10px] text-primary/70 uppercase font-black tracking-widest mt-0.5">{ex.muscle_group}</div>
                                           </div>
                                           <div className="flex gap-2">
                                               <Button 
                                                 variant="ghost" 
                                                 size="icon" 
                                                 className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                                                 onClick={() => window.open(`/exercise/${ex.id}`, '_blank')}
                                               >
                                                   <Eye className="w-4 h-4" />
                                               </Button>
                                               <Button 
                                                 variant="ghost" 
                                                 size="icon" 
                                                 className="h-9 w-9 rounded-xl text-white bg-primary shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
                                                 onClick={() => handleAddExercise(ex)}
                                               >
                                                   <Plus className="w-5 h-5" />
                                               </Button>
                                           </div>
                                       </div>
                                   </div>
                               ))}
                               {availableExercises.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                                   <div className="py-12 text-center space-y-2 opacity-50">
                                       <Dumbbell className="w-12 h-12 mx-auto" />
                                       <p className="font-bold">No exercises found</p>
                                   </div>
                               )}
                           </div>
                      </Card>
                  </div>
              )}
          </div>
      )
  }

  const renderStep4_Review = () => {
      const activeDays = Object.values(state.weekly_split).filter(d => d.type !== 'rest').length;
      const totalExercises = Object.values(state.exercises).reduce((acc, list) => acc + list.length, 0);

      const handleSubmit = async () => {
          setSubmitting(true);
          try {
              // Construct Payload
              const exercisesPayload: Array<{
                  exercise_name: string;
                  exercise_id: string;
                  day_number: number;
                  stage_of_exercises: string;
                  sequence_order: number;
                  sets: number;
                  reps: string;
                  weight: number | null;
                  rest_seconds: number;
                  workout_type: string;
                  notes: string;
              }> = [];
              Object.entries(state.exercises).forEach(([dayStr, dayExs]) => {
                  const dayNum = parseInt(dayStr);
                  const dayConf = state.weekly_split[dayNum];
                  
                  dayExs.forEach((ex, idx) => {
                      exercisesPayload.push({
                           exercise_name: ex.name,
                           exercise_id: ex.exercise_id,
                           day_number: dayNum,
                           stage_of_exercises: ex.stage || "main",
                           sequence_order: idx + 1,
                           sets: ex.sets || 0,
                           reps: String(ex.reps || "0"),
                           weight: typeof ex.weight === 'number' ? ex.weight : 0,
                           rest_seconds: ex.rest_seconds || 0,
                           workout_type: state.metadata.goal || "General",
                           notes: `${dayConf.type} - ${dayConf.name}`,

                      });
                  });
              });

              const payload = {
                  name: state.metadata.name,
                  description: state.metadata.description,
                  difficulty_level: state.metadata.difficulty,
                  estimated_duration_minutes: 60, // Estimate
                  target_muscle_groups: ["Full Body"], // Placeholder
                  workout_type: state.metadata.goal,
                  exercises: exercisesPayload
              };

              console.log("Submitting Payload", payload);
              if (editId) {
                // Update specific workout plan metadata
                await api.put(`/v1/workout/${editId}`, {
                    name: payload.name,
                    description: payload.description,
                    difficulty_level: payload.difficulty_level,
                    workout_type: payload.workout_type
                });
                // Update exercises list
                await api.patch(`/v1/workout/${editId}/exercise`, payload.exercises);
                setEditedSuccess(true);
              } else {
                const res = await api.post("/v1/workout/user", payload);
                if (res.data && res.data.id) {
                     setCreatedPlanId(res.data.id);
                } else {
                     onComplete();
                }
              }
              
              // Success
              setSubmitting(false);

          } catch (err: any) {
              setSubmitting(false);
              console.error("Failed to submit custom plan", err);
              
              let errorMessage = "Failed to create workout plan. Please check your inputs.";
              if (err.response?.data?.detail) {
                  errorMessage = typeof err.response.data.detail === 'string' 
                    ? err.response.data.detail 
                    : JSON.stringify(err.response.data.detail, null, 2);
              }
              alert(errorMessage);
          } finally {
              setSubmitting(false);
          }
      }

      return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center py-6">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold font-heading">Ready to Launch?</h2>
              <p className="text-muted-foreground max-w-sm mx-auto">
                  You are about to create "<strong>{state.metadata.name}</strong>". 
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto my-8">
                  <Card className="text-center p-4">
                      <div className="text-2xl font-bold text-primary">{activeDays}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Workout Days</div>
                  </Card>
                  <Card className="text-center p-4">
                      <div className="text-2xl font-bold text-primary">{totalExercises}</div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Exercises</div>
                  </Card>
              </div>

               <Button size="lg" className="w-full max-w-md shadow-xl shadow-primary/20" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Creating Plan..." : "Confirm & Create Plan"}
               </Button>
          </div>
      )
  }

   const renderEditSuccess = () => (
       <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
           <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
               <CheckCircle2 className="w-12 h-12" />
           </div>
           <div className="space-y-2">
               <h2 className="text-3xl font-black font-heading tracking-tight">Plan Updated!</h2>
               <p className="text-muted-foreground max-w-sm mx-auto">
                   Your changes to "<strong>{state.metadata.name}</strong>" have been successfully saved.
               </p>
           </div>
           <Button size="lg" className="w-full max-w-xs shadow-lg shadow-primary/20" onClick={onComplete}>
               Go to Profile
           </Button>
       </div>
   );

   const renderActivationPrompt = () => {
       const handleActivate = async () => {
           setSubmitting(true);
           try {
               if (createdPlanId) {
                 await api.post(`/v1/workout/${createdPlanId}/activate`);
               }
               onComplete();
           } catch (err) {
               console.error("Failed to activate plan", err);
               onComplete();
           } finally {
               setSubmitting(false);
           }
       };

       return (
           <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
               <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                   <CheckCircle2 className="w-12 h-12" />
               </div>
               <div className="space-y-2">
                   <h2 className="text-3xl font-black font-heading tracking-tight">Workout Plan Created!</h2>
                   <p className="text-muted-foreground max-w-sm mx-auto">
                       Your custom plan "<strong>{state.metadata.name}</strong>" is ready.
                       Would you like to activate it now?
                   </p>
               </div>
               <div className="flex flex-col gap-3 w-full max-w-xs">
                   <Button size="lg" className="w-full shadow-lg shadow-primary/20" onClick={handleActivate} disabled={submitting}>
                       {submitting ? "Activating..." : "Yes, Activate Now"}
                   </Button>
                   <Button variant="ghost" className="w-full" onClick={onComplete} disabled={submitting}>
                       No, I'll do it later
                   </Button>
               </div>
           </div>
       );
   };

   // --- Main Render ---

   return (
     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 py-4 max-w-4xl mx-auto relative min-h-[500px] px-4">
         {/* Header / Progress Section with Back Button */}
         {!createdPlanId && !editedSuccess && (
         <div className="flex items-center gap-4 mb-6">
             <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-muted"
                onClick={state.step === 1 ? onBack : () => setState(s => ({...s, step: s.step - 1}))}
             >
                 <ChevronLeft className="w-5 h-5" />
             </Button>
             <div className="text-left flex-1">
                 <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tighter uppercase italic leading-none">
                     {state.step === 1 && "Plan Metadata"}
                     {state.step === 2 && "Weekly Schedule"}
                     {state.step === 3 && "Routine Builder"}
                     {state.step === 4 && "Review & Save"}
                 </h2>
                 <div className="flex gap-1.5 mt-2">
                     {[1, 2, 3, 4].map((i) => (
                         <div 
                             key={i} 
                             className={cn(
                                 "h-1 rounded-full transition-all duration-500",
                                 state.step === i ? "w-8 bg-primary shadow-lg shadow-primary/20" : state.step > i ? "w-4 bg-primary/40" : "w-4 bg-muted-foreground/20"
                             )}
                         />
                     ))}
                 </div>
             </div>
         </div>
         )}
         
         {/* Content Card */}
         <div className="bg-card rounded-[2rem] md:rounded-[3rem] border-2 border-border/50 shadow-premium p-3 sm:p-6 md:p-8 min-h-[300px] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary/50 via-primary to-primary/50 opacity-20" />
             
             {!createdPlanId && !editedSuccess && state.step === 1 && renderStep1_Metadata()}
             {!createdPlanId && !editedSuccess && state.step === 2 && renderStep2_Split()}
             {!createdPlanId && !editedSuccess && state.step === 3 && renderStep3_DayEditor()}
             {!createdPlanId && !editedSuccess && state.step === 4 && renderStep4_Review()}
             
             {createdPlanId && renderActivationPrompt()}
             {editedSuccess && renderEditSuccess()}
         </div>

         {/* Unified Footer Controls - Hide if prompt is shown */}
         {!createdPlanId && !editedSuccess && (
         <div className="flex items-center justify-between px-2 pt-4 gap-4">
             <Button 
                 variant="ghost" 
                 size="lg" 
                 className="h-14 md:h-16 px-6 md:px-8 rounded-2xl md:rounded-[2rem] font-black text-base md:text-lg uppercase italic tracking-wider gap-2 md:gap-3 text-muted-foreground hover:text-foreground hover:bg-muted"
                 onClick={state.step === 1 ? onBack : () => setState(s => ({...s, step: s.step - 1}))}
             >
                 <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                 Back
             </Button>

             {state.step !== 4 && (
                 <Button 
                     size="lg" 
                     className="h-14 md:h-16 px-8 md:px-10 rounded-2xl md:rounded-[2rem] shadow-premium font-black text-lg md:text-xl uppercase italic tracking-wider gap-2 md:gap-3 group bg-primary text-white hover:scale-[1.02] transition-transform"
                     onClick={() => setState(s => ({...s, step: s.step + 1}))}
                     disabled={state.step === 1 && !state.metadata.name}
                 >
                     Next Step
                     <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                 </Button>
             )}
         </div>
         )}
     </div>
   );
}
