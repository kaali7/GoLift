import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  Dumbbell, 
  Target, 
  Layers, 
  Trophy, 
  Info,
  ExternalLink
} from "lucide-react";

interface ExerciseDetail {
  id: string;
  name: string;
  body_part?: string;
  target_muscle?: string;
  muscle_group?: string;
  equipment?: string;
  difficulty_level?: string;
  description?: string;
  instructions?: string;
  tutorial_url?: string;
  icon?: string;
  difficulty_reason?: string;
  created_at: string;
  is_active: boolean;
}

export function ExerciseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseDetail = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/v1/exercise/get?exercise_id=${id}`);
        setExercise(res.data);
      } catch (err) {
        console.error("Failed to fetch exercise details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetail();
  }, [id]);

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl p-6 space-y-8 animate-pulse">
        <Skeleton className="h-10 w-24 rounded-full" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 rounded-xl" />
          <Skeleton className="h-6 w-1/2 rounded-lg" />
        </div>
        <Skeleton className="aspect-video w-full rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Info className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black font-heading">Exercise Not Found</h1>
        <p className="text-muted-foreground max-w-xs">The exercise you're looking for doesn't exist or has been removed.</p>
        <Button variant="outline" onClick={handleBack}>Go Back</Button>
      </div>
    );
  }

  // Extract video ID from tutorial_url if it's a YouTube link
  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const embedUrl = getYoutubeEmbedUrl(exercise.tutorial_url);

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 pb-24 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={handleBack} 
          className="rounded-full pl-2 pr-4 hover:bg-primary/10 hover:text-primary transition-all group"
        >
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-foreground">{exercise.name}</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 pointer-events-none capitalize">
              {exercise.difficulty_level || "Unknown"}
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground font-body max-w-2xl">
            Focus on your <span className="text-primary font-bold">{exercise.target_muscle || exercise.body_part}</span> with this highly effective movement.
          </p>
        </div>
      </header>

      {/* Video / Visual Section */}
      <section className="relative group">
        {embedUrl ? (
          <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-border bg-black">
            <iframe
              src={embedUrl}
              title={exercise.name}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : exercise.icon ? (
            <div className="aspect-video w-full rounded-3xl bg-muted/30 flex items-center justify-center overflow-hidden border border-border">
                <img src={exercise.icon} alt={exercise.name} className="max-w-xs object-contain" />
            </div>
        ) : (
          <div className="aspect-video w-full rounded-3xl bg-linear-to-br from-primary/5 to-primary/10 flex flex-col items-center justify-center space-y-4 border border-primary/20">
            <Dumbbell className="w-16 h-16 text-primary/40 animate-pulse" />
            <p className="text-muted-foreground font-medium">No video tutorial available</p>
          </div>
        )}
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-none bg-muted/30 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <Target className="w-6 h-6 text-primary" />
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Target</p>
                    <p className="font-bold font-heading text-sm">{exercise.target_muscle || "General"}</p>
                </div>
            </CardContent>
          </Card>
          <Card className="border-none bg-muted/30 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <Layers className="w-6 h-6 text-primary" />
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Group</p>
                    <p className="font-bold font-heading text-sm">{exercise.muscle_group || "Various"}</p>
                </div>
            </CardContent>
          </Card>
          <Card className="border-none bg-muted/30 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <Dumbbell className="w-6 h-6 text-primary" />
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Equipment</p>
                    <p className="font-bold font-heading text-sm">{exercise.equipment || "Bodyweight"}</p>
                </div>
            </CardContent>
          </Card>
          <Card className="border-none bg-muted/30 shadow-sm">
            <CardContent className="p-4 flex flex-col items-center text-center space-y-2">
                <Trophy className="w-6 h-6 text-primary" />
                <div className="space-y-0.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Level</p>
                    <p className="font-bold font-heading text-sm capitalize">{exercise.difficulty_level || "All"}</p>
                </div>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <section className="space-y-4">
                <h3 className="text-2xl font-black font-heading flex items-center gap-2">
                   <Info className="w-6 h-6 text-primary" /> Instructions
                </h3>
                <Card className="border-none bg-card shadow-soft overflow-hidden">
                    <CardContent className="p-6">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-body">
                            {exercise.instructions || exercise.description || "No specific instructions provided for this exercise yet. Focus on slow, controlled movements and proper breathing."}
                        </p>
                    </CardContent>
                </Card>
            </section>

            {exercise.difficulty_reason && (
                <section className="space-y-4">
                    <h3 className="text-2xl font-black font-heading flex items-center gap-2 text-primary">
                       <Sparkles className="w-6 h-6" /> Why it's {exercise.difficulty_level}?
                    </h3>
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                         <p className="text-muted-foreground font-body italic leading-relaxed">
                            "{exercise.difficulty_reason}"
                         </p>
                    </div>
                </section>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary text-xs font-bold">1</div>
                        <p className="text-sm font-body">Warm up properly before starting.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary text-xs font-bold">2</div>
                        <p className="text-sm font-body">Maintain core stability throughout.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-primary text-xs font-bold">3</div>
                        <p className="text-sm font-body">Use a mirror to check your form.</p>
                    </div>
                </CardContent>
            </Card>

            {exercise.tutorial_url && (
                <Button variant="outline" className="w-full gap-2 rounded-xl group" asChild>
                    <a href={exercise.tutorial_url} target="_blank" rel="noopener noreferrer">
                        Watch on YouTube <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                </Button>
            )}
        </div>
      </div>
    </div>
  );
}

// Sparkles icon for some flair
function Sparkles({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/>
            <path d="M19 17v4"/>
            <path d="M3 5h4"/>
            <path d="M17 19h4"/>
        </svg>
    )
}
