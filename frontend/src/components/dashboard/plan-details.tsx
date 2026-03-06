import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Moon } from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  exercise_id: string;
  exercise_name: string;
  stage_of_exercises: string;
  sets: number;
  reps: string;
  weight: number | null;
  workout_type: string;
  sequence_order: number;
  day_number: number;
}

interface PlanDetailsType {
  id: string;
  name: string;
  description?: string;
  status?: string;
  template_exercises?: Exercise[];
}

export function PlanDetails({ planId, onBack }: { planId?: string, onBack?: () => void }) {
    const { id: routeId } = useParams<{ id: string }>();
    const id = planId || routeId;
    const navigate = useNavigate();
    const [plan, setPlan] = useState<PlanDetailsType | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPlan = useCallback(async () => {
        if (!id) return;
        try {
           const res = await api.get(`/v1/workout/${id}`);
           setPlan(res.data);
        } catch (err) {
            console.error("Failed to fetch plan details", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPlan();
    }, [fetchPlan]);

    const handleActivate = async () => {
        if (!id) return;
        try {
            await api.post(`/v1/workout/${id}/activate`);
            fetchPlan();
        } catch (err) {
            console.error("Failed to activate plan", err);
        }
    };

    const handleDeactivate = async () => {
        if (!id) return;
        try {
            await api.post(`/v1/workout/${id}/deactivate`);
            fetchPlan();
        } catch (err) {
            console.error("Failed to deactivate plan", err);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse">Loading plan details...</div>;
    if (!plan) return <div className="p-10 text-center text-muted-foreground">Plan not found.</div>;

    const exercises = plan.template_exercises || []; 
    const days = Array.from(new Set(exercises.map(e => e.day_number))).sort((a,b) => a-b);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate("/profile");
        }
    };

    if (days.length === 0) {
        return (
             <div className="max-w-4xl mx-auto p-6 space-y-6">
                <Button variant="ghost" onClick={handleBack} className="mb-4 pl-0 hover:pl-2 transition-all">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="text-center p-10 border border-dashed rounded-xl">
                    <h2 className="text-2xl font-bold font-heading">{plan.name}</h2>
                    <p className="text-muted-foreground">{plan.description}</p>
                    <p className="mt-4 text-sm text-muted-foreground">No preview data available for this plan.</p>
                </div>
             </div>
        )
    }

    if (selectedDay !== null) {
        const dayExs = exercises.filter(e => e.day_number === selectedDay);
        return (
             <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
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
                    {dayExs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 bg-muted/20 rounded-3xl border-2 border-dashed border-muted text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                <Moon className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-bold font-heading italic uppercase">Rest Day</h4>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                    No exercises scheduled for this day. Enjoy your rest!
                                </p>
                            </div>
                        </div>
                    ) : (
                        (() => {
                            const stages = ["warmup", "main", "relax", "recovery"];
                            const matchedIds = new Set<string>();
                            const sections = stages.map(stage => {
                                const stageData = dayExs.filter(ex => {
                                    const match = (ex.stage_of_exercises || "").toLowerCase() === stage;
                                    if (match) matchedIds.add(ex.id || ex.sequence_order.toString());
                                    return match;
                                });
                                if (stageData.length === 0) return null;
                                return (
                                    <section key={stage} className="space-y-3">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pl-1">{stage}</h3>
                                        {stageData.map(ex => (
                                            <div 
                                                key={ex.id || ex.sequence_order} 
                                                className="bg-card p-4 rounded-xl border flex items-center justify-between shadow-sm cursor-pointer hover:bg-primary/5 transition-colors"
                                                onClick={() => navigate(`/exercise/${ex.exercise_id}`)}
                                            >
                                                <div>
                                                    <p className="font-bold font-heading">{ex.exercise_name}</p>
                                                    <p className="text-xs text-muted-foreground">{ex.sets} sets × {ex.reps}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </section>
                                );
                            });

                            const otherExs = dayExs.filter(ex => !matchedIds.has(ex.id || ex.sequence_order.toString()));
                            if (otherExs.length > 0) {
                                sections.push(
                                    <section key="other" className="space-y-3">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pl-1">General</h3>
                                        {otherExs.map(ex => (
                                            <div 
                                                key={ex.id || ex.sequence_order} 
                                                className="bg-card p-4 rounded-xl border flex items-center justify-between shadow-sm cursor-pointer hover:bg-primary/5 transition-colors"
                                                onClick={() => navigate(`/exercise/${ex.exercise_id}`)}
                                            >
                                                <div>
                                                    <p className="font-bold font-heading">{ex.exercise_name}</p>
                                                    <p className="text-xs text-muted-foreground">{ex.sets} sets × {ex.reps}</p>
                                                </div>
                                            </div>
                                        ))}
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

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <div>
                     <h1 className="text-3xl font-black font-heading tracking-tight">{plan.name}</h1>
                     <p className="text-muted-foreground">{plan.description || "Weekly Schedule"}</p>
                </div>
             </div>

             <div className="grid gap-4 grid-cols-1">
                 {days.map(day => {
                      const dayExs = exercises.filter(e => e.day_number === day);
                      const isRecovery = dayExs.some(e => e.stage_of_exercises === 'recovery');
                      return (
                          <Card 
                            key={day} 
                            className={`cursor-pointer hover:border-primary/50 transition-all ${isRecovery ? 'bg-green-50/50 border-green-100' : 'bg-card'}`}
                            onClick={() => setSelectedDay(day)}
                          >
                              <CardHeader className="pb-2">
                                  <CardTitle className="text-base flex justify-between items-center">
                                      Day {day}
                                      {isRecovery && <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">Recovery</Badge>}
                                  </CardTitle>
                              </CardHeader>
                              <CardContent>
                                  <p className="text-sm text-muted-foreground">{dayExs.length} Exercises</p>
                              </CardContent>
                          </Card>
                      )
                 })}
             </div>

             {/* Action Button */}
             <div className="fixed bottom-24 left-0 right-0 px-6 flex justify-center pointer-events-none">
                <Button 
                    size="lg" 
                    className={cn(
                        "rounded-2xl px-12 h-14 font-bold shadow-2xl pointer-events-auto transition-all transform active:scale-95",
                        plan.status === 'active' ? "bg-red-500 hover:bg-red-600 text-white" : "bg-primary hover:bg-primary/90"
                    )}
                    onClick={plan.status === 'active' ? handleDeactivate : handleActivate}
                >
                    {plan.status === 'active' ? (
                        <span className="flex items-center gap-2">
                             Deactivate This Plan
                        </span>
                    ) : "Activate This Plan"}
                </Button>
             </div>
        </div>
    );
}
