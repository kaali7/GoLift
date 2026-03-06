from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import date, datetime
import uuid

class UserBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    full_name: Optional[str] = None
    role: str = "member"    # we have three :  member, trainer, admin

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    membership_status: Optional[str] = None
    theme: Optional[str] = None

class UserInDB(UserBase):
    id: uuid.UUID
    membership_status: Optional[str] = "pending"   # we have three :  active, expired, pending
    theme: Optional[str] = "system"

    is_verified: bool = False
    verification_code: Optional[str] = None
    verification_code_expires_at: Optional[datetime] = None
    reset_token: Optional[str] = None
    reset_token_expires_at: Optional[datetime] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class UserProfileBase(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    fitness_level: Optional[str] = None
    primary_goal: Optional[str] = None
    experience_months: int = 0

class UserProfileCreate(UserProfileBase):
    user_id: uuid.UUID

class UserProfileUpdate(BaseModel):
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    height_cm: Optional[float] = None
    weight_kg: Optional[float] = None
    fitness_level: Optional[str] = None
    primary_goal: Optional[str] = None
    experience_months: Optional[int] = None

class UserProfileInDB(UserProfileBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class BodyMeasurementBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    measurement_date: date
    body_fat_pct: Optional[float] = None
    muscle_mass_kg: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hips_cm: Optional[float] = None
    notes: Optional[str] = None

class BodyMeasurementCreate(BodyMeasurementBase):
    user_id: uuid.UUID

class BodyMeasurementUpdate(BaseModel):
    body_fat_pct: Optional[float] = None
    muscle_mass_kg: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hips_cm: Optional[float] = None
    notes: Optional[str] = None

class BodyMeasurementInDB(BodyMeasurementBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class InsightBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    exercise_id: uuid.UUID
    exercise_name: Optional[str] = None
    one_rep_max_kg: float
    training_volume_kg: float
    personal_record_date: Optional[date] = None

class InsightResponse(BaseModel):
    total_workouts: int
    total_weight_lifted_kg: float
    top_exercises: List[InsightBase]
    recent_progress: List[InsightBase]
