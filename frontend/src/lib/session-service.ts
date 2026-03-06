import api from "./axios";

export interface SessionExercise {
  id: string;
  exercise_name: string;
  stage_of_exercises: string;
  sets: number;
  reps: string;
  weight: number;
  sequence_order: number;
}

export interface SessionFeedbackInput {
  feedback_type: "too_easy" | "too_hard" | "good" | "form_issue";
  workout_sets: number;
  workout_reps: number;
  workout_weight?: number;
  workout_time?: number;
}

export interface CompleteWorkoutInput {
  status: string;
  energy_level?: number;
  mood?: string;
  notes?: string;
}

export const sessionService = {
  getActiveWorkoutPlan: async () => {
    const response = await api.get<SessionExercise[] | { status: string; message: string }>("/v1/session/active");
    return response.data;
  },

  startWorkoutPlan: async () => {
    const response = await api.get<{ session_id: string; workout_plan_id: string }>("/v1/session/start");
    return response.data;
  },

  startExercise: async (sessionId: string, orderId: number) => {
    const response = await api.post<{ exercise_session_id: string }>(`/v1/session/${sessionId}/${orderId}/start`);
    return response.data;
  },

  submitExerciseFeedback: async (exerciseSessionId: string, input: SessionFeedbackInput) => {
    const response = await api.post(`/v1/session/${exerciseSessionId}/complete_feedback`, input);
    return response.data;
  },

  completeWorkout: async (sessionId: string, input: CompleteWorkoutInput) => {
    const response = await api.post(`/v1/session/complete?session_id=${sessionId}`, input);
    return response.data;
  }
};
