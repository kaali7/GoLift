from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import date, datetime
import uuid

class MLModelBase(BaseModel):
    name: str
    model_type: Optional[str] = None
    version: str
    training_data_until: Optional[date] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    model_path: Optional[str] = None
    is_active: bool = True

class MLModelCreate(MLModelBase):
    pass

class MLModelUpdate(BaseModel):
    name: Optional[str] = None
    model_type: Optional[str] = None
    version: Optional[str] = None
    training_data_until: Optional[date] = None
    performance_metrics: Optional[Dict[str, Any]] = None
    model_path: Optional[str] = None
    is_active: Optional[bool] = None

class MLModelInDB(MLModelBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExerciseRecommendationBase(BaseModel):
    recommended_sets: Optional[int] = None
    recommended_reps: Optional[int] = None
    recommended_weight_kg: Optional[float] = None
    confidence_score: Optional[float] = None
    reason: Optional[str] = None
    accepted: bool = False

class ExerciseRecommendationCreate(ExerciseRecommendationBase):
    user_id: uuid.UUID
    exercise_id: uuid.UUID
    model_id: uuid.UUID
    scheduled_workout_id: Optional[uuid.UUID] = None

class ExerciseRecommendationUpdate(BaseModel):
    accepted: Optional[bool] = None

class ExerciseRecommendationInDB(ExerciseRecommendationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    exercise_id: uuid.UUID
    scheduled_workout_id: Optional[uuid.UUID] = None
    model_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True