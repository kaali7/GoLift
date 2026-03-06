import { useState, useEffect } from "react";
import { sessionService } from "@/lib/session-service";
import type { SessionExercise } from "@/lib/session-service";
import { SessionOverview } from "./session-overview";
import { ExerciseExecution } from "./exercise-execution";
import { RestFeedbackCombined } from "./rest-feedback-combined";
import { WorkoutCompletion } from "./workout-completion";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutSessionFlowProps {
  onBack: () => void;
  initialExercises?: SessionExercise[];
  autoStart?: boolean;
}

export type SessionStep = "overview" | "execution" | "rest_feedback" | "completion";

export function WorkoutSessionFlow({ onBack, initialExercises, autoStart }: WorkoutSessionFlowProps) {
  const [exercises, setExercises] = useState<SessionExercise[]>(initialExercises || []);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [step, setStep] = useState<SessionStep>("overview");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [exerciseSessionId, setExerciseSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialExercises);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (autoStart && step === "overview" && exercises.length > 0 && !sessionId && !loading) {
      handleStartWorkout();
    }
  }, [autoStart, exercises, loading, sessionId, step]);

  useEffect(() => {
    if (!initialExercises) {
      const loadExercises = async () => {
        try {
          const data = await sessionService.getActiveWorkoutPlan();
          if (Array.isArray(data)) {
            setExercises(data);
          } else {
            console.warn("Active workout plan is not an array (likely completed):", data);
            setExercises([]);
          }
        } catch (error) {
          console.error("Failed to load exercises", error);
        } finally {
          setLoading(false);
        }
      };
      loadExercises();
    }
  }, [initialExercises]);

  const handleStartWorkout = async () => {
    setLoading(true);
    try {
      const response = await sessionService.startWorkoutPlan();
      setSessionId(response.session_id);
      setStartTime(Date.now());
      
      // Start the first exercise immediately after starting workout
      await handleStartExercise(0, response.session_id);
      setStep("execution");
    } catch (error) {
      console.error("Failed to start workout", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExercise = async (index: number, sessId: string | null = sessionId) => {
    if (!sessId) return;
    const exercise = exercises[index];
    try {
      const response = await sessionService.startExercise(sessId, exercise.sequence_order);
      setExerciseSessionId(response.exercise_session_id);
    } catch (error) {
      console.error("Failed to start exercise", error);
    }
  };

  const handleExerciseComplete = () => {
    setStep("rest_feedback");
  };

  const handleRestFeedbackComplete = async (feedback: { feedback_type: "too_easy" | "too_hard" | "good" | "form_issue"; feedback?: string }) => {
    if (exerciseSessionId) {
      const currentEx = exercises[currentExerciseIndex];
      try {
        await sessionService.submitExerciseFeedback(exerciseSessionId, {
          feedback_type: feedback.feedback_type,
          workout_sets: currentEx.sets || 1,
          workout_reps: parseInt(currentEx.reps) || 10,
          workout_weight: currentEx.weight,
          workout_time: 30 
        });
      } catch (error) {
        console.error("Failed to submit feedback", error);
      }
    }
    
    if (currentExerciseIndex < exercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      setLoading(true);
      try {
        await handleStartExercise(nextIndex);
        setStep("execution");
      } finally {
        setLoading(false);
      }
    } else {
      await handleFinishWorkout();
    }
  };


  const handleFinishWorkout = async () => {
    setLoading(true);
    try {
      if (sessionId) {
        await sessionService.completeWorkout(sessionId, {
          status: "completed"
        });
      }
      setStep("completion");
    } catch (error) {
      console.error("Failed to complete workout", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === "overview") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-3/4 animate-pulse rounded-xl" />
        <Skeleton className="h-64 w-full animate-pulse rounded-2xl" />
        <Skeleton className="h-16 w-full animate-pulse rounded-full" />
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="w-full mx-auto min-h-dvh flex flex-col">
      {step === "overview" && (
        <SessionOverview 
          exercises={exercises} 
          onStart={handleStartWorkout} 
          onBack={onBack} 
        />
      )}
      {step === "execution" && currentExercise && (
        <ExerciseExecution 
          exercise={currentExercise} 
          totalExercises={exercises.length}
          currentNumber={currentExerciseIndex + 1}
          onComplete={handleExerciseComplete} 
        />
      )}
      {step === "rest_feedback" && (
        <RestFeedbackCombined 
          duration={60} 
          onComplete={handleRestFeedbackComplete} 
        />
      )}
      {step === "completion" && (
        <WorkoutCompletion 
          onDone={onBack} 
          metrics={{
            exercisesCompleted: exercises.length,
            timeSpent: startTime ? Math.round((Date.now() - startTime) / 60000) : 0
          }}
        />
      )}
    </div>
  );
}
