from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime
import uuid

class UserWorkoutPlanBase(BaseModel):
    name: str
    status: str = "active"
    start_date: Optional[date] = None
    end_date: Optional[date] = None

class UserWorkoutPlanCreate(UserWorkoutPlanBase):
    user_id: uuid.UUID
    template_id: uuid.UUID

class UserWorkoutPlanUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    end_date: Optional[date] = None
    is_regular: Optional[bool] = None

class UserWorkoutPlanInDB(UserWorkoutPlanBase):
    id: uuid.UUID
    user_id: uuid.UUID
    template_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# create workout by user
class UserWorkoutBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    description: Optional[str] = None
    difficulty_level: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None
    target_muscle_groups: Optional[List[str]] = None
    workout_type: Optional[str] = None

class UserWorkoutCreate(UserWorkoutBase):
    user_id: uuid.UUID
    template_id: uuid.UUID

class UserWorkoutUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    difficulty_level: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None
    target_muscle_groups: Optional[str] = None
    workout_type: Optional[str] = None

class UserWorkoutInDB(UserWorkoutBase):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    template_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

# User Exercise Schemas (Editable copies of exercises)
class UserExerciseBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    workout_day: Optional[str] = None
    day_number: int
    exercise_name: str
    stage_of_exercises: Optional[str] = None
    sequence_order: int
    sets: Optional[int] = None
    reps: Optional[str] = None
    weight: Optional[float] = None
    rest_seconds: Optional[int] = None
    notes: Optional[str] = None
    workout_type: Optional[str] = None
    exercise_id: uuid.UUID

class UserExerciseCreate(UserExerciseBase):
    user_workout_id: uuid.UUID
    exercise_id: uuid.UUID

class UserExerciseUpdate(BaseModel):
    id: Optional[uuid.UUID] = None
    exercise_id: Optional[uuid.UUID] = None
    workout_day: Optional[str] = None
    day_number: Optional[int] = None
    exercise_name: Optional[str] = None
    stage_of_exercises: Optional[str] = None
    sequence_order: Optional[int] = None
    sets: Optional[int] = None
    reps: Optional[str] = None
    weight: Optional[float] = None
    rest_seconds: Optional[int] = None
    notes: Optional[str] = None
    workout_type: Optional[str] = None

class UserExerciseRepsSetUpdate(BaseModel):
    sets: Optional[int] = None
    reps: Optional[str] = None
    weight: Optional[float] = None
    rest_seconds: Optional[int] = None
    
class UserExerciseInDB(UserExerciseBase):
    id: uuid.UUID
    user_workout_id: uuid.UUID
    # exercise_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

# Combine User Workout and its Exercises
class UserWorkoutWithExercises(UserWorkoutInDB):
    exercises: List[UserExerciseInDB]

class UserWorkoutPlanResponse(UserWorkoutPlanInDB):
    template_exercises: List[UserExerciseInDB] = []

# Input schema for creating a custom user workout with exercises
class UserWorkoutCreateWithExercises(UserWorkoutBase):
    exercises: List[UserExerciseBase] 

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Weight Loss Fat Burn Plan",
                "description": "High-intensity cardio and circuit training focused on calorie burn and metabolic boost",
                "difficulty_level": "Intermediate",
                "estimated_duration_minutes": 45,
                "target_muscle_groups": ["Full Body", "Core", "Cardiovascular"],
                "workout_type": "Weight Loss",
                "exercises": [
                    {
                        "exercise_name": "Jump Rope",
                        "sequence_order": 1,
                        "reps": "60 sec",
                        "rest_seconds": 20,
                        "workout_type": "Weight Loss",
                        "exercise_id": "159905b6-1182-5760-aa11-f1c5a0cc7190",
                        "day_number": 1,
                        "stage_of_exercises": "warmup",
                        "sets": 3,
                        "weight": None,
                        "notes": "Weight Loss - Warmup: Focus on form and mobility"
                    },
                    {
                        "exercise_name": "Kettlebell Swings",
                        "sequence_order": 2,
                        "reps": "20",
                        "rest_seconds": 45,
                        "workout_type": "Weight Loss",
                        "exercise_id": "42ecc334-f79b-5a8a-99fe-894e9b640219",
                        "day_number": 1,
                        "stage_of_exercises": "main",
                        "sets": 4,
                        "weight": None,
                        "notes": "Weight Loss - Main: Focus on intensity and form"
                    },
                    {
                        "exercise_name": "Standing Quad Stretch",
                        "sequence_order": 1,
                        "reps": "30 sec",
                        "rest_seconds": 0,
                        "workout_type": "Weight Loss",
                        "exercise_id": "655345d3-664d-521b-9cd7-50ba40689ff1",
                        "day_number": 1,
                        "stage_of_exercises": "relax",
                        "sets": 2,
                        "weight": None,
                        "notes": "Weight Loss - Cool down: Focus on recovery"
                    },
                    {
                        "exercise_name": "Jump Rope",
                        "sequence_order": 1,
                        "reps": "60 sec",
                        "rest_seconds": 20,
                        "workout_type": "Weight Loss",
                        "exercise_id": "159905b6-1182-5760-aa11-f1c5a0cc7190",
                        "day_number": 2,
                        "stage_of_exercises": "recovery",
                        "sets": 3,
                        "weight": None,
                        "notes": "Weight Loss - Warmup: Focus on form and mobility"
                    }
                ]
            }
        }
    )

# session
class SessionWorkoutCompleteInput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    status: Optional[str] = None
    energy_level: Optional[int] = None
    mood: Optional[str] = None
    notes: Optional[str] = None

class SessionExerciseCompleteInput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    feedback_type: Optional[str] = "good"  # too_easy, too_hard, good, form_issue
    workout_sets: int
    workout_reps: int
    workout_weight: Optional[float] = None
    workout_time: Optional[float] = 30



