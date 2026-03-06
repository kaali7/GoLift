from pydantic import BaseModel, HttpUrl, ConfigDict
from typing import Optional, List, Union
from datetime import datetime   
import uuid

class ExerciseBase(BaseModel):
    name: str
    body_part: Optional[str] = None
    target_muscle: Optional[str] = None
    muscle_group: Optional[str] = None
    equipment: Optional[str] = None
    difficulty_level: Optional[str] = None
    description: Optional[str] = None
    instructions: Optional[str] = None
    tutorial_url: Optional[str] = None
    icon: Optional[str] = None
    difficulty_reason: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ExerciseCreate(ExerciseBase):
    pass

class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    muscle_group: Optional[str] = None
    equipment: Optional[str] = None
    difficulty_level: Optional[str] = None
    description: Optional[str] = None
    tutorial_url: Optional[str] = None
    is_active: Optional[bool] = None

class ExerciseInDB(ExerciseBase):
    id: uuid.UUID
    is_active: Optional[bool] = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class WorkoutTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    difficulty_level: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None
    target_muscle_groups: Optional[List[str]] = None
    workout_type: Optional[str] = None

class WorkoutTemplateCreate(WorkoutTemplateBase):
    pass

class WorkoutTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    difficulty_level: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None
    target_muscle_groups: Optional[List[str]] = None
    workout_type: Optional[str] = None

class WorkoutTemplateInDB(WorkoutTemplateBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkoutTemplateWithExercises(WorkoutTemplateInDB):
    model_config = ConfigDict(from_attributes=True)
    template_exercises: List[TemplateExerciseInDB]


# ------------ Exercise present in Templates -------------#

class TemplateExerciseBase(BaseModel):
    day_number: int
    exercise_name: str
    stage_of_exercises: str
    sequence_order: int
    sets: int
    reps: str 
    weight: Optional[int] = None  
    rest_seconds: int
    notes:  Optional[str] = None
    workout_type: str

    model_config = ConfigDict(from_attributes=True)

class TemplateExerciseCreate(TemplateExerciseBase):
    template_id: uuid.UUID
    exercise_id: uuid.UUID

class TemplateExerciseUpdate(BaseModel):
    day_number: Optional[int] = None
    exercise_name: Optional[str] = None
    stage_of_exercises: Optional[str] = None
    sequence_order: Optional[int] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight: Optional[int] = None
    rest_seconds: Optional[int] = None
    notes: Optional[str] = None
    workout_type: Optional[str] = None

class TemplateExerciseInDB(TemplateExerciseBase):
    id: uuid.UUID
    template_id: uuid.UUID
    exercise_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserExerciseInDB(TemplateExerciseBase):
    id: uuid.UUID
    user_workout_id: uuid.UUID
    exercise_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# combine of workout_plan and exercise data
class WorkoutPlanExerciseInDB(BaseModel):
    exercise_session_id : uuid.UUID
    workout_plan_data : Union[TemplateExerciseInDB, UserExerciseInDB]
    exercise_data : ExerciseInDB

    model_config = ConfigDict(from_attributes=True)
    
