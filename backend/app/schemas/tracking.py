from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

class WorkoutSetBase(BaseModel):
    set_number: int
    planned_weight_kg: Optional[float] = None
    actual_weight_kg: Optional[float] = None
    planned_reps: Optional[int] = None
    completed_reps: Optional[int] = None
    rest_seconds_actual: Optional[int] = None
    rpe_score: Optional[float] = None
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None

class WorkoutSetCreate(WorkoutSetBase):
    session_exercise_id: uuid.UUID

class WorkoutSetUpdate(BaseModel):
    actual_weight_kg: Optional[float] = None
    completed_reps: Optional[int] = None
    rest_seconds_actual: Optional[int] = None
    rpe_score: Optional[float] = None
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None

class WorkoutSetInDB(WorkoutSetBase):
    id: uuid.UUID
    session_exercise_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserFeedbackBase(BaseModel):
    feedback_type: Optional[str] = None
    rating: Optional[int] = None
    comments: Optional[str] = None

class UserFeedbackCreate(UserFeedbackBase):
    user_id: uuid.UUID
    exercise_id: Optional[uuid.UUID] = None
    workout_set_id: Optional[uuid.UUID] = None

class UserFeedbackUpdate(BaseModel):
    feedback_type: Optional[str] = None
    rating: Optional[int] = None
    comments: Optional[str] = None

class UserFeedbackInDB(UserFeedbackBase):
    id: uuid.UUID
    user_id: uuid.UUID
    exercise_id: Optional[uuid.UUID] = None
    workout_set_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserProgressBase(BaseModel):
    one_rep_max_kg: Optional[float] = None
    training_volume_kg: Optional[float] = None
    personal_record_date: Optional[datetime] = None
    last_performed_date: Optional[datetime] = None

class UserProgressCreate(UserProgressBase):
    user_id: uuid.UUID
    exercise_id: uuid.UUID

class UserProgressUpdate(BaseModel):
    one_rep_max_kg: Optional[float] = None
    training_volume_kg: Optional[float] = None
    personal_record_date: Optional[datetime] = None
    last_performed_date: Optional[datetime] = None

class UserProgressInDB(UserProgressBase):
    id: uuid.UUID
    user_id: uuid.UUID
    exercise_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True