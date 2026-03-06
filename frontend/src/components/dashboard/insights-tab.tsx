import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { 
  TrendingUp, Trophy, Zap, Clock, Calendar, 
  ChevronUp, Info, AlertTriangle,
  Lightbulb, CheckCircle2, Target
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { cn } from "@/lib/utils";

interface InsightOverview {
  period: {
    start_date: string;
    end_date: string;
    range: string;
  };
  summary: {
    total_workouts: number;
    total_duration_minutes: number;
    completion_rate: number;
    current_streak_days: number;
    previous_period_comparison: {
      workouts_change_pct: number;
      duration_change_pct: number;
    };
  };
  strength_progress: {
    top_exercises: {
      exercise_id: string;
      exercise_name: string;
      one_rep_max: {
        current: number;
        previous: number;
        unit: string;
        change_pct: number;
      };
      volume_trend: { week: string; volume: number }[];
      new_pr: boolean;
    }[];
  };
  exercise_performance: {
    best_performing: {
      exercise_id: string;
      exercise_name: string;
      completion_rate: number;
      average_rpe: number;
    }[];
    needs_attention: {
      exercise_id: string;
      exercise_name: string;
      average_rpe: number;
      rep_drop_pct: number;
      reason: string;
    }[];
  };
  recovery_insights: {
    fatigue_score: number;
    recovery_quality: string;
    patterns: { insight: string; confidence: number }[];
    metrics: {
      avg_rpe_increase_per_set: number;
      avg_rep_decrease_per_set: number;
      avg_days_between_sessions: number;
    };
  };
  muscle_balance: {
    distribution: { muscle_group: string; percentage: number }[];
    imbalances: {
      muscle_group: string;
      issue: string;
      recommended_change: string;
    }[];
  };
  wellbeing_insights: {
    energy_trend: { date: string; energy_level: number }[];
    mood_performance_correlation: number;
    top_feedback_tags: string[];
  };
  ai_recommendations: {
    model_version: string;
    confidence_score: number;
    reason: string;
    generated_at: string;
  };
  action_items: {
    type: string;
    exercise_id?: string;
    exercise_name?: string;
    value?: number;
    unit?: string;
    reason: string;
  }[];
}

const MUSCLE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function InsightsTab() {
  const [data, setData] = useState<InsightOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/v1/insights/overview");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch insights", err);
        setError("Unable to load insights. Start some workouts to see your performance data!");
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return <InsightSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
          <Info className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-heading">No Insights Yet</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {error || "We're gathering data from your workouts to provide personal insights. Complete your first session to begin!"}
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 pb-24 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black font-heading tracking-tight">Performance <span className="text-primary italic">Vault</span></h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5 label-info">
            <Calendar className="w-3.5 h-3.5" />
            {data.period.range} progress • {new Date(data.period.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="hidden sm:block">
           <Zap className="w-10 h-10 text-primary opacity-20" />
        </div>
      </header>

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard 
          title="Workouts" 
          value={data.summary.total_workouts} 
          icon={<TrendingUp className="w-4 h-4" />}
          change={data.summary.previous_period_comparison.workouts_change_pct}
        />
        <StatCard 
          title="Minutes" 
          value={data.summary.total_duration_minutes} 
          icon={<Clock className="w-4 h-4" />}
          change={data.summary.previous_period_comparison.duration_change_pct}
        />
        <StatCard 
          title="Consistency" 
          value={`${Math.round(data.summary.completion_rate * 100)}%`} 
          icon={<Target className="w-4 h-4" />}
        />
        <StatCard 
          title="Streak" 
          value={`${data.summary.current_streak_days}d`} 
          icon={<Zap className="w-4 h-4 text-orange-500" />}
          isPositive={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Strength Matrix */}
        <Card className="lg:col-span-2 border-none shadow-premium bg-card overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold font-heading flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Strength Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.strength_progress.top_exercises[0]?.volume_trend || []}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#666'}} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#1a1a1a', color: '#fff' }}
                    itemStyle={{ color: '#8b5cf6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorVolume)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.strength_progress.top_exercises.map((ex) => (
                <div key={ex.exercise_id} className="p-3 rounded-xl bg-secondary/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold truncate max-w-[120px]">{ex.exercise_name}</p>
                    <div className="flex items-center gap-1">
                       <span className="text-[10px] text-muted-foreground uppercase">est. 1rm</span>
                       {ex.new_pr && <span className="bg-yellow-500/20 text-yellow-500 text-[8px] font-bold px-1.5 rounded-full">PR</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-primary">{ex.one_rep_max.current}{ex.one_rep_max.unit}</p>
                    <div className="flex items-center justify-end text-[10px] text-emerald-500 font-bold">
                      <ChevronUp className="w-3 h-3" />
                      {ex.one_rep_max.change_pct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Muscle Distribution */}
        <Card className="border-none shadow-premium bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-heading">Muscle Symmetry</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.muscle_balance.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="percentage"
                  >
                    {data.muscle_balance.distribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={MUSCLE_COLORS[index % MUSCLE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-4 space-y-2">
              {data.muscle_balance.distribution.slice(0, 4).map((m, i) => (
                <div key={m.muscle_group} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: MUSCLE_COLORS[i] }} />
                    <span className="font-medium">{m.muscle_group}</span>
                  </div>
                  <span className="text-muted-foreground">{m.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 4. Performance Insights */}
        <section className="space-y-4">
           <h2 className="text-xl font-bold font-heading px-1">Performance Nuances</h2>
           <div className="space-y-3">
              {data.exercise_performance.best_performing.map(ex => (
                <div key={ex.exercise_id} className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                      <p className="font-bold">{ex.exercise_name}</p>
                      <p className="text-xs text-emerald-600/80">Peak performance maintained with avg RPE {ex.average_rpe}</p>
                   </div>
                </div>
              ))}
              {data.exercise_performance.needs_attention.map(ex => (
                <div key={ex.exercise_id} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                      <AlertTriangle className="w-6 h-6" />
                   </div>
                   <div className="flex-1">
                      <p className="font-bold">{ex.exercise_name}</p>
                      <p className="text-xs text-amber-600/80">{ex.reason}</p>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* 5. AI Recommendations */}
        <section className="space-y-4">
           <h2 className="text-xl font-bold font-heading px-1 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Intelligence Center
           </h2>
           <Card className="border-none shadow-premium bg-linear-to-br from-primary/10 to-transparent">
              <CardContent className="p-6 space-y-4">
                 <div className="space-y-2">
                    <p className="text-sm font-medium leading-relaxed italic">
                      "{data.ai_recommendations.reason}"
                    </p>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] uppercase tracking-widest text-muted-foreground">confidence score</span>
                       <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${data.ai_recommendations.confidence_score * 100}%` }} 
                          />
                       </div>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-primary/10 space-y-3">
                    {data.action_items.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                         <div className="mt-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                            {idx + 1}
                         </div>
                         <div className="space-y-1">
                            <p className="text-sm font-bold">
                               {item.type === 'increase_weight' && `Increase ${item.exercise_name} by ${item.value}${item.unit}`}
                               {item.type === 'reduce_weight' && `Deload ${item.exercise_name}`}
                               {!['increase_weight', 'reduce_weight'].includes(item.type) && item.type.replace('_', ' ')}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.reason}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </section>
      </div>
      
      {/* 6. Recovery Footer */}
      <footer className="pt-8">
         <div className="flex flex-wrap gap-4 items-center justify-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50">
               <Info className="w-3.5 h-3.5" />
               Avg Rest: {data.recovery_insights.metrics.avg_days_between_sessions} days
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50">
               Fatigue Index: {Math.round(data.recovery_insights.fatigue_score * 100)}%
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50">
               Recovery: {data.recovery_insights.recovery_quality}
            </div>
         </div>
      </footer>
    </div>
  );
}

function StatCard({ title, value, icon, change, isPositive }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  change?: number;
  isPositive?: boolean;
}) {
  const trendingUp = change !== undefined ? change > 0 : isPositive;
  
  return (
    <Card className="border-none shadow-soft bg-card hover:translate-y-[-2px] transition-transform duration-300">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn(
              "text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center",
              trendingUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
            )}>
              {trendingUp ? '↑' : '↓'} {Math.abs(change)}%
            </div>
          )}
        </div>
        <div>
          <p className="text-xl sm:text-2xl font-black font-heading leading-none">{value}</p>
          <p className="text-[9px] sm:text-[10px] font-body text-muted-foreground uppercase tracking-wider mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
