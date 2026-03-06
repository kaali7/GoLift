import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/axios";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PlanDetails } from "./plan-details";
import { UserCircle, Dumbbell, PlusCircle, Ruler, Weight, Activity, MoreVertical, Edit2, Trash2, Eye, Trophy } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface WorkoutPlan {
  id: string;
  name: string;
  status: string;
  created_at: string;
  description?: string;
}

interface UserProfileData {
  height_cm: number;
  weight_kg: number;
  date_of_birth?: string;
  gender?: string;
  fitness_level?: string;
  primary_goal?: string;
  experience_months?: number;
}

interface BodyMetricsData {
  measurement_date: string;
  body_fat_pct: number;
  muscle_mass_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  notes?: string;
}



export function ProfileTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  
  // Workout State
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(false);

  // Profile & Metrics State
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetricsData | null>(null);

  // Deletion State
  const [deleteModalPlanId, setDeleteModalPlanId] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    try {
      const [profileRes, metricsRes] = await Promise.all([
        api.get("/v1/users/me/profile").catch(() => ({ data: null })),
        api.get("/v1/users/me/body-metrics").catch(() => ({ data: null }))
      ]);
      setProfile(profileRes.data);
      setBodyMetrics(metricsRes.data);
    } catch (err) {
      console.error("Failed to fetch profile or metrics", err);
    }
  }, []);

  const fetchWorkouts = useCallback(async () => {
    try {
        setLoadingWorkouts(true);
        const res = await api.get("/v1/workout/get_all");
        setWorkouts(res.data);
    } catch (err) {
        console.error("Failed to fetch workouts", err);
    } finally {
        setLoadingWorkouts(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkouts();
    fetchProfileData();
  }, [fetchWorkouts, fetchProfileData]);

  // No longer needed as DashboardPage handles onboarding popup
  // useEffect(() => {
  //   // Auto-redirect for new users with incomplete profile
  //   if (profileDataLoaded && profile) {
  //     const isIncomplete = !profile.height_cm || !profile.weight_kg || profile.height_cm === 0 || profile.weight_kg === 0;
  //     if (isIncomplete) {
  //       navigate("/settings?tab=profile");
  //     }
  //   }
  // }, [profile, profileDataLoaded, navigate]);

  const handleOpenSettings = (tab: string = "profile") => {
    navigate(`/settings?tab=${tab}`);
  };

  const handleDeletePlan = async (id: string) => {
    try {
        await api.delete(`/v1/workout/${id}`);
        fetchWorkouts();
        setDeleteModalPlanId(null);
    } catch (err) {
        console.error("Failed to delete plan", err);
        alert("Failed to delete plan. Please try again.");
    }
  };

  const handleEditPlan = (id: string) => {
    navigate(`/training?mode=user&editId=${id}`);
  };

  if (!user) return null;

  if (planId) {
    return <PlanDetails planId={planId} onBack={() => setSearchParams({})} />;
  }

  return (
    <div className="p-0 space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Profile Header & Settings */}
      <div className="space-y-6">
        <header className="flex flex-row items-center gap-6 md:gap-8 p-6 md:p-8 rounded-[2rem] bg-card border border-border/50 shadow-premium relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-lg text-primary overflow-hidden shrink-0">
               <UserCircle className="w-16 h-16 md:w-20 md:h-20" />
            </div>
          </div>

          <div className="text-left flex-1 space-y-2 md:space-y-3 relative">
            <div>
              <h1 className="text-xl md:text-4xl font-black font-heading italic uppercase tracking-tighter leading-none mb-1">{user.full_name}</h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground font-body font-medium truncate max-w-[200px] md:max-w-none">{user.email}</p>
            </div>
            <div className="flex flex-col items-start gap-1.5 md:gap-3 md:flex-row md:items-center">
               
               {/* Gender - Mobile: Line 1, Desktop: Item 2 */}
               {profile?.gender && (
                 <div className="order-1 md:order-2 flex items-center gap-3">
                   <div className="h-3 w-[1.5px] bg-border/30 hidden md:block" />
                   <div className="flex items-center gap-1.5 text-muted-foreground/80">
                     <UserCircle className="w-3.5 h-3.5 text-primary/60" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{profile.gender}</span>
                   </div>
                 </div>
               )}

               {/* Goal - Mobile: Line 2, Desktop: Item 3 */}
               {profile?.primary_goal && (
                 <div className="order-2 md:order-3 flex items-center gap-3">
                   <div className="h-3 w-[1.5px] bg-border/30 hidden md:block" />
                   <div className="flex items-center gap-1.5 text-muted-foreground/80">
                     <Trophy className="w-3.5 h-3.5 text-primary/60" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{profile.primary_goal.replace('_', ' ')}</span>
                   </div>
                 </div>
               )}

               {/* Status & Active - Mobile: Line 3, Desktop: Item 1 */}
               <div className="order-3 md:order-1 flex items-center gap-3">
                  <Badge variant="secondary" className="px-3 md:px-4 py-1.5 font-bold rounded-full bg-primary/10 text-primary border-none text-[9px] md:text-[10px] lowercase leading-none h-6 flex items-center justify-center">
                    {user.membership_status || "pending"}
                  </Badge>
                  <div className="h-3 w-[1.5px] bg-border/30 hidden sm:block" />
                  <div className="flex items-center gap-1.5 text-muted-foreground/80">
                    <Activity className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                      {Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} Days Active
                    </span>
                  </div>
               </div>

            </div>
          </div>

        </header>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black font-heading uppercase tracking-tighter">Body Metrics</h3>
          <Button 
            onClick={() => handleOpenSettings("metrics")}
            variant="outline"
            size="sm"
            className="rounded-xl font-bold"
          >
            <Eye className="w-4 h-4 mr-2" />
            Manage Metrics
          </Button>
        </div>

        <section className="grid grid-cols-3 gap-3 md:gap-4">
            <Card className="rounded-[1.25rem] border-none shadow-soft bg-blue-50/30 dark:bg-blue-900/10 p-3.5 space-y-2 relative group text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-800/30 flex items-center justify-center text-blue-600">
                    <Ruler className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[8px] font-black text-blue-600/70 uppercase tracking-[0.15em] mb-0.5">Height</p>
                   <p className="text-lg font-black font-heading leading-none">{profile?.height_cm || "0"}<span className="text-[10px] font-bold ml-0.5">cm</span></p>
                </div>
            </Card>
            <Card className="rounded-[1.25rem] border-none shadow-soft bg-purple-50/30 dark:bg-purple-900/10 p-3.5 space-y-2 relative group text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-800/30 flex items-center justify-center text-purple-600">
                    <Weight className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[8px] font-black text-purple-600/70 uppercase tracking-[0.15em] mb-0.5">Weight</p>
                   <p className="text-lg font-black font-heading leading-none">{profile?.weight_kg || "0"}<span className="text-[10px] font-bold ml-0.5">kg</span></p>
                </div>
            </Card>
            <Card className="rounded-[1.25rem] border-none shadow-soft bg-green-50/30 dark:bg-green-900/10 p-3.5 space-y-2 relative overflow-hidden group text-center flex flex-col items-center">
                <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-800/30 flex items-center justify-center text-green-600">
                    <Activity className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[8px] font-black text-green-600/70 uppercase tracking-[0.15em] mb-0.5">Body Fat</p>
                   <p className="text-lg font-black font-heading leading-none">
                     {bodyMetrics?.body_fat_pct || (profile?.height_cm && profile?.weight_kg && profile?.date_of_birth && profile?.gender ? (() => {
                        const heightInM = profile.height_cm / 100;
                        const bmi = profile.weight_kg / (heightInM * heightInM);
                        const age = new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear();
                        const sex = profile.gender === "male" ? 1 : 0;
                        return Math.round(((1.20 * bmi) + (0.23 * age) - (10.8 * sex) - 5.4) * 10) / 10;
                     })() : "0")}
                     <span className="text-[10px] font-bold ml-0.5">%</span>
                   </p>
                </div>
            </Card>
        </section>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* Workouts Section */}
        <div className="lg:col-span-12 space-y-8">
            <div className="flex items-center justify-between pl-1">
                <div className="space-y-1">
                    <h2 className="text-lg md:text-2xl font-black font-heading uppercase tracking-tighter flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 md:w-6 md:h-6 text-primary" /> My Training Plans
                    </h2>
                    <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Manage and track your custom routines</p>
                </div>
                <Button onClick={() => navigate("/training?mode=create")} className="rounded-2xl h-9 px-4 text-xs md:h-11 md:px-6 md:text-sm font-bold shadow-premium">
                    <PlusCircle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" /> New Plan
                </Button>
            </div>

            {loadingWorkouts ? (
                <div className="text-center py-10 text-muted-foreground">Loading workouts...</div>
            ) : workouts.length === 0 ? (
                <Card className="border-dashed bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-10 space-y-4">
                        <Dumbbell className="w-10 h-10 text-muted-foreground/50" />
                        <div className="text-center">
                            <p className="font-medium">No workout plans yet</p>
                            <p className="text-sm text-muted-foreground">Create your first plan to get started.</p>
                        </div>
                        <Button onClick={() => navigate("/training?mode=create")}>Create Plan</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {workouts.map(plan => (
                        <Card 
                            key={plan.id} 
                            className={cn(
                                "rounded-2xl border-none transition-all shadow-soft group border cursor-pointer relative",
                                plan.status === 'active' 
                                    ? "bg-primary text-white shadow-premium scale-[1.02] border-primary z-20" 
                                    : "bg-card hover:bg-surface border-border/50 z-0 hover:z-10"
                            )}
                            onClick={() => setSearchParams({ planId: plan.id })}
                        >
                            {plan.status === 'active' && <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none rounded-2xl" />}
                            <div className="p-4 md:p-5 flex items-center justify-between relative">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-colors",
                                        plan.status === 'active' ? "bg-white/20 text-white" : "bg-muted/30 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                    )}>
                                        <Dumbbell className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={cn(
                                                "font-black font-heading text-base md:text-xl italic uppercase tracking-tighter leading-none transition-colors",
                                                plan.status === 'active' ? "text-white" : "group-hover:text-primary"
                                            )}>{plan.name}</p>
                                            {plan.status === 'active' && (
                                                <Badge className="bg-white/20 text-white border-white/30 rounded-full text-[8px] uppercase font-black tracking-widest px-2 py-0.5 backdrop-blur-md">Active</Badge>
                                            )}
                                            <Badge 
                                              variant="outline" 
                                              className={cn(
                                                "text-[8px] h-4 px-1.5 uppercase font-black tracking-widest leading-none border-none",
                                                plan.status === 'active' 
                                                    ? "bg-white/10 text-white" 
                                                    : plan.description?.toLowerCase().includes('ml') ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" 
                                                    : plan.description?.toLowerCase().includes('template') ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                                                    : "bg-muted/50 text-muted-foreground"
                                              )}
                                            >
                                                {plan.description?.toLowerCase().includes('ml') ? 'AI' : plan.description?.toLowerCase().includes('template') ? 'Temp' : 'User'}
                                            </Badge>
                                        </div>
                                        <p className={cn("text-xs font-medium", plan.status === 'active' ? "text-white/70" : "text-muted-foreground")}>
                                            {plan.description || "Custom workout routine"}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    {plan.status === 'active' && (
                                        <Button 
                                            size="sm" 
                                            className="rounded-xl font-bold bg-white/20 text-white backdrop-blur-md hover:bg-white hover:text-primary border border-white/20 transition-all px-6 hidden sm:flex" 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigate("/training");
                                            }}
                                        >
                                            Start
                                        </Button>
                                    )}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className={cn(
                                                "h-10 w-10 rounded-xl transition-colors",
                                                plan.status === 'active' ? "text-white hover:bg-white/10" : "text-muted-foreground hover:bg-muted/50"
                                            )}>
                                                <MoreVertical className="w-5 h-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl p-2 w-48 shadow-xl border-border/50">
                                            <DropdownMenuItem className="rounded-lg gap-3 font-bold py-2.5 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleEditPlan(plan.id); }}>
                                                <Edit2 className="w-4 h-4 text-primary" /> Edit Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-lg gap-3 font-bold py-2.5 text-destructive cursor-pointer" onClick={(e) => { e.stopPropagation(); setDeleteModalPlanId(plan.id); }}>
                                                <Trash2 className="w-4 h-4" /> Delete Plan
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>

        <ConfirmDialog 
          isOpen={!!deleteModalPlanId}
          title="Delete Workout Plan"
          description="Are you sure you want to delete this workout routine? This action cannot be undone."
          confirmLabel="Delete Plan"
          onConfirm={() => deleteModalPlanId && handleDeletePlan(deleteModalPlanId)}
          onCancel={() => setDeleteModalPlanId(null)}
          variant="destructive"
        />

      </div>
    </div>
  );
}
